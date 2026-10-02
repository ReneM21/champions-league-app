import { rankPlayers } from '../utils/stats';

// Une el ranking automático (ranking.json) con las fichas escritas a mano
// (players.json). El ranking decide qué jugadores salen, su orden, goles y
// partidos; la ficha aporta biografía, foto, títulos y temporadas.
// Un jugador nuevo sin ficha se muestra solo con los datos del ranking.
export function mergePlayers(ranking, details) {
  const byId = new Map(details.map((player) => [player.id, player]));

  const players = ranking.players.map((entry) => {
    const detail = byId.get(entry.id) || {};
    return {
      teams: [],
      seasons: [],
      ...detail,
      ...entry,
      name: detail.name || entry.name,
      nationality: detail.nationality || entry.nationality,
    };
  });

  return rankPlayers([...players].sort((a, b) => b.goals - a.goals));
}
