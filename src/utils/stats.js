// Cálculos sobre los datos de public/data/players.json.
// En algunas temporadas no hay partidos ni asistencias registrados: esos
// campos faltan y se excluyen de las medias en lugar de contarse como 0.

const sum = (values) => values.reduce((total, value) => total + value, 0);

export const goalsPerMatch = (goals, matches) => (matches ? goals / matches : null);

export const formatRatio = (ratio) => (ratio === null ? '-' : ratio.toFixed(2));

export const formatValue = (value) => (value === undefined || value === null ? '-' : value);

// Posición con empates: dos jugadores con los mismos goles comparten puesto (1, 2, 2, 4...).
export const rankPlayers = (players) =>
  players.map((player) => ({
    ...player,
    position: 1 + players.filter((other) => other.goals > player.goals).length,
  }));

export const sortSeasonsDesc = (seasons) =>
  [...seasons].sort((a, b) => b.season.localeCompare(a.season));

export function summarizeSeasons(seasons) {
  const chronological = [...seasons].sort((a, b) => a.season.localeCompare(b.season));
  const withMatches = chronological.filter((s) => s.matches);
  const withAssists = chronological.filter((s) => s.assists !== undefined);

  // Mejor temporada: más goles; en caso de empate, la primera en el tiempo.
  const best = chronological.reduce(
    (current, season) => (!current || season.goals > current.goals ? season : current),
    null
  );

  // Mejor promedio: solo temporadas con partidos; en caso de empate, la de más goles.
  const mostEfficient = withMatches.reduce((current, season) => {
    if (!current) return season;
    const ratio = season.goals / season.matches;
    const currentRatio = current.goals / current.matches;
    if (ratio > currentRatio) return season;
    if (ratio === currentRatio && season.goals > current.goals) return season;
    return current;
  }, null);

  return {
    count: chronological.length,
    first: chronological[0] || null,
    last: chronological[chronological.length - 1] || null,
    clubs: [...new Set(chronological.map((s) => s.club))],
    titleSeasons: chronological.filter((s) => s.title).map((s) => s.season),
    totalGoals: sum(chronological.map((s) => s.goals)),
    totalMatches: withMatches.length ? sum(withMatches.map((s) => s.matches)) : null,
    totalAssists: withAssists.length ? sum(withAssists.map((s) => s.assists)) : null,
    goalsPerMatch: goalsPerMatch(sum(withMatches.map((s) => s.goals)), sum(withMatches.map((s) => s.matches))),
    best: best && best.goals > 0 ? best : null,
    mostEfficient,
  };
}

export const teamBreakdown = (player) =>
  player.teams.map((team) => ({
    ...team,
    seasons: player.seasons.filter((s) => s.club === team.name).length,
    share: player.goals ? (team.goals / player.goals) * 100 : 0,
  }));
