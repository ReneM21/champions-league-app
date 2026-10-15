import { buildPlayers, withPhoto } from './buildPlayers';

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
