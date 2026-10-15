// Se ejecuta con el test runner de Node: npm run test:scripts
const test = require('node:test');
const assert = require('node:assert/strict');
const { seasonLabel, seasonYears, clubName, nameTokens, isoBirthdate, isPlayer, seasonFromRow, sortSeasons, splitCandidates, sameClub, missingClubCandidates, publicSeason, clubSlug, seasonLeaders, addClubGoals, clubTopScorers, findUefaClub, totals } = require('./uefa-stats');

// Fila con la forma real de compstats.uefa.com/v1/player-ranking
const row = (name, birthDate, team, stats) => ({
  playerId: '1',
  player: { internationalName: name, birthDate },
  team: { id: '9', internationalName: team },
  statistics: Object.entries(stats).map(([statName, value]) => ({ name: statName, value: String(value) })),
});

test('seasonLabel sigue el cambio de criterio de la API en 2007', () => {
  assert.equal(seasonLabel(1992), '1992-93');
  assert.equal(seasonLabel(1999), '1999-00');
  assert.equal(seasonLabel(2006), '2006-07');
  assert.equal(seasonLabel(2008), '2007-08');
  assert.equal(seasonLabel(2014), '2013-14');
});

test('seasonYears no repite ni salta temporadas', () => {
  const labels = seasonYears(2027).map(seasonLabel);
  assert.equal(labels[0], '1992-93');
  assert.equal(labels[labels.length - 1], '2026-27');
  assert.equal(new Set(labels).size, labels.length);
  assert.equal(labels.length, 2026 - 1992 + 1);
  assert.ok(labels.includes('2006-07') && labels.includes('2007-08'));
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

test('seasonFromRow convierte la fila y deja sin asistencias las temporadas anteriores a 2001-02', () => {
  const stats = { matches_appearance: 12, goals: 3, assists: 4 };
  assert.deepEqual(publicSeason(seasonFromRow(row('Ryan Giggs', '1973-11-29', 'Man Utd', stats), 2008)), {
    season: '2007-08',
    club: 'Manchester United',
    matches: 12,
    goals: 3,
    assists: 4,
  });
  assert.equal(seasonFromRow(row('Ryan Giggs', '1973-11-29', 'Man Utd', stats), 2000).assists, null);
  assert.equal(seasonFromRow(row('Ryan Giggs', '1973-11-29', 'Man Utd', stats), 2001).assists, 4);
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

test('splitCandidates busca los clubes de las temporadas vecinas que no coinciden', () => {
  const seasons = [
    { season: '2018-19', teamId: 'salzburg' },
    { season: '2019-20', teamId: 'dortmund' },
    { season: '2020-21', teamId: 'dortmund' },
    { season: '2022-23', teamId: 'city' },
  ];
  const candidates = splitCandidates(seasons).map((c) => `${c.season.season}:${c.teamId}`);
  assert.deepEqual(candidates, ['2018-19:dortmund', '2019-20:salzburg', '2020-21:city', '2022-23:dortmund']);
  assert.deepEqual(splitCandidates([{ season: '2019-20', teamId: 'a' }, { season: '2020-21', teamId: 'a' }]), []);
});

test('sameClub compara nombres de club de Wikipedia y de la UEFA', () => {
  assert.equal(sameClub('Red Bull Salzburg', 'Salzburg'), true);
  assert.equal(sameClub('Borussia Dortmund', 'Borussia Dortmund'), true);
  assert.equal(sameClub('Manchester United', 'Manchester City'), false);
  assert.equal(sameClub('Inter Milan', 'Inter de Milán'), true);
});

test('missingClubCandidates busca un club de Wikipedia que falta en sus temporadas', () => {
  const seasons = [
    { season: '2019-20', year: 2020, club: 'Borussia Dortmund', teamId: 'bvb' },
    { season: '2016-17', year: 2017, club: 'Borussia Dortmund', teamId: 'bvb' },
  ];
  const teamsByYear = {
    2020: [{ id: 'bvb', name: 'B. Dortmund' }, { id: 'rbs', name: 'Salzburg' }, { id: 'mci', name: 'Man City' }],
    2017: [{ id: 'rbs', name: 'Salzburg' }],
  };
  const candidates = missingClubCandidates(seasons, ['Red Bull Salzburg', 'Borussia Dortmund'], teamsByYear);
  assert.deepEqual(candidates.map((c) => `${c.season.season}:${c.teamId}`), ['2019-20:rbs']);
});

test('clubSlug da un nombre de archivo sin tildes ni espacios', () => {
  assert.equal(clubSlug('Paris Saint-Germain'), 'paris-saint-germain');
  assert.equal(clubSlug('Atlético de Madrid'), 'atletico-de-madrid');
  assert.equal(clubSlug('Bayern München'), 'bayern-munchen');
});

test('seasonLeaders da el máximo goleador y asistente, con empates', () => {
  const rows = [
    row('A', '1990-01-01', 'Man Utd', { matches_appearance: 10, goals: 8, assists: 2 }),
    row('B', '1990-01-01', 'Real Madrid', { matches_appearance: 9, goals: 8, assists: 5 }),
    row('C', '1990-01-01', 'Real Madrid', { matches_appearance: 1, goals: 0 }),
  ];
  rows[1].team.id = '10';
  assert.deepEqual(seasonLeaders(rows, 2014), {
    topScorers: [
      { name: 'A', club: 'Manchester United', goals: 8 },
      { name: 'B', club: 'Real Madrid', goals: 8 },
    ],
    topAssists: [{ name: 'B', club: 'Real Madrid', assists: 5 }],
    teams: 2,
  });
  assert.equal(seasonLeaders(rows, 1999).topAssists, null);
});

test('addClubGoals y clubTopScorers suman goles por club', () => {
  const season1 = [row('A', 'x', 'Man Utd', { goals: 3 }), row('B', 'x', 'Man Utd', { goals: 5 })];
  season1[1].playerId = '2';
  const season2 = [row('A', 'x', 'Man Utd', { goals: 4 })];
  const totals = addClubGoals(addClubGoals(new Map(), season1), season2);
  assert.deepEqual(clubTopScorers(totals, 'Manchester United'), [
    { name: 'A', goals: 7 },
    { name: 'B', goals: 5 },
  ]);
  assert.deepEqual(clubTopScorers(totals, 'Otro'), []);
});

test('findUefaClub busca el nombre exacto o uno contenido', () => {
  const names = ['Malmö', 'Real Madrid', 'Mönchengladbach'];
  assert.equal(findUefaClub('Real Madrid', names), 'Real Madrid');
  assert.equal(findUefaClub('Malmö FF', names), 'Malmö');
  assert.equal(findUefaClub('Borussia Mönchengladbach', names), 'Mönchengladbach');
  assert.equal(findUefaClub('Reims', names), null);
});
