import { mergePlayers, withPhoto } from './mergePlayers';

const ranking = {
  players: [
    { id: 'raul-gonzalez', name: 'Raúl', nationality: 'España', goals: 71, matches: 142, clubs: ['Real Madrid'] },
    { id: 'nuevo', name: 'Jugador Nuevo', nationality: 'Noruega', goals: 80, matches: 70, clubs: ['Club'] },
  ],
};
const details = [
  { id: 'raul-gonzalez', name: 'Raúl González', image: 'images/players/5.webp', titles: 3, teams: [{ name: 'Real Madrid', goals: 66 }], seasons: [{ season: '1999-00' }] },
  { id: 'fuera-del-top', name: 'Ya no está', titles: 1 },
];

describe('mergePlayers', () => {
  const players = mergePlayers(ranking, details);

  it('ordena por goles del ranking y calcula la posición', () => {
    expect(players.map((p) => [p.id, p.position])).toEqual([
      ['nuevo', 1],
      ['raul-gonzalez', 2],
    ]);
  });

  it('completa con la ficha manual y prefiere su nombre', () => {
    const raul = players.find((p) => p.id === 'raul-gonzalez');
    expect(raul).toMatchObject({ name: 'Raúl González', goals: 71, matches: 142, titles: 3, image: 'images/players/5.webp' });
    expect(raul.seasons).toHaveLength(1);
  });

  it('muestra a un jugador nuevo sin ficha con valores vacíos', () => {
    const nuevo = players.find((p) => p.id === 'nuevo');
    expect(nuevo).toMatchObject({ name: 'Jugador Nuevo', teams: [], seasons: [], clubs: ['Club'] });
    expect(nuevo.image).toBeUndefined();
  });

  it('no muestra fichas que no están en el ranking', () => {
    expect(players.find((p) => p.id === 'fuera-del-top')).toBeUndefined();
  });
});

describe('fotos de Wikimedia Commons', () => {
  const photos = {
    nuevo: { image: 'images/players/nuevo.jpg', author: 'Ana', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:X.jpg' },
    'raul-gonzalez': { image: 'images/players/raul-gonzalez.jpg', author: 'Otro', license: 'CC BY 2.0', source: 'x' },
  };
  const players = mergePlayers(ranking, details, photos);

  it('usa la foto descargada si el jugador no tiene una propia', () => {
    expect(players.find((p) => p.id === 'nuevo')).toMatchObject({
      image: 'images/players/nuevo.jpg',
      photoCredit: { author: 'Ana', license: 'CC BY-SA 4.0' },
    });
  });

  it('mantiene la foto de la ficha manual', () => {
    const raul = players.find((p) => p.id === 'raul-gonzalez');
    expect(raul.image).toBe('images/players/5.webp');
    expect(raul.photoCredit).toBeUndefined();
  });

  it('withPhoto no toca a jugadores sin foto descargada', () => {
    const player = { id: 'x', name: 'X' };
    expect(withPhoto(player, photos)).toBe(player);
  });
});
