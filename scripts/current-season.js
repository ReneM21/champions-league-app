// Funciones puras que convierten las respuestas de la UEFA (match.uefa.com,
// standings.uefa.com y compstats.uefa.com) en public/data/current-season.json:
// clasificación, partidos por ronda y jornada, goleadores y asistentes de la
// temporada en curso. Las usa scripts/update-current-season.js.
const { clubName, seasonLabel } = require('./uefa-stats');

// Nombre en español de cada ronda (la traducción de la UEFA es irregular)
const ROUND_NAMES = {
  'First qualifying round': '1.ª ronda previa',
  'Second qualifying round': '2.ª ronda previa',
  'Third qualifying round': '3.ª ronda previa',
  'Play-Offs': 'Eliminatoria previa',
  'League Phase': 'Fase de liga',
  'Knockout Round Play-Offs': 'Play-off de octavos',
  'Round of 16': 'Octavos de final',
  'Quarter-finals': 'Cuartos de final',
  'Semi-finals': 'Semifinales',
  Final: 'Final',
};

const es = (translations, fallback) => (translations && (translations.ES || translations.EN)) || fallback || '';

// Temporada en curso a partir de la fecha: desde julio ya es la siguiente
// (la API usa el año en que termina: 2026-27 -> 2027)
const currentSeasonYear = (date = new Date()) => date.getUTCFullYear() + (date.getUTCMonth() >= 6 ? 1 : 0);

const teamOf = (team) => ({
  id: String(team.id),
  name: clubName(team),
  short: es(team.translations && team.translations.displayName, team.internationalName),
  code: team.teamCode || '',
  country: es(team.translations && team.translations.countryName, team.countryCode),
  logoUrl: team.logoUrl || team.mediumLogoUrl || null,
});

const minuteOf = (event) => {
  const time = event.time || {};
  if (time.injuryMinute) return `${time.minute}+${time.injuryMinute}'`;
  return time.minute != null ? `${time.minute}'` : '';
};

const rivalOf = (match, teamId) => String(String(match.homeTeam.id) === teamId ? match.awayTeam.id : match.homeTeam.id);

const playerName = (player) => (player && (player.internationalName || player.clubShirtName)) || '';

// Goles de un partido en orden, con el equipo que suma el gol: en los goles en
// propia puerta la UEFA da el equipo del jugador, así que se cuenta al rival
const goalsOf = (match) =>
  ((match.playerEvents && match.playerEvents.scorers) || [])
    .map((event) => ({
      teamId: event.goalType === 'OWN' ? rivalOf(match, String(event.teamId)) : String(event.teamId),
      player: playerName(event.player),
      minute: minuteOf(event),
      type: event.goalType === 'PENALTY' ? 'penalty' : event.goalType === 'OWN' ? 'own' : 'goal',
      sort: ((event.time && event.time.minute) || 0) * 100 + ((event.time && event.time.injuryMinute) || 0),
    }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ sort, ...goal }) => goal);

const redCardsOf = (match) =>
  ((match.playerEvents && match.playerEvents.redCards) || []).map((event) => ({
    teamId: String((event.player && event.player.clubId) || event.teamId || ''),
    player: playerName(event.player),
    minute: minuteOf(event),
  }));

const pair = (score) => (score && score.home != null ? { home: score.home, away: score.away } : null);

const roundOf = (match) => {
  const name = (match.round && match.round.metaData && match.round.metaData.name) || '';
  return { id: String((match.round && match.round.id) || ''), name: ROUND_NAMES[name] || es(match.round && match.round.translations && match.round.translations.name, name) };
};

// Un partido con lo que necesita la app
function matchOf(match) {
  const score = match.score || {};
  const won = (key) => (match.winner && match.winner[key] && match.winner[key].team ? String(match.winner[key].team.id) : null);
  const leg = match.leg ? match.leg.number : null;
  const stadium = match.stadium || {};
  const matchday = match.matchday || {};
  return {
    id: String(match.id),
    round: roundOf(match).id,
    matchday: Number(matchday.sequenceNumber) || null,
    // En las eliminatorias a doble partido las "jornadas" son la ida y la vuelta
    matchdayName: leg ? (leg === 1 ? 'Ida' : 'Vuelta') : es(matchday.translations && matchday.translations.longName, matchday.longName),
    date: (match.kickOffTime && match.kickOffTime.dateTime) || null,
    status: match.status || 'UPCOMING',
    home: String(match.homeTeam.id),
    away: String(match.awayTeam.id),
    score: pair(score.total),
    penalties: pair(score.penalty),
    leg,
    aggregate: leg === 2 ? pair(score.aggregate) : null,
    // Ganador del partido (null si empate) y, en la vuelta, quién pasa la eliminatoria
    winner: won('match'),
    qualified: leg === 2 ? won('aggregate') : null,
    stadium: (es(stadium.translations && stadium.translations.officialName, '') || es(stadium.translations && stadium.translations.name, '')).trim(),
    city: es(stadium.city && stadium.city.translations && stadium.city.translations.name, '').trim(),
    attendance: match.matchAttendance || null,
    goals: goalsOf(match),
    redCards: redCardsOf(match),
  };
}

// Rondas en el orden de la competición, con los partidos que tienen
function roundsOf(matches) {
  const rounds = new Map();
  for (const match of matches) {
    const round = roundOf(match);
    if (!rounds.has(round.id)) rounds.set(round.id, { ...round, order: (match.round && match.round.orderInCompetition) || 0, status: (match.round && match.round.status) || '' });
  }
  return [...rounds.values()].sort((a, b) => a.order - b.order).map(({ order, ...round }) => round);
}

// Últimos resultados de un equipo (G/E/P), del más antiguo al más reciente
function formOf(teamId, matches, roundId, n = 5) {
  return matches
    .filter((m) => m.round === roundId && m.status === 'FINISHED' && (m.home === teamId || m.away === teamId) && m.score)
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    .slice(-n)
    .map((m) => {
      const own = m.home === teamId ? m.score.home : m.score.away;
      const other = m.home === teamId ? m.score.away : m.score.home;
      return own > other ? 'G' : own < other ? 'P' : 'E';
    });
}

const TRENDS = { UP: 'up', DOWN: 'down', EQUAL: 'same' };

// Clasificación de la fase de liga (o de cada grupo, si los hubiera)
function standingsOf(groups, matches) {
  return (groups || []).map((group) => {
    const roundId = String((group.round && group.round.id) || (group.group && group.group.roundId) || '');
    return {
      round: roundId,
      name: es(group.group && group.group.translations && group.group.translations.name, group.group && group.group.metaData && group.group.metaData.groupName),
      official: group.status === 'OFFICIAL',
      rows: (group.items || [])
        .map((item) => ({
          rank: item.rank,
          team: String(item.teamId || (item.team && item.team.id)),
          played: item.played,
          won: item.won,
          drawn: item.drawn,
          lost: item.lost,
          goalsFor: item.goalsFor,
          goalsAgainst: item.goalsAgainst,
          goalDifference: item.goalDifference,
          points: item.points,
          trend: TRENDS[item.rankTrend] || 'same',
          live: Boolean(item.isLive),
          form: formOf(String(item.teamId || (item.team && item.team.id)), matches, roundId),
        }))
        .sort((a, b) => a.rank - b.rank),
    };
  });
}

const statValue = (row, name) => {
  const stat = (row.statistics || []).find((s) => s.name === name);
  return stat ? Number(stat.value) || 0 : 0;
};

// Goleadores o asistentes: los n primeros con al menos 1
function leadersOf(rows, stat, n = 25) {
  return rows
    .map((row) => ({
      name: playerName(row.player),
      team: String(row.teamId || (row.team && row.team.id)),
      goals: statValue(row, 'goals'),
      assists: statValue(row, 'assists'),
      matches: statValue(row, 'matches_appearance'),
    }))
    .filter((row) => row.name && row[stat] > 0)
    .sort((a, b) => b[stat] - a[stat] || a.matches - b.matches || a.name.localeCompare(b.name))
    .slice(0, n);
}

// Todos los equipos que aparecen en partidos, clasificación y rankings
function teamsOf(rawMatches, groups, rankingRows) {
  const teams = {};
  const add = (team) => {
    if (team && team.id && !team.isPlaceHolder && !teams[team.id]) teams[team.id] = teamOf(team);
  };
  for (const match of rawMatches) {
    add(match.homeTeam);
    add(match.awayTeam);
  }
  for (const group of groups || []) for (const item of group.items || []) add(item.team);
  for (const row of rankingRows) add(row.team);
  return teams;
}

// Datos completos de la temporada. logos: id de equipo -> ruta local del escudo
function buildCurrentSeason({ seasonYear, rawMatches, groups, scorerRows, assistRows, logos = {} }) {
  const matches = rawMatches
    .filter((m) => m.homeTeam && m.awayTeam)
    .map(matchOf)
    .sort((a, b) => (a.date || '').localeCompare(b.date || '') || a.id.localeCompare(b.id));
  const teams = teamsOf(rawMatches, groups, [...scorerRows, ...assistRows]);
  for (const [id, team] of Object.entries(teams)) {
    const { logoUrl, ...rest } = team;
    teams[id] = logos[id] ? { ...rest, logo: logos[id] } : rest;
  }
  return {
    season: seasonLabel(seasonYear),
    seasonYear,
    rounds: roundsOf(rawMatches.filter((m) => m.homeTeam && m.awayTeam)),
    standings: standingsOf(groups, matches),
    matches,
    scorers: leadersOf(scorerRows, 'goals'),
    assisters: leadersOf(assistRows, 'assists'),
    teams,
  };
}

module.exports = { ROUND_NAMES, currentSeasonYear, teamOf, goalsOf, matchOf, roundsOf, formOf, standingsOf, leadersOf, teamsOf, buildCurrentSeason };
