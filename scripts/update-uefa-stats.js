// Descarga de la UEFA (compstats.uefa.com, los datos de uefa.com) los
// partidos, goles y asistencias por temporada y club de todos los jugadores
// de los rankings, y los guarda en public/data/uefa-seasons.json.
// La app los usa para las vistas Equipos y Temporadas de cada jugador.
// Lo ejecuta el workflow .github/workflows/update-data.yml; en local:
// npm run update-uefa-stats
const fs = require('fs');
const path = require('path');
const { FIRST_SEASON_YEAR, STATS, isoBirthdate, isPlayer, seasonFromRow, sortSeasons, totals } = require('./uefa-stats');

const DATA = path.join(__dirname, '..', 'public', 'data');
const OUTPUT = path.join(DATA, 'uefa-seasons.json');
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

// Todos los jugadores que jugaron una temporada (la API pagina de 100 en 100)
async function seasonRows(year) {
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
  const profiles = readJson(path.join(DATA, 'profiles.json'), {});
  const byId = new Map();
  for (const row of rankings.flatMap((r) => r.players)) {
    if (byId.has(row.id)) continue;
    const birthdate = (manual.get(row.id) || {}).birthdate || (profiles[row.id] || {}).birthdate;
    byId.set(row.id, { id: row.id, name: row.name, birthdate: isoBirthdate(birthdate) });
  }
  return [...byId.values()];
}

async function main() {
  const players = targets();
  const missingBirthdate = players.filter((p) => !p.birthdate);
  if (missingBirthdate.length) console.log(`Sin fecha de nacimiento (no se pueden identificar): ${missingBirthdate.map((p) => p.name).join(', ')}`);

  const result = Object.fromEntries(players.map((p) => [p.id, { uefaId: null, seasons: [] }]));
  const lastYear = new Date().getUTCFullYear() + 1;
  for (let year = FIRST_SEASON_YEAR; year <= lastYear; year++) {
    const rows = await seasonRows(year);
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
    console.log(`${year}: ${rows.length} jugadores, ${found} temporada(s) de los nuestros`);
  }

  // Resumen para comparar con los totales de los rankings de Wikipedia
  const goals = new Map(readJson(path.join(DATA, 'all-goals.json'), []).map((p) => [p.id, p]));
  const assists = new Map(readJson(path.join(DATA, 'all-assists.json'), []).map((p) => [p.id, p]));
  const notFound = [];
  for (const player of players) {
    const entry = result[player.id];
    entry.seasons = sortSeasons(entry.seasons);
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
  const output = { source: 'https://www.uefa.com/uefachampionsleague/history/', players: result };
  if (previous && JSON.stringify(previous.players) === JSON.stringify(result)) {
    console.log('Sin cambios.');
  } else {
    fs.writeFileSync(OUTPUT, `${JSON.stringify({ updatedAt: new Date().toISOString(), ...output }, null, 2)}\n`);
    console.log(`Guardado ${path.relative(process.cwd(), OUTPUT)}.`);
  }

  if (notFound.length) {
    console.error(`No encontrados en la UEFA: ${notFound.join(', ')}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
