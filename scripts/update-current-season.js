// Descarga de la UEFA la temporada en curso de la Champions: partidos de
// todas las rondas (previas incluidas), clasificación de la fase de liga y
// máximos goleadores y asistentes. Lo guarda en public/data/current-season.json
// y descarga a public/images/teams/ el escudo de los equipos que no lo tienen.
// Lo ejecutan los workflows update-data.yml (cada día) y
// update-current-season.yml (cada media hora los días de partido); en local:
// npm run update-current-season
const fs = require('fs');
const path = require('path');
const { buildCurrentSeason, currentSeasonYear } = require('./current-season');

const ROOT = path.join(__dirname, '..', 'public');
const OUTPUT = path.join(ROOT, 'data', 'current-season.json');
const LOGOS_DIR = path.join(ROOT, 'images', 'teams');
const HEADERS = { 'User-Agent': 'champions-league-app (https://github.com/ReneM21/champions-league-app)' };
const PAGE_SIZE = 100;

async function getJson(url, attempt = 1) {
  const response = await fetch(url, { headers: HEADERS });
  if (response.ok) return response.json();
  if (attempt < 4 && response.status >= 500) {
    await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt));
    return getJson(url, attempt + 1);
  }
  throw new Error(`${response.status} en ${url}: ${(await response.text()).slice(0, 200)}`);
}

async function allMatches(seasonYear) {
  const matches = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const params = new URLSearchParams({ competitionId: '1', seasonYear: String(seasonYear), limit: String(PAGE_SIZE), offset: String(offset), order: 'ASC' });
    const page = await getJson(`https://match.uefa.com/v5/matches?${params}`);
    if (!Array.isArray(page)) throw new Error(`Respuesta inesperada de los partidos: ${JSON.stringify(page).slice(0, 200)}`);
    matches.push(...page);
    if (page.length < PAGE_SIZE) return matches;
  }
}

async function ranking(seasonYear, stats) {
  const params = new URLSearchParams({
    competitionId: '1',
    seasonYear: String(seasonYear),
    phase: 'TOURNAMENT',
    stats: stats.join(','),
    limit: '50',
    offset: '0',
    order: 'DESC',
    optionalFields: 'PLAYER,TEAM',
  });
  const rows = await getJson(`https://compstats.uefa.com/v1/player-ranking?${params}`);
  return Array.isArray(rows) ? rows : [];
}

// Escudo pequeño (70x70) de cada equipo; solo se descargan los que faltan
async function saveLogos(rawMatches, groups, rows) {
  fs.mkdirSync(LOGOS_DIR, { recursive: true });
  const urls = new Map();
  const add = (team) => team && team.id && team.logoUrl && !team.isPlaceHolder && urls.set(String(team.id), team.logoUrl);
  rawMatches.forEach((m) => [m.homeTeam, m.awayTeam].forEach(add));
  groups.forEach((g) => (g.items || []).forEach((item) => add(item.team)));
  rows.forEach((row) => add(row.team));
  const logos = {};
  for (const [id, url] of urls) {
    const file = path.join(LOGOS_DIR, `${id}.png`);
    if (!fs.existsSync(file)) {
      const response = await fetch(url, { headers: HEADERS });
      if (response.ok && (response.headers.get('content-type') || '').startsWith('image/')) {
        fs.writeFileSync(file, Buffer.from(await response.arrayBuffer()));
      } else {
        console.log(`No se pudo descargar el escudo ${id}: ${response.status}`);
      }
    }
    if (fs.existsSync(file)) logos[id] = `images/teams/${id}.png`;
  }
  return logos;
}

async function main() {
  const seasonYear = Number(process.env.SEASON_YEAR) || currentSeasonYear();
  const rawMatches = await allMatches(seasonYear);
  if (!rawMatches.length) {
    console.log(`La temporada ${seasonYear} todavía no tiene partidos: no se cambia nada.`);
    return;
  }
  const standingsResponse = await getJson(`https://standings.uefa.com/v1/standings?competitionId=1&seasonYear=${seasonYear}`);
  const groups = Array.isArray(standingsResponse) ? standingsResponse : [];
  const scorerRows = await ranking(seasonYear, ['goals', 'assists', 'matches_appearance']);
  const assistRows = await ranking(seasonYear, ['assists', 'goals', 'matches_appearance']);
  const logos = await saveLogos(rawMatches, groups, [...scorerRows, ...assistRows]);

  const data = buildCurrentSeason({ seasonYear, rawMatches, groups, scorerRows, assistRows, logos });
  const finished = data.matches.filter((m) => m.status === 'FINISHED').length;
  console.log(`Temporada ${data.season}: ${data.matches.length} partidos (${finished} jugados), ${data.rounds.length} rondas, ${Object.keys(data.teams).length} equipos.`);
  console.log(`Clasificación: ${data.standings.map((g) => `${g.name} (${g.rows.length} equipos)`).join(', ') || 'todavía no hay'}.`);
  console.log(`Goleadores: ${data.scorers.slice(0, 3).map((p) => `${p.name} ${p.goals}`).join(', ')}. Asistentes: ${data.assisters.slice(0, 3).map((p) => `${p.name} ${p.assists}`).join(', ')}.`);

  // Comprobaciones: si la UEFA devuelve algo raro no se pisan los datos buenos
  const previous = fs.existsSync(OUTPUT) ? JSON.parse(fs.readFileSync(OUTPUT, 'utf8')) : null;
  if (previous && previous.seasonYear === seasonYear) {
    const before = previous.matches.filter((m) => m.status === 'FINISHED').length;
    if (finished < before) throw new Error(`Hay menos partidos jugados que antes (${finished} < ${before}): no se guarda nada.`);
    if (data.matches.length < previous.matches.length) throw new Error(`Hay menos partidos que antes (${data.matches.length} < ${previous.matches.length}): no se guarda nada.`);
  }

  const { updatedAt, ...previousData } = previous || {};
  if (previous && JSON.stringify(previousData) === JSON.stringify(data)) {
    console.log('Sin cambios.');
    return;
  }
  fs.writeFileSync(OUTPUT, `${JSON.stringify({ updatedAt: new Date().toISOString(), ...data }, null, 2)}\n`);
  console.log(`Guardado ${path.relative(process.cwd(), OUTPUT)}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
