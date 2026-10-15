import { rankPlayers } from '../utils/stats';

// Une todas las fuentes de datos de jugadores:
// - ranking.json / assists.json: top de goleadores y asistidores (automático).
// - all-goals.json / all-assists.json: tablas completas, para conocer los goles
//   de un asistidor (o al revés) aunque no esté en el top.
// - players.json: fichas escritas a mano (biografía, títulos, temporadas...).
// - profiles.json: fichas automáticas de Wikipedia/Wikidata para quien no
//   tiene ficha manual. La ficha manual siempre tiene prioridad.
// - photos.json: fotos de Wikimedia Commons para quien no tiene foto propia.
//
// Devuelve { scorers, assisters, byId }: los dos rankings con su posición y
// un mapa con todos los jugadores que tienen página.

const indexById = (rows = []) => new Map(rows.map((row) => [row.id, row]));

// Añade la foto de Commons y su crédito a un jugador sin foto propia
export function withPhoto(player, photos = {}) {
  const photo = photos[player.id];
  if (player.image || !photo) return player;
  const { image, ...credit } = photo;
  return { ...player, image, photoCredit: credit };
}

// Ficha automática con los nombres de campo que usa la app
// (position ya se usa para el puesto en el ranking, por eso "role")
const fromProfile = (profile) =>
  profile
    ? {
        birthdate: profile.birthdate || undefined,
        role: profile.position || undefined,
        biography: profile.biography || undefined,
        biographySource: profile.biographySource || undefined,
      }
    : {};

export function buildPlayers({ ranking, assists, details = [], photos = {}, profiles = {}, allGoals = [], allAssists = [] }) {
  const detailsById = indexById(details);
  const goalsById = indexById([...allGoals, ...ranking.players]);
  const assistsById = indexById([...allAssists, ...assists.players]);

  const makePlayer = (id) => {
    const goalsRow = goalsById.get(id);
    const assistsRow = assistsById.get(id);
    const base = goalsRow || assistsRow;
    const detail = detailsById.get(id) || {};
    const clubs = [goalsRow, assistsRow].map((row) => row && row.clubs).find((list) => list && list.length);

    const player = {
      teams: [],
      seasons: [],
      ...fromProfile(profiles[id]),
      ...detail,
      id,
      article: base.article,
      name: detail.name || base.name,
      nationality: detail.nationality || base.nationality,
      years: (goalsRow && goalsRow.years) || (assistsRow && assistsRow.years) || detail.years,
      clubs: clubs || undefined,
      goals: goalsRow ? goalsRow.goals : null,
      assists: assistsRow ? assistsRow.assists : null,
      matches: (goalsRow && goalsRow.matches) || (assistsRow && assistsRow.matches) || null,
    };
    // Una biografía manual no lleva el enlace de la automática
    if (detail.biography) delete player.biographySource;
    return withPhoto(player, photos);
  };

  const scorers = rankPlayers(
    [...ranking.players].sort((a, b) => b.goals - a.goals).map((row) => makePlayer(row.id)),
    'goals'
  );
  const assisters = rankPlayers(
    [...assists.players].sort((a, b) => b.assists - a.assists).map((row) => makePlayer(row.id)),
    'assists'
  );

  // Todos los jugadores con página, con su puesto en cada ranking
  const byId = new Map();
  for (const player of [...scorers, ...assisters]) {
    if (byId.has(player.id)) continue;
    const scorer = scorers.find((p) => p.id === player.id);
    const assister = assisters.find((p) => p.id === player.id);
    const { position, ...rest } = player;
    byId.set(player.id, {
      ...rest,
      goalsPosition: scorer ? scorer.position : null,
      assistsPosition: assister ? assister.position : null,
    });
  }

  return { scorers, assisters, byId };
}
