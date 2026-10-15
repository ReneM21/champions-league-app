// Funciones puras para leer las estadísticas oficiales de la UEFA
// (compstats.uefa.com): partidos, goles y asistencias de cada jugador en cada
// temporada de la Champions League, con su club. update-uefa-stats.js hace las descargas.

// El parámetro seasonYear de la API cambia de criterio en 2007: hasta 2006 es
// el año en que empieza la temporada (2006 = 2006-07) y desde 2008 el año en
// que termina (2008 = 2007-08). 2007 no devuelve nada. Comprobado con las
// temporadas reales de Cristiano Ronaldo, Messi y Raúl.
const FIRST_SEASON_YEAR = 1992; // 1992-93, la primera Champions League
const SKIPPED_YEARS = [2007];
// La UEFA registra las asistencias desde la temporada 2001-02
const FIRST_ASSISTS_START = 2001;

// Año en que empieza la temporada de un seasonYear de la API
const startYear = (year) => (year <= 2006 ? year : year - 1);

// seasonYear de la API -> "2013-14"
const seasonLabel = (year) => {
  const start = startYear(year);
  return `${start}-${String((start + 1) % 100).padStart(2, '0')}`;
};

// Todos los seasonYear que hay que pedir, de 1992-93 a la temporada lastYear
const seasonYears = (lastYear) => {
  const years = [];
  for (let year = FIRST_SEASON_YEAR; year <= lastYear; year++) if (!SKIPPED_YEARS.includes(year)) years.push(year);
  return years;
};

const STATS = ['matches_appearance', 'goals', 'assists'];

// Nombres cortos de la UEFA -> nombres que ya usa la app (players.json)
const CLUB_NAMES = {
  'Man Utd': 'Manchester United',
  'Man City': 'Manchester City',
  Paris: 'Paris Saint-Germain',
  'Paris Saint-Germain': 'Paris Saint-Germain',
  Dortmund: 'Borussia Dortmund',
  'B. Dortmund': 'Borussia Dortmund',
  PSV: 'PSV Eindhoven',
  Leverkusen: 'Bayer Leverkusen',
  Atleti: 'Atlético de Madrid',
  'Atlético Madrid': 'Atlético de Madrid',
  Tottenham: 'Tottenham Hotspur',
  Spurs: 'Tottenham Hotspur',
  'Bayern München': 'Bayern München',
  Bayern: 'Bayern München',
  'Salzburg': 'Salzburg',
  'Olympique Lyonnais': 'Lyon',
  Hamburg: 'Hamburgo',
  'Crvena Zvezda': 'Estrella Roja',
  FCSB: 'Steaua de Bucarest',
  'GNK Dinamo': 'Dinamo Zagreb',
  'D. Zagreb': 'Dinamo Zagreb',
  Inter: 'Inter de Milán',
  Milan: 'AC Milan',
};

const clubName = (team) => {
  const name = (team && team.internationalName) || '';
  return CLUB_NAMES[name] || name;
};

// "Raúl González" -> ["raul", "gonzalez"]
const nameTokens = (name) =>
  (name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((token) => token.length > 1);

// "29/11/1973" -> "1973-11-29"
const isoBirthdate = (date) => {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(date || '');
  return match ? `${match[3]}-${match[2]}-${match[1]}` : null;
};

// Una fila de la UEFA es el jugador si coincide la fecha de nacimiento y
// comparten alguna palabra del nombre ("Xavi" / "Xavi Hernández").
function isPlayer(row, target) {
  const player = row && row.player;
  if (!player || !target.birthdate || player.birthDate !== target.birthdate) return false;
  const tokens = new Set(nameTokens(target.name));
  return nameTokens(player.internationalName).some((token) => tokens.has(token));
}

const statValue = (row, name) => {
  const stat = (row.statistics || []).find((s) => s.name === name);
  return stat ? Number(stat.value) : 0;
};

// Fila de la UEFA -> temporada en el formato de players.json
function seasonFromRow(row, year) {
  const matches = statValue(row, 'matches_appearance');
  if (!matches) return null;
  return {
    year,
    teamId: row.team && row.team.id,
    season: seasonLabel(year),
    club: clubName(row.team),
    matches,
    goals: statValue(row, 'goals'),
    assists: startYear(year) >= FIRST_ASSISTS_START ? statValue(row, 'assists') : null,
  };
}

// La clasificación de una temporada da una fila por jugador, con el último
// club en el que jugó: si cambió de club a mitad de temporada (permitido
// desde 2018-19), suma lo de los dos. Para detectarlo se buscan los clubes
// de la temporada anterior y la siguiente que no coinciden con el de esta;
// la API permite filtrar por club (teamId) para separar las cifras.
function splitCandidates(seasons) {
  const sorted = sortSeasons(seasons);
  const candidates = [];
  sorted.forEach((season, i) => {
    const neighbours = [sorted[i - 1], sorted[i + 1]].filter((s) => s && s.teamId !== season.teamId);
    for (const teamId of new Set(neighbours.map((s) => s.teamId))) candidates.push({ season, teamId });
  });
  return candidates;
}

// Desde 2018-19 un jugador puede jugar la Champions con dos clubes en la
// misma temporada (antes no estaba permitido)
const FIRST_SPLIT_START = 2018;

const GENERIC_WORDS = new Set(['fc', 'cf', 'ac', 'sc', 'afc', 'club', 'de', 'del', 'the']);
const clubTokens = (name) => nameTokens(name).filter((token) => !GENERIC_WORDS.has(token));

// "Salzburg" (UEFA) es "Red Bull Salzburg" (Wikipedia): todas las palabras del
// nombre de la UEFA están en el de Wikipedia
function sameClub(wikiName, uefaName) {
  const wiki = new Set(clubTokens(wikiName));
  const uefa = clubTokens(uefaName);
  return uefa.length > 0 && uefa.every((token) => wiki.has(token));
}

// Otra pista de cambio de club: un club de la lista de Wikipedia del jugador
// que no aparece en ninguna de sus temporadas de la UEFA, pero sí jugó la
// competición en una de sus temporadas desde 2018-19.
// teamsByYear: { [seasonYear]: [{ id, name }] } con los equipos de cada temporada.
function missingClubCandidates(seasons, wikiClubs = [], teamsByYear = {}) {
  const missing = wikiClubs.filter((club) => !seasons.some((s) => sameClub(club, s.club)));
  const candidates = [];
  for (const season of seasons) {
    if (Number(season.season.slice(0, 4)) < FIRST_SPLIT_START) continue;
    for (const team of teamsByYear[season.year] || []) {
      if (team.id !== season.teamId && missing.some((club) => sameClub(club, clubName({ internationalName: team.name })))) {
        candidates.push({ season, teamId: team.id });
      }
    }
  }
  return candidates;
}

// Clubes cuyo escudo se descarga aunque ningún jugador de los rankings haya
// jugado en ellos: los que aparecen en las páginas Equipos y Temporadas.
const EXTRA_CLUBS = ['Real Madrid', 'AC Milan', 'Bayern München', 'Liverpool', 'Barcelona', 'Ajax', 'Chelsea', 'Manchester City', 'Paris Saint-Germain', 'Tottenham Hotspur', 'Juventus', 'Borussia Dortmund', 'Inter de Milán', 'Manchester United'];

// "Paris Saint-Germain" -> "paris-saint-germain" (nombre del archivo del escudo)
const clubSlug = (name) => nameTokens(name).join('-');

// Líderes de una temporada: máximo goleador y máximo asistente (con empates)
// y número de equipos de la fase final
function seasonLeaders(rows, year) {
  const best = (stat) => {
    const values = rows.map((row) => ({ row, value: statValue(row, stat) }));
    const max = Math.max(0, ...values.map((v) => v.value));
    if (!max) return [];
    return values
      .filter((v) => v.value === max)
      .map(({ row, value }) => ({ name: row.player.internationalName, club: clubName(row.team), [stat]: value }))
      .sort((a, b) => a.name.localeCompare(b.name));
  };
  return {
    topScorers: best('goals'),
    topAssists: startYear(year) >= FIRST_ASSISTS_START ? best('assists') : null,
    teams: new Set(rows.filter((row) => row.team && statValue(row, 'matches_appearance')).map((row) => row.team.id)).size,
  };
}

// Los n mejores de una temporada en goles o asistencias (con partidos)
function seasonTop(rows, stat, n = 10) {
  return rows
    .map((row) => ({
      name: row.player && row.player.internationalName,
      club: clubName(row.team),
      [stat]: statValue(row, stat),
      matches: statValue(row, 'matches_appearance'),
    }))
    .filter((row) => row.name && row[stat] > 0)
    .sort((a, b) => b[stat] - a[stat] || a.matches - b.matches || a.name.localeCompare(b.name))
    .slice(0, n);
}

// Suma los goles de cada jugador en cada club (era Champions, desde 1992-93)
function addClubGoals(totals, rows) {
  for (const row of rows) {
    const goals = statValue(row, 'goals');
    if (!goals || !row.team || !row.player) continue;
    const club = clubName(row.team);
    if (!totals.has(club)) totals.set(club, new Map());
    const players = totals.get(club);
    const current = players.get(row.playerId) || { name: row.player.internationalName, goals: 0 };
    current.goals += goals;
    players.set(row.playerId, current);
  }
  return totals;
}

// Los n máximos goleadores de un club
const clubTopScorers = (totals, club, n = 3) =>
  [...((totals.get(club) || new Map()).values())].sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name)).slice(0, n);

// Nombre de la UEFA que corresponde a un club de la app: el mismo, o uno cuyas
// palabras están todas en el nombre ("Malmö" para "Malmö FF")
function findUefaClub(name, uefaNames) {
  if (uefaNames.includes(name)) return name;
  return uefaNames.find((uefaName) => sameClub(name, uefaName)) || null;
}

// Quita los campos internos antes de guardar
const publicSeason = ({ year, teamId, ...season }) => season;

const sortSeasons = (seasons) =>
  [...seasons].sort((a, b) => a.season.localeCompare(b.season) || a.club.localeCompare(b.club));

// Suma por club (para comprobar totales y para la vista de equipos)
function totals(seasons) {
  const sum = (key) => seasons.reduce((total, s) => total + (s[key] || 0), 0);
  return { matches: sum('matches'), goals: sum('goals'), assists: sum('assists') };
}

module.exports = {
  FIRST_ASSISTS_START,
  STATS,
  seasonLabel,
  seasonYears,
  clubName,
  nameTokens,
  isoBirthdate,
  isPlayer,
  seasonFromRow,
  sortSeasons,
  splitCandidates,
  sameClub,
  missingClubCandidates,
  publicSeason,
  EXTRA_CLUBS,
  clubSlug,
  seasonLeaders,
  seasonTop,
  addClubGoals,
  clubTopScorers,
  findUefaClub,
  totals,
};
