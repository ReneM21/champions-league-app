// Se ejecuta con el test runner de Node: npm run test:scripts
const test = require('node:test');
const assert = require('node:assert/strict');
const { seasonLabel, clubName, nameTokens, isoBirthdate, isPlayer, seasonFromRow, sortSeasons, totals } = require('./uefa-stats');

// Fila con la forma real de compstats.uefa.com/v1/player-ranking
const row = (name, birthDate, team, stats) => ({
  playerId: '1',
  player: { internationalName: name, birthDate },
  team: { id: '9', internationalName: team },
  statistics: Object.entries(stats).map(([statName, value]) => ({ name: statName, value: String(value) })),
});

test('seasonLabel nombra la temporada por los dos años', () => {
  assert.equal(seasonLabel(2014), '2013-14');
  assert.equal(seasonLabel(2000), '1999-00');
  assert.equal(seasonLabel(1993), '1992-93');
});

test('clubName traduce los nombres cortos de la UEFA', () => {
  assert.equal(clubName({ internationalName: 'Man Utd' }), 'Manchester United');
  assert.equal(clubName({ internationalName: 'Paris' }), 'Paris Saint-Germain');
  assert.equal(clubName({ internationalName: 'Real Madrid' }), 'Real Madrid');
  assert.equal(clubName(undefined), '');
});

test('nameTokens e isoBirthdate normalizan nombres y fechas', () => {
  assert.deepEqual(nameTokens('Raúl González'), ['raul', 'gonzalez']);
  assert.deepEqual(nameTokens('Ángel Di María'), ['angel', 'di', 'maria']);
  assert.equal(isoBirthdate('29/11/1973'), '1973-11-29');
  assert.equal(isoBirthdate(undefined), null);
});

test('isPlayer exige la misma fecha de nacimiento y una palabra del nombre en común', () => {
  const xavi = { name: 'Xavi', birthdate: '1980-01-25' };
  assert.equal(isPlayer(row('Xavi Hernández', '1980-01-25', 'Barcelona', {}), xavi), true);
  assert.equal(isPlayer(row('Xavi Hernández', '1981-01-25', 'Barcelona', {}), xavi), false);
  assert.equal(isPlayer(row('Otro Jugador', '1980-01-25', 'Barcelona', {}), xavi), false);
  assert.equal(isPlayer(row('Xavi', '1980-01-25', 'Barcelona', {}), { name: 'Xavi', birthdate: null }), false);
});

test('seasonFromRow convierte la fila y deja sin asistencias las temporadas anteriores a 2000-01', () => {
  const stats = { matches_appearance: 12, goals: 3, assists: 4 };
  assert.deepEqual(seasonFromRow(row('Ryan Giggs', '1973-11-29', 'Man Utd', stats), 2008), {
    season: '2007-08',
    club: 'Manchester United',
    matches: 12,
    goals: 3,
    assists: 4,
  });
  assert.equal(seasonFromRow(row('Ryan Giggs', '1973-11-29', 'Man Utd', stats), 1999).assists, null);
  // Sin el dato, la UEFA quiere decir 0
  assert.equal(seasonFromRow(row('Ryan Giggs', '1973-11-29', 'Man Utd', { matches_appearance: 5 }), 2008).assists, 0);
  // Convocado sin jugar: no cuenta como temporada
  assert.equal(seasonFromRow(row('Ryan Giggs', '1973-11-29', 'Man Utd', {}), 2008), null);
});

test('sortSeasons y totals', () => {
  const seasons = [
    { season: '2009-10', club: 'B', matches: 2, goals: 1, assists: null },
    { season: '2008-09', club: 'A', matches: 3, goals: 0, assists: 2 },
  ];
  assert.deepEqual(sortSeasons(seasons).map((s) => s.season), ['2008-09', '2009-10']);
  assert.deepEqual(totals(seasons), { matches: 5, goals: 1, assists: 2 });
});
