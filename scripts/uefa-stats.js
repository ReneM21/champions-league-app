// Funciones puras para leer las estadísticas oficiales de la UEFA
// (compstats.uefa.com): partidos, goles y asistencias de cada jugador en cada
// temporada de la Champions League, con su club. update-uefa-stats.js hace las descargas.

// Primera temporada de la Champions League (1992-93) y primera con asistencias
// registradas por la UEFA (2000-01). Las temporadas se nombran por el año en
// que terminan: seasonYear 2014 = 2013-14.
const FIRST_SEASON_YEAR = 1993;
const FIRST_ASSISTS_YEAR = 2001;

const STATS = ['matches_appearance', 'goals', 'assists'];

// 2014 -> "2013-14"
const seasonLabel = (year) => `${year - 1}-${String(year % 100).padStart(2, '0')}`;

// Nombres cortos de la UEFA -> nombres que ya usa la app (players.json)
const CLUB_NAMES = {
  'Man Utd': 'Manchester United',
  'Man City': 'Manchester City',
  Paris: 'Paris Saint-Germain',
  'Paris Saint-Germain': 'Paris Saint-Germain',
  Dortmund: 'Borussia Dortmund',
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
    season: seasonLabel(year),
    club: clubName(row.team),
    matches,
    goals: statValue(row, 'goals'),
    assists: year >= FIRST_ASSISTS_YEAR ? statValue(row, 'assists') : null,
  };
}

const sortSeasons = (seasons) =>
  [...seasons].sort((a, b) => a.season.localeCompare(b.season) || a.club.localeCompare(b.club));

// Suma por club (para comprobar totales y para la vista de equipos)
function totals(seasons) {
  const sum = (key) => seasons.reduce((total, s) => total + (s[key] || 0), 0);
  return { matches: sum('matches'), goals: sum('goals'), assists: sum('assists') };
}

module.exports = {
  FIRST_SEASON_YEAR,
  FIRST_ASSISTS_YEAR,
  STATS,
  seasonLabel,
  clubName,
  nameTokens,
  isoBirthdate,
  isPlayer,
  seasonFromRow,
  sortSeasons,
  totals,
};
