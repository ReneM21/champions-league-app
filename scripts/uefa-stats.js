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
    .replace(/[̀-ͯ]/g, '')
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
  publicSeason,
  totals,
};
