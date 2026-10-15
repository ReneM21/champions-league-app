// Descarga de la UEFA (compstats.uefa.com, los datos de uefa.com) los
// partidos, goles y asistencias por temporada y club de todos los jugadores
// de los rankings, y los guarda en public/data/uefa-seasons.json. También
// descarga el escudo de sus clubes a public/images/clubs/ (public/data/clubs.json).
// La app los usa para las vistas Equipos y Temporadas de cada jugador.
// Lo ejecuta el workflow .github/workflows/update-data.yml; en local:
// npm run update-uefa-stats
const fs = require('fs');
const path = require('path');
const { seasonLabel, seasonYears, STATS, isoBirthdate, isPlayer, seasonFromRow, sortSeasons, splitCandidates, missingClubCandidates, publicSeason, EXTRA_CLUBS, clubName, clubSlug, seasonLeaders, addClubGoals, clubTopScorers, findUefaClub, totals } = require('./uefa-stats');

const DATA = path.join(__dirname, '..', 'public', 'data');
const OUTPUT = path.join(DATA, 'uefa-seasons.json');
const CLUBS_FILE = path.join(DATA, 'clubs.json');
const LOGOS_DIR = path.join(__dirname, '..', 'public', 'images', 'clubs');
const API = 'https://compstats.uefa.com/v1/player-ranking';
const PAGE_SIZE = 100;
const HEADERS = { 'User-Agent': 'champions-league-app (https://github.com/ReneM21/champions-league-app)' };

const readJson = (file, fallback) => (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback);

async function getJson(url, attempt = 1) {
  const response = await fetch(url, { headers: HEADERS });
  if (response.ok) return response.json();
  if (attempt < 4 && response.status >= 500) {
    await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt));
    return getJson(url, attempt + 1);
  }
  throw new Error(`${response.status} en ${url}: ${(await response.text()).slice(0, 200)}`);
}

// Todos los jugadores que jugaron una temporada (la API pagina de 100 en 100).
// Con teamId, solo los de ese club.
async function seasonRows(year, teamId) {
  const rows = new Map();
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const params = new URLSearchParams({
      competitionId: '1',
      limit: String(PAGE_SIZE),
      offset: String(offset),
      optionalFields: 'PLAYER,TEAM',
      order: 'DESC',
      phase: 'TOURNAMENT',
      seasonYear: String(year),
      stats: STATS.join(','),
      ...(teamId ? { teamId } : {}),
    });
    const page = await getJson(`${API}?${params}`);
    if (!Array.isArray(page)) throw new Error(`Respuesta inesperada en ${year}: ${JSON.stringify(page).slice(0, 200)}`);
    for (const row of page) rows.set(`${row.playerId}-${row.team && row.team.id}`, row);
    if (page.length < PAGE_SIZE) break;
  }
  return [...rows.values()];
}

// Jugadores con página en la app y su fecha de nacimiento para identificarlos
function targets() {
  const rankings = [readJson(path.join(DATA, 'ranking.json'), { players: [] }), readJson(path.join(DATA, 'assists.json'), { players: [] })];
  const manual = new Map(readJson(path.join(DATA, 'players.json'), []).map((p) => [p.id, p]));
  // Clubes de cada jugador según Wikipedia, para detectar cambios de club a mitad de temporada
  const tables = [...readJson(path.join(DATA, 'all-goals.json'), []), ...readJson(path.join(DATA, 'all-assists.json'), [])];
  const clubsOf = (id) => [...new Set(tables.concat(rankings.flatMap((r) => r.players)).filter((p) => p.id === id).flatMap((p) => p.clubs || []))];
  const profiles = readJson(path.join(DATA, 'profiles.json'), {});
  const byId = new Map();
  for (const row of rankings.flatMap((r) => r.players)) {
    if (byId.has(row.id)) continue;
    const birthdate = (manual.get(row.id) || {}).birthdate || (profiles[row.id] || {}).birthdate;
    byId.set(row.id, { id: row.id, name: row.name, birthdate: isoBirthdate(birthdate), clubs: clubsOf(row.id) });
  }
  return [...byId.values()];
}

async function main() {
  const players = targets();
  const missingBirthdate = players.filter((p) => !p.birthdate);
  if (missingBirthdate.length) console.log(`Sin fecha de nacimiento (no se pueden identificar): ${missingBirthdate.map((p) => p.name).join(', ')}`);

  const result = Object.fromEntries(players.map((p) => [p.id, { uefaId: null, seasons: [] }]));
  const teamsByYear = {};
  const logos = new Map(); // nombre del club -> URL del escudo (el más reciente)
  const leaders = {}; // temporada -> máximo goleador, máximo asistente y equipos
  const clubGoals = new Map(); // club -> goles de cada jugador en la era Champions
  for (const year of seasonYears(new Date().getUTCFullYear() + 1)) {
    const rows = await seasonRows(year);
    const teams = new Map(rows.filter((r) => r.team).map((r) => [r.team.id, { id: r.team.id, name: r.team.internationalName }]));
    teamsByYear[year] = [...teams.values()];
    for (const row of rows) {
      const logo = row.team && (row.team.mediumLogoUrl || row.team.logoUrl);
      if (logo) logos.set(clubName(row.team), logo);
    }
    if (rows.length) leaders[seasonLabel(year)] = seasonLeaders(rows, year);
    addClubGoals(clubGoals, rows);
    let found = 0;
    for (const player of players) {
      for (const row of rows.filter((r) => isPlayer(r, player))) {
        const season = seasonFromRow(row, year);
        if (!season) continue;
        result[player.id].uefaId = row.playerId;
        result[player.id].seasons.push(season);
        found++;
      }
    }
    console.log(`${seasonLabel(year)} (seasonYear ${year}): ${rows.length} jugadores, ${found} temporada(s) de los nuestros`);
  }

  // Jugadores que cambiaron de club a mitad de temporada: se separan las cifras
  for (const player of players) {
    const entry = result[player.id];
    const candidates = [...splitCandidates(entry.seasons), ...missingClubCandidates(entry.seasons, player.clubs, teamsByYear)];
    const seen = new Set();
    for (const { season, teamId } of candidates) {
      const key = `${season.season}-${teamId}`;
      if (seen.has(key) || !entry.seasons.includes(season)) continue;
      seen.add(key);
      const [other] = (await seasonRows(season.year, teamId)).filter((r) => isPlayer(r, player));
      const otherSeason = other && seasonFromRow(other, season.year);
      if (!otherSeason) continue;
      const [own] = (await seasonRows(season.year, season.teamId)).filter((r) => isPlayer(r, player));
      const ownSeason = own && seasonFromRow(own, season.year);
      if (!ownSeason) continue;
      console.log(`${player.name} ${season.season}: ${otherSeason.club} (${otherSeason.matches} partidos) + ${ownSeason.club} (${ownSeason.matches} partidos)`);
      entry.seasons = entry.seasons.filter((s) => s !== season).concat(otherSeason, ownSeason);
    }
  }

  // Resumen para comparar con los totales de los rankings de Wikipedia
  const goals = new Map(readJson(path.join(DATA, 'all-goals.json'), []).map((p) => [p.id, p]));
  const assists = new Map(readJson(path.join(DATA, 'all-assists.json'), []).map((p) => [p.id, p]));
  const notFound = [];
  for (const player of players) {
    const entry = result[player.id];
    entry.seasons = sortSeasons(entry.seasons).map(publicSeason);
    if (!entry.seasons.length) {
      notFound.push(player.name);
      continue;
    }
    const sum = totals(entry.seasons);
    const ranking = { ...(goals.get(player.id) || {}), ...(assists.get(player.id) || {}) };
    console.log(
      `${player.name}: ${entry.seasons.length} temporadas · ${sum.matches} partidos · ${sum.goals} goles · ${sum.assists} asistencias` +
        ` (Wikipedia: ${ranking.matches ?? '?'} partidos · ${goals.get(player.id)?.goals ?? '?'} goles · ${assists.get(player.id)?.assists ?? '?'} asistencias)`
    );
  }

  if (notFound.length === players.length) {
    console.error('No se encontró a ningún jugador: no se guarda nada.');
    process.exit(1);
  }

  const previous = readJson(OUTPUT, null);
  const output = { source: 'https://www.uefa.com/uefachampionsleague/history/', players: result, leaders };
  if (previous && JSON.stringify(previous.players) === JSON.stringify(result) && JSON.stringify(previous.leaders) === JSON.stringify(leaders)) {
    console.log('Sin cambios.');
  } else {
    fs.writeFileSync(OUTPUT, `${JSON.stringify({ updatedAt: new Date().toISOString(), ...output }, null, 2)}\n`);
    console.log(`Guardado ${path.relative(process.cwd(), OUTPUT)}.`);
  }

  await saveClubs(result, logos, clubGoals);

  if (notFound.length) {
    console.error(`No encontrados en la UEFA: ${notFound.join(', ')}`);
    process.exit(1);
  }
}

// Clubes de los jugadores, de las finales y de la clasificación histórica
// (public/data/competition.json): escudo y máximos goleadores en la era
// Champions. Solo se descargan los escudos que faltan.
async function saveClubs(result, logos, clubGoals) {
  const competition = readJson(path.join(DATA, 'competition.json'), { finals: [], allTime: [] });
  const wanted = new Set([
    ...Object.values(result).flatMap((p) => p.seasons.map((s) => s.club)),
    ...EXTRA_CLUBS,
    ...competition.finals.flatMap((f) => [f.winner, f.runnerUp]),
    ...competition.allTime.map((c) => c.club),
  ]);
  const uefaNames = [...logos.keys()];
  const clubs = {};
  fs.mkdirSync(LOGOS_DIR, { recursive: true });
  for (const name of [...wanted].sort()) {
    const uefaName = findUefaClub(name, uefaNames);
    if (!uefaName) {
      console.log(`Sin datos de la UEFA (no ha jugado la Champions desde 1992): ${name}`);
      continue;
    }
    const club = {};
    const file = `${clubSlug(name)}.png`;
    if (!fs.existsSync(path.join(LOGOS_DIR, file))) {
      const response = await fetch(logos.get(uefaName), { headers: HEADERS });
      if (response.ok && (response.headers.get('content-type') || '').startsWith('image/')) {
        fs.writeFileSync(path.join(LOGOS_DIR, file), Buffer.from(await response.arrayBuffer()));
        console.log(`Escudo descargado: ${name}${uefaName !== name ? ` (${uefaName})` : ''}`);
      } else {
        console.log(`No se pudo descargar el escudo de ${name}: ${response.status}`);
      }
    }
    if (fs.existsSync(path.join(LOGOS_DIR, file))) club.logo = `images/clubs/${file}`;
    const scorers = clubTopScorers(clubGoals, uefaName);
    if (scorers.length) club.topScorers = scorers;
    clubs[name] = club;
  }
  fs.writeFileSync(CLUBS_FILE, `${JSON.stringify(clubs, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
