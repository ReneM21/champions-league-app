import { rankPlayers } from '../utils/stats';

// Une todas las fuentes de datos de jugadores:
// - ranking.json / assists.json: top de goleadores y asistidores (automático).
// - all-goals.json / all-assists.json: tablas completas, para conocer los goles
//   de un asistidor (o al revés) aunque no esté en el top.
// - players.json: fichas escritas a mano (biografía, títulos, temporadas...).
// - profiles.json: fichas automáticas de Wikipedia/Wikidata para quien no
//   tiene ficha manual. La ficha manual siempre tiene prioridad.
// - photos.json: fotos de Wikimedia Commons para quien no tiene foto propia.
// - uefa-seasons.json: partidos, goles y asistencias por temporada y club de
//   la UEFA. Completa las temporadas manuales y crea las que faltan.
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

// Une las temporadas de la UEFA con las escritas a mano. Las cifras oficiales
// de la UEFA mandan (sus totales coinciden con los rankings); de lo manual se
// toma el título ("title") y los datos que la UEFA no tiene (asistencias antes
// de 2001-02). Si a mano una temporada está repartida entre dos clubes
// (fichaje en invierno), se respeta ese reparto.
export function mergeSeasons(manual = [], uefa = []) {
  const merged = [];
  for (const label of new Set(uefa.map((s) => s.season))) {
    const official = uefa.filter((s) => s.season === label);
    const own = manual.filter((s) => s.season === label);
    // Reparto entre dos clubes escrito a mano que la UEFA no separa
    if (official.length === 1 && own.length > 1) {
      merged.push(...own);
      continue;
    }
    for (const season of official) {
      const match = own.find((s) => s.club === season.club) || (own.length === 1 && official.length === 1 ? own[0] : {});
      const filled = { ...season };
      for (const key of ['matches', 'goals', 'assists']) {
        if (filled[key] === undefined || filled[key] === null) filled[key] = match[key] ?? null;
      }
      if (match.title) filled.title = true;
      merged.push(filled);
    }
  }
  // Las temporadas que solo están a mano se mantienen si no hay datos de la
  // UEFA; si los hay, la UEFA tiene todas y lo demás son errores de escritura
  if (uefa.length === 0) merged.push(...manual);
  return merged.sort((a, b) => a.season.localeCompare(b.season) || a.club.localeCompare(b.club));
}

const sumOrNull = (values) => {
  const known = values.filter((v) => v !== undefined && v !== null);
  return known.length ? known.reduce((total, v) => total + v, 0) : null;
};

// Equipos del jugador a partir de sus temporadas. Con temporadas de la UEFA
// (completas) los goles salen de ellas; si solo hay temporadas escritas a
// mano, mandan los goles por equipo escritos a mano.
export function buildTeams(manualTeams = [], seasons = [], fromUefa = false) {
  const names = [...new Set([...manualTeams.map((t) => t.name), ...seasons.map((s) => s.club)])];
  return names.map((name) => {
    const manual = manualTeams.find((t) => t.name === name) || {};
    const clubSeasons = seasons.filter((s) => s.club === name);
    return {
      name,
      matches: sumOrNull(clubSeasons.map((s) => s.matches)),
      goals: fromUefa && clubSeasons.length ? sumOrNull(clubSeasons.map((s) => s.goals)) : manual.goals ?? sumOrNull(clubSeasons.map((s) => s.goals)),
      assists: sumOrNull(clubSeasons.map((s) => s.assists)),
    };
  });
}

// Títulos y finales a partir de las temporadas de la UEFA y de la lista de
// finales (Wikipedia): una temporada en un club que ganó o perdió la final.
// Cuenta como lo hace la UEFA: basta con haber jugado esa Champions con el club.
export function titlesFromFinals(seasons, finals = []) {
  const bySeason = new Map(finals.map((final) => [final.season, final]));
  const isWin = (s) => bySeason.has(s.season) && bySeason.get(s.season).winner === s.club;
  const reached = seasons.filter((s) => bySeason.has(s.season) && [bySeason.get(s.season).winner, bySeason.get(s.season).runnerUp].includes(s.club));
  // Cada final con el rival y el resultado, de la más reciente a la más antigua
  const list = reached
    .map((s) => {
      const final = bySeason.get(s.season);
      const won = final.winner === s.club;
      // El resultado, contado desde el equipo del jugador ("0–2" si perdió 2–0)
      const score = won ? final.score : final.score.split(/([–-])/).reverse().join('');
      return { ...final, club: s.club, won, opponent: won ? final.runnerUp : final.winner, score };
    })
    .sort((a, b) => b.season.localeCompare(a.season));
  return { titles: seasons.filter(isWin).length, finals: reached.length, isWin, list };
}

export function buildPlayers({ ranking, assists, details = [], photos = {}, profiles = {}, allGoals = [], allAssists = [], uefa = {}, finals = [] }) {
  const detailsById = indexById(details);
  // Temporada en curso: la más reciente de los datos de la UEFA
  const currentSeason = Object.values(uefa)
    .flatMap((p) => p.seasons.map((s) => s.season))
    .sort()
    .pop();
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
    // Nombres con los que aparece el jugador en cada fuente ("Raúl" en
    // Wikipedia, "Xavi Hernández" en la UEFA), para enlazarlo desde cualquiera
    player.aliases = [...new Set([player.name, goalsRow && goalsRow.name, assistsRow && assistsRow.name, uefa[id] && uefa[id].name].filter(Boolean))];
    // Una biografía manual no lleva el enlace de la automática
    if (detail.biography) delete player.biographySource;
    const official = uefa[id];
    if (official && official.seasons.length) {
      player.seasons = mergeSeasons(player.seasons, official.seasons);
      player.seasonsSource = 'uefa';
      // En activo: ha jugado la Champions esta temporada
      player.active = official.seasons.some((s) => s.season === currentSeason);
      // Asistidores que no están en la tabla de goleadores: goles de la UEFA
      if (player.goals === null) player.goals = sumOrNull(player.seasons.map((s) => s.goals));
    }
    // Con las temporadas de la UEFA y la lista de finales, los títulos y las
    // finales se calculan solos; si no, valen los escritos a mano
    if (player.seasonsSource === 'uefa' && finals.length) {
      const computed = titlesFromFinals(player.seasons, finals);
      player.titles = computed.titles;
      player.finals = computed.finals;
      player.finalsList = computed.list;
      player.seasons = player.seasons.map((season) => ({ ...season, title: computed.isWin(season) }));
    } else if (detail.titleSeasons) {
      // Temporadas ganadas indicadas a mano con "titleSeasons"
      player.seasons = player.seasons.map((season) => (detail.titleSeasons.includes(season.season) ? { ...season, title: true } : season));
    }
    delete player.titleSeasons;
    player.teams = buildTeams(player.teams, player.seasons, player.seasonsSource === 'uefa');
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
