import { rankPlayers } from '../utils/stats';

// Une el ranking automático (ranking.json) con las fichas escritas a mano
// (players.json). El ranking decide qué jugadores salen, su orden, goles y
// partidos; la ficha aporta biografía, foto, títulos y temporadas.
// Un jugador nuevo sin ficha se muestra solo con los datos del ranking.
// Si la ficha no tiene foto, se usa la descargada de Wikimedia Commons (photos.json).
export function mergePlayers(ranking, details, photos = {}) {
  const byId = new Map(details.map((player) => [player.id, player]));

  const players = ranking.players.map((entry) => {
    const detail = byId.get(entry.id) || {};
    const merged = {
      teams: [],
      seasons: [],
      ...detail,
      ...entry,
      name: detail.name || entry.name,
      nationality: detail.nationality || entry.nationality,
    };
    return withPhoto(merged, photos);
  });

  return rankPlayers([...players].sort((a, b) => b.goals - a.goals));
}

// Añade la foto de Commons y su crédito a un jugador sin foto propia
export function withPhoto(player, photos = {}) {
  const photo = photos[player.id];
  if (player.image || !photo) return player;
  const { image, ...credit } = photo;
  return { ...player, image, photoCredit: credit };
}
