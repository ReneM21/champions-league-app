import { buildPlayers, buildTeams, mergeSeasons, withPhoto } from './buildPlayers';

const ranking = {
  players: [
    { id: 'raul-gonzalez', name: 'Raúl', article: 'Raúl_(footballer)', nationality: 'España', goals: 71, matches: 142, clubs: ['Real Madrid'] },
    { id: 'nuevo', name: 'Jugador Nuevo', nationality: 'Noruega', goals: 80, matches: 70, years: '2019–', clubs: ['Club'] },
  ],
};
const assists = {
  players: [
    { id: 'asistidor', name: 'Asistidor', nationality: 'Gales', assists: 41, matches: 141, clubs: ['United'] },
    { id: 'raul-gonzalez', name: 'Raúl', nationality: 'España', assists: 27, matches: 142, clubs: [] },
  ],
};
const details = [
  { id: 'raul-gonzalez', name: 'Raúl González', image: 'images/players/5.webp', titles: 3, biography: 'Bio manual', seasons: [{ season: '1999-00' }] },
  { id: 'fuera-del-top', name: 'Ya no está', titles: 1 },
];
const photos = {
  nuevo: { image: 'images/players/nuevo.jpg', author: 'Ana', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:X.jpg' },
  'raul-gonzalez': { image: 'images/players/raul-gonzalez.jpg', author: 'Otro', license: 'CC BY 2.0', source: 'x' },
};
const profiles = {
  asistidor: { birthdate: '29/11/1973', position: 'centrocampista', biography: 'Bio automática.', biographySource: 'https://es.wikipedia.org/wiki/Asistidor' },
  'raul-gonzalez': { biography: 'No debe usarse: hay ficha manual', biographySource: 'https://es.wikipedia.org/wiki/Raúl' },
};
const allGoals = [{ id: 'asistidor', name: 'Asistidor', goals: 29, matches: 151, clubs: ['United'] }];

const { scorers, assisters, byId } = buildPlayers({ ranking, assists, details, photos, profiles, allGoals });

describe('buildPlayers', () => {
  it('ordena cada ranking y calcula la posición', () => {
    expect(scorers.map((p) => [p.id, p.position])).toEqual([
      ['nuevo', 1],
      ['raul-gonzalez', 2],
    ]);
    expect(assisters.map((p) => [p.id, p.position])).toEqual([
      ['asistidor', 1],
      ['raul-gonzalez', 2],
    ]);
  });

  it('la ficha manual tiene prioridad sobre la automática', () => {
    const raul = byId.get('raul-gonzalez');
    expect(raul).toMatchObject({ name: 'Raúl González', biography: 'Bio manual', titles: 3, goals: 71, assists: 27 });
    expect(raul.image).toBe('images/players/5.webp');
    expect(raul.photoCredit).toBeUndefined();
    expect(raul.clubs).toEqual(['Real Madrid']);
    expect(raul.biographySource).toBeUndefined();
  });

  it('un asistidor sin ficha usa la ficha automática y sus goles de la tabla completa', () => {
    expect(byId.get('asistidor')).toMatchObject({
      goals: 29,
      assists: 41,
      matches: 151,
      birthdate: '29/11/1973',
      role: 'centrocampista',
      biography: 'Bio automática.',
      biographySource: 'https://es.wikipedia.org/wiki/Asistidor',
      goalsPosition: null,
      assistsPosition: 1,
    });
  });

  it('usa la foto de Commons si no hay foto propia', () => {
    expect(byId.get('nuevo')).toMatchObject({
      image: 'images/players/nuevo.jpg',
      photoCredit: { author: 'Ana', license: 'CC BY-SA 4.0' },
      assists: null,
      goalsPosition: 1,
      assistsPosition: null,
      years: '2019–',
    });
  });

  it('solo incluye jugadores de los rankings', () => {
    expect(byId.has('fuera-del-top')).toBe(false);
    expect([...byId.keys()].sort()).toEqual(['asistidor', 'nuevo', 'raul-gonzalez']);
  });

  it('withPhoto no toca a jugadores sin foto descargada', () => {
    const player = { id: 'x', name: 'X' };
    expect(withPhoto(player, photos)).toBe(player);
  });
});

describe('temporadas de la UEFA', () => {
  const uefa = [
    { season: '2007-08', club: 'Manchester United', matches: 9, goals: 0, assists: 3 },
    { season: '2008-09', club: 'Manchester United', matches: 8, goals: 1, assists: 2 },
    { season: '1998-99', club: 'Manchester United', matches: 9, goals: 2, assists: null },
  ];

  it('mergeSeasons usa las cifras de la UEFA, el título manual y lo que la UEFA no tiene, y descarta temporadas que la UEFA no tiene', () => {
    const manual = [
      { season: '2007-08', club: 'Man United', goals: 5, title: true },
      { season: '1998-99', club: 'Manchester United', goals: 2, assists: 4 },
      { season: '2015-16', club: 'Solo manual', goals: 1 },
    ];
    expect(mergeSeasons(manual, uefa)).toEqual([
      { season: '1998-99', club: 'Manchester United', matches: 9, goals: 2, assists: 4 },
      { season: '2007-08', club: 'Manchester United', matches: 9, goals: 0, assists: 3, title: true },
      { season: '2008-09', club: 'Manchester United', matches: 8, goals: 1, assists: 2 },
    ]);
    // Sin datos de la UEFA, se queda todo lo manual
    expect(mergeSeasons(manual, [])).toHaveLength(3);
  });

  it('mergeSeasons respeta una temporada repartida a mano entre dos clubes', () => {
    const manual = [
      { season: '2008-09', club: 'Salzburg', goals: 1, matches: 6 },
      { season: '2008-09', club: 'Dortmund', goals: 0, matches: 2 },
    ];
    const merged = mergeSeasons(manual, uefa).filter((s) => s.season === '2008-09');
    expect(merged.map((s) => s.club)).toEqual(['Dortmund', 'Salzburg']);
    // Si la UEFA ya lo separa, se usan sus cifras para cada club
    const split = [
      { season: '2008-09', club: 'Salzburg', matches: 6, goals: 8, assists: 1 },
      { season: '2008-09', club: 'Dortmund', matches: 2, goals: 2, assists: 0 },
    ];
    expect(mergeSeasons(manual, split)).toEqual([split[1], split[0]]);
  });

  it('buildTeams suma por club y respeta los goles manuales si no hay datos de la UEFA', () => {
    const seasons = [...uefa, { season: '2014-15', club: 'Otro', matches: 2, goals: 0, assists: 1 }];
    expect(buildTeams([{ name: 'Manchester United', goals: 10 }], seasons)).toEqual([
      { name: 'Manchester United', matches: 26, goals: 10, assists: 5 },
      { name: 'Otro', matches: 2, goals: 0, assists: 1 },
    ]);
    // Con temporadas de la UEFA, los goles salen de ellas
    expect(buildTeams([{ name: 'Manchester United', goals: 10 }], seasons, true)[0].goals).toBe(3);
    expect(buildTeams([{ name: 'Sin temporadas', goals: 4 }], [])).toEqual([{ name: 'Sin temporadas', matches: null, goals: 4, assists: null }]);
  });

  it('buildPlayers usa las temporadas de la UEFA y marca las ganadas con titleSeasons', () => {
    const withTitles = [...details, { id: 'asistidor', name: 'Asistidor', titles: 1, titleSeasons: ['2007-08'] }];
    const { byId: withUefa } = buildPlayers({ ranking, assists, details: withTitles, photos, profiles, allGoals, uefa: { asistidor: { seasons: uefa } } });
    const player = withUefa.get('asistidor');
    expect(player.seasons.filter((s) => s.title).map((s) => s.season)).toEqual(['2007-08']);
    expect(player.titleSeasons).toBeUndefined();
    expect(player.seasons).toHaveLength(3);
    expect(player.seasonsSource).toBe('uefa');
    expect(player.teams).toEqual([{ name: 'Manchester United', matches: 26, goals: 3, assists: 5 }]);
    // Ya tenía goles por la tabla completa; un jugador sin ellos los toma de la UEFA
    expect(player.goals).toBe(29);
    const { byId: other } = buildPlayers({ ranking, assists, details, photos, profiles, uefa: { asistidor: { seasons: uefa } } });
    expect(other.get('asistidor').goals).toBe(3);
  });
});
