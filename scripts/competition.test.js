// Se ejecuta con el test runner de Node: npm run test:scripts
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { parseFinals, parseUpcomingFinals, parseClubTitles, parseAllTimeTable, parseSeasonTopScorers, parseRecords, validateCompetition } = require('./competition');

// Tablas reales de Wikipedia (octubre de 2026), recortadas
const finalsHtml = fs.readFileSync(path.join(__dirname, '__fixtures__', 'wikipedia-finals.html'), 'utf8');
const recordsHtml = fs.readFileSync(path.join(__dirname, '__fixtures__', 'wikipedia-records.html'), 'utf8');
const scorersHtml = fs.readFileSync(path.join(__dirname, '__fixtures__', 'wikipedia-season-scorers.html'), 'utf8');

test('parseFinals lee todas las finales, de 1955-56 a 2025-26', () => {
  const finals = parseFinals(finalsHtml);
  assert.equal(finals.length, 71);
  assert.deepEqual(finals[0], {
    season: '1955-56',
    winner: 'Real Madrid',
    winnerCountry: 'España',
    score: '4–3',
    extraTime: false,
    penalties: false,
    replay: false,
    runnerUp: 'Reims',
    runnerUpCountry: 'Francia',
    venue: 'Parc des Princes, París, Francia',
    attendance: 38239,
  });
  const last = finals[finals.length - 1];
  assert.equal(last.season, '2025-26');
  assert.equal(last.winner, 'Paris Saint-Germain');
  assert.equal(last.penalties, true);
});

test('parseFinals entiende "1999–2000" y une la final repetida de 1974', () => {
  const finals = parseFinals(finalsHtml);
  assert.equal(finals.find((f) => f.season === '1999-00').winner, 'Real Madrid');
  const replay = finals.filter((f) => f.season === '1973-74');
  assert.equal(replay.length, 1);
  assert.equal(replay[0].score, '4–0');
  assert.equal(replay[0].firstScore, '1–1');
  assert.equal(replay[0].replay, true);
});

test('parseUpcomingFinals lee los estadios de las próximas finales', () => {
  assert.deepEqual(parseUpcomingFinals(finalsHtml)[0], { season: '2026-27', venue: 'Metropolitano Stadium, Madrid, España' });
});

test('parseClubTitles y parseAllTimeTable leen los clubes', () => {
  const clubs = parseClubTitles(recordsHtml);
  const madrid = clubs.find((c) => c.club === 'Real Madrid');
  assert.equal(madrid.titles, 15);
  assert.deepEqual(madrid.lostYears, [1962, 1964, 1981]);
  assert.equal(clubs.find((c) => c.club === 'AC Milan').titles, 7);

  const allTime = parseAllTimeTable(recordsHtml);
  assert.equal(allTime.length, 25);
  assert.deepEqual(allTime[0], {
    rank: 1,
    club: 'Real Madrid',
    seasons: 57,
    played: 519,
    won: 313,
    drawn: 85,
    lost: 121,
    goalsFor: 1143,
    goalsAgainst: 582,
    points: 711,
  });
});

test('validateCompetition acepta los datos reales y rechaza los incoherentes', () => {
  const data = { finals: parseFinals(finalsHtml), clubs: parseClubTitles(recordsHtml), allTime: parseAllTimeTable(recordsHtml) };
  assert.doesNotThrow(() => validateCompetition(data));
  const broken = { ...data, finals: data.finals.map((f) => (f.season === '2023-24' ? { ...f, winner: 'Otro' } : f)) };
  assert.throws(() => validateCompetition(broken), /Real Madrid ganó en 2024/);
  assert.throws(() => validateCompetition({ ...data, finals: data.finals.slice(0, 10) }), /solo 10 finales/);
});

test('parseSeasonTopScorers lee el máximo goleador de cada temporada, con empates', () => {
  const seasons = parseSeasonTopScorers(scorersHtml);
  assert.deepEqual(seasons[0], { season: '1955-56', players: [{ name: 'Miloš Milutinović', club: 'Partizan', goals: 8 }] });
  assert.deepEqual(seasons.find((s) => s.season === '2023-24').players, [
    { name: 'Harry Kane', club: 'Bayern München', goals: 8 },
    { name: 'Kylian Mbappé', club: 'Paris Saint-Germain', goals: 8 },
  ]);
  assert.equal(seasons[seasons.length - 1].season, '2025-26');
  assert.equal(seasons.length, 71);
});

test('parseRecords lee los récords de jugadores y entrenadores', () => {
  const records = parseRecords(recordsHtml);
  assert.deepEqual(records.mostTitles[1], {
    player: 'Toni Kroos',
    titles: 6,
    clubs: [
      { club: 'Bayern München', detail: '2013' },
      { club: 'Real Madrid', detail: '2016, 2017, 2018, 2022, 2024' },
    ],
  });
  assert.equal(records.appearances[0].player, 'Cristiano Ronaldo');
  assert.equal(records.appearances[0].apps, 183);
  assert.deepEqual(records.seasonGoals[0], { rank: 1, player: 'Cristiano Ronaldo', season: '2013-14', goals: 17 });
  assert.deepEqual(records.seasonAssists[0], { rank: 1, player: 'Luís Figo', season: '1999-00', assists: 9 });
  assert.equal(records.managers[0].manager, 'Carlo Ancelotti');
  assert.equal(records.managers[0].matches, 218);
  assert.equal(records.managers[0].clubs.length, 8);
});
