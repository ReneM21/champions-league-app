// Cálculos sobre los datos de public/data/players.json.
// En algunas temporadas no hay partidos ni asistencias registrados: esos
// campos faltan y se excluyen de las medias en lugar de contarse como 0.

const sum = (values) => values.reduce((total, value) => total + value, 0);

export const goalsPerMatch = (goals, matches) => (matches ? goals / matches : null);

export const formatRatio = (ratio) => (ratio === null ? '-' : ratio.toFixed(2));

export const formatValue = (value) => (value === undefined || value === null ? '-' : value);

export const formatDate = (isoDate) =>
  isoDate ? new Date(isoDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : null;

// Posición con empates: dos jugadores con el mismo valor comparten puesto (1, 2, 2, 4...).
export const rankPlayers = (players, key = 'goals') =>
  players.map((player) => ({
    ...player,
    position: 1 + players.filter((other) => other[key] > player[key]).length,
  }));

export const sortSeasonsDesc = (seasons) =>
  [...seasons].sort((a, b) => b.season.localeCompare(a.season));

// Etiquetas de cada estadística para los textos de las vistas
export const STAT_LABELS = {
  goals: { one: 'gol', many: 'goles', article: 'los', title: 'Goles', perMatch: 'Goles/partido' },
  assists: { one: 'asistencia', many: 'asistencias', article: 'las', title: 'Asistencias', perMatch: 'Asist./partido' },
};

// Valor de una temporada para una estadística; null si no está registrado
// (las asistencias solo se registran desde 2000-01).
const valueOf = (season, stat) => (season[stat] === undefined || season[stat] === null ? null : season[stat]);

// Resumen de las temporadas de un jugador. stat elige qué cuenta para la
// mejor temporada y la eficiencia: 'goals' o 'assists'.
export function summarizeSeasons(seasons, stat = 'goals') {
  const chronological = [...seasons].sort((a, b) => a.season.localeCompare(b.season));
  const withMatches = chronological.filter((s) => s.matches);
  const withAssists = chronological.filter((s) => valueOf(s, 'assists') !== null);
  const counted = withMatches.filter((s) => valueOf(s, stat) !== null);

  // Mejor temporada: más goles (o asistencias); en caso de empate, la primera en el tiempo.
  const best = chronological.reduce(
    (current, season) => ((valueOf(season, stat) ?? -1) > (current ? valueOf(current, stat) ?? -1 : -1) ? season : current),
    null
  );

  // Mejor promedio: solo temporadas con partidos; en caso de empate, la de más goles (o asistencias).
  const mostEfficient = counted.reduce((current, season) => {
    if (!current) return season;
    const ratio = season[stat] / season.matches;
    const currentRatio = current[stat] / current.matches;
    if (ratio > currentRatio) return season;
    if (ratio === currentRatio && season[stat] > current[stat]) return season;
    return current;
  }, null);

  return {
    count: chronological.length,
    first: chronological[0] || null,
    last: chronological[chronological.length - 1] || null,
    clubs: [...new Set(chronological.map((s) => s.club))],
    titleSeasons: chronological.filter((s) => s.title).map((s) => s.season),
    totalGoals: sum(chronological.map((s) => s.goals || 0)),
    totalMatches: withMatches.length ? sum(withMatches.map((s) => s.matches)) : null,
    totalAssists: withAssists.length ? sum(withAssists.map((s) => s.assists)) : null,
    perMatch: goalsPerMatch(sum(counted.map((s) => s[stat])), sum(counted.map((s) => s.matches))),
    best: best && valueOf(best, stat) > 0 ? best : null,
    mostEfficient: mostEfficient && mostEfficient[stat] > 0 ? mostEfficient : null,
  };
}

// Desglose por equipo: goles, asistencias, partidos y temporadas, y el
// porcentaje del total del jugador en la estadística elegida.
export const teamBreakdown = (player, stat = 'goals') =>
  player.teams
    .map((team) => ({
      ...team,
      seasons: player.seasons.filter((s) => s.club === team.name).length,
      share: player[stat] && team[stat] ? (team[stat] / player[stat]) * 100 : 0,
    }))
    .sort((a, b) => (b[stat] ?? -1) - (a[stat] ?? -1));
