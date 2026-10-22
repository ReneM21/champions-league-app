// Se ejecuta con el test runner de Node: npm run test:scripts
const test = require('node:test');
const assert = require('node:assert/strict');
const { currentSeasonYear, goalsOf, matchOf, roundsOf, formOf, standingsOf, leadersOf, buildCurrentSeason } = require('./current-season');

// Objetos con la forma real de match.uefa.com/v5/matches y standings.uefa.com/v1/standings
const team = (id, name, extra = {}) => ({
  id,
  internationalName: name,
  teamCode: name.slice(0, 3).toUpperCase(),
  logoUrl: `https://img.uefa.com/${id}.png`,
  translations: { displayName: { EN: name, ES: name }, countryName: { EN: 'Spain', ES: 'España' } },
  ...extra,
});
const RM = team('50051', 'Real Madrid');
const ATL = team('50124', 'Atleti');
const LEAGUE = { id: '2002239', orderInCompetition: 5, status: 'CURRENT', metaData: { name: 'League Phase' } };
const PLAYOFF = { id: '2002238', orderInCompetition: 4, status: 'FINISHED', metaData: { name: 'Play-Offs' } };

const match = (id, { round = LEAGUE, home = RM, away = ATL, date = '2026-09-16T19:00:00Z', status = 'FINISHED', score, goals = [], extra = {} } = {}) => ({
  id,
  round,
  homeTeam: home,
  awayTeam: away,
  status,
  kickOffTime: { dateTime: date },
  matchday: { sequenceNumber: '1', longName: 'Matchday 1', translations: { longName: { EN: 'Matchday 1', ES: 'Jornada 1' } } },
  stadium: { translations: { officialName: { ES: ' Santiago Bernabéu' } }, city: { translations: { name: { ES: 'Madrid' } } } },
  ...(score ? { score: { total: score, regular: score } } : {}),
  playerEvents: { scorers: goals },
  ...extra,
});
const goal = (teamId, name, minute, goalType = 'SCORED', injuryMinute) => ({
  teamId,
  goalType,
  player: { internationalName: name },
  time: { minute, ...(injuryMinute ? { injuryMinute } : {}) },
});

test('currentSeasonYear: desde julio es la temporada siguiente (año en que termina)', () => {
  assert.equal(currentSeasonYear(new Date('2026-10-22T00:00:00Z')), 2027);
  assert.equal(currentSeasonYear(new Date('2027-05-30T00:00:00Z')), 2027);
  assert.equal(currentSeasonYear(new Date('2027-07-01T00:00:00Z')), 2028);
});

test('goalsOf ordena por minuto y cuenta los goles en propia puerta para el rival', () => {
  const goals = goalsOf(
    match('1', {
      goals: [goal('50051', 'Mbappé', 90, 'PENALTY', 3), goal('50124', 'Le Normand', 12, 'OWN'), goal('50051', 'Vinícius', 45, 'SCORED', 2)],
    })
  );
  assert.deepEqual(goals, [
    { teamId: '50051', player: 'Le Normand', minute: "12'", type: 'own' },
    { teamId: '50051', player: 'Vinícius', minute: "45+2'", type: 'goal' },
    { teamId: '50051', player: 'Mbappé', minute: "90+3'", type: 'penalty' },
  ]);
});

test('matchOf: ganador del partido y, solo en la vuelta, quién pasa la eliminatoria', () => {
  const winner = (id) => ({ team: { id } });
  const firstLeg = matchOf(
    match('2', { round: PLAYOFF, score: { home: 1, away: 1 }, extra: { leg: { number: 1 }, winner: { match: { reason: 'DRAW' }, aggregate: winner('50124') } } })
  );
  assert.equal(firstLeg.winner, null);
  assert.equal(firstLeg.qualified, null);
  assert.equal(firstLeg.aggregate, null);
  assert.equal(firstLeg.stadium, 'Santiago Bernabéu');

  const secondLeg = matchOf(
    match('3', {
      round: PLAYOFF,
      home: ATL,
      away: RM,
      score: { home: 2, away: 2 },
      extra: { leg: { number: 2 }, score: { total: { home: 2, away: 2 }, aggregate: { home: 3, away: 3 }, penalty: { home: 4, away: 3 } }, winner: { match: {}, aggregate: winner('50124') } },
    })
  );
  assert.deepEqual(secondLeg.aggregate, { home: 3, away: 3 });
  assert.deepEqual(secondLeg.penalties, { home: 4, away: 3 });
  assert.equal(secondLeg.qualified, '50124');
  assert.equal(secondLeg.matchdayName, 'Vuelta');
  assert.equal(firstLeg.matchdayName, 'Ida');
});

test('roundsOf devuelve las rondas en el orden de la competición con nombre en español', () => {
  const rounds = roundsOf([match('1'), match('2', { round: PLAYOFF })]);
  assert.deepEqual(
    rounds.map((r) => r.name),
    ['Eliminatoria previa', 'Fase de liga']
  );
  assert.equal(matchOf(match('1')).matchdayName, 'Jornada 1');
});

test('formOf: últimos resultados de la ronda, del más antiguo al más reciente', () => {
  const matches = [
    matchOf(match('1', { date: '2026-09-16T19:00:00Z', score: { home: 2, away: 0 } })),
    matchOf(match('2', { date: '2026-10-01T19:00:00Z', home: ATL, away: RM, score: { home: 1, away: 1 } })),
    matchOf(match('3', { date: '2026-10-21T19:00:00Z', score: { home: 0, away: 1 } })),
    matchOf(match('4', { date: '2026-11-04T20:00:00Z', status: 'UPCOMING' })),
  ];
  assert.deepEqual(formOf('50051', matches, '2002239'), ['G', 'E', 'P']);
  assert.deepEqual(formOf('50124', matches, '2002239'), ['P', 'E', 'G']);
});

test('standingsOf convierte la clasificación y añade la racha', () => {
  const matches = [matchOf(match('1', { score: { home: 3, away: 1 } }))];
  const groups = [
    {
      group: { roundId: '2002239', translations: { name: { ES: 'League' } } },
      round: { id: '2002239' },
      status: 'OFFICIAL',
      items: [
        { rank: 2, teamId: '50124', team: ATL, played: 1, won: 0, drawn: 0, lost: 1, goalsFor: 1, goalsAgainst: 3, goalDifference: -2, points: 0, rankTrend: 'DOWN' },
        { rank: 1, teamId: '50051', team: RM, played: 1, won: 1, drawn: 0, lost: 0, goalsFor: 3, goalsAgainst: 1, goalDifference: 2, points: 3, rankTrend: 'UP', isLive: true },
      ],
    },
  ];
  const [table] = standingsOf(groups, matches);
  assert.equal(table.official, true);
  assert.deepEqual(
    table.rows.map((r) => [r.rank, r.team, r.points, r.trend, r.form.join(''), r.live]),
    [
      [1, '50051', 3, 'up', 'G', true],
      [2, '50124', 0, 'down', 'P', false],
    ]
  );
});

test('leadersOf ordena por la estadística y deshace empates con menos partidos', () => {
  const row = (name, goals, assists, matches) => ({
    player: { internationalName: name },
    teamId: '50051',
    statistics: [
      { name: 'goals', value: String(goals) },
      { name: 'assists', value: String(assists) },
      { name: 'matches_appearance', value: String(matches) },
    ],
  });
  const rows = [row('A', 3, 0, 3), row('B', 3, 1, 2), row('C', 0, 2, 3), row('D', 5, 0, 3)];
  assert.deepEqual(
    leadersOf(rows, 'goals').map((p) => p.name),
    ['D', 'B', 'A']
  );
  assert.deepEqual(
    leadersOf(rows, 'assists').map((p) => p.name),
    ['C', 'B']
  );
});

test('buildCurrentSeason junta todo y usa los escudos locales', () => {
  const data = buildCurrentSeason({
    seasonYear: 2027,
    rawMatches: [match('1', { score: { home: 1, away: 0 }, goals: [goal('50051', 'Mbappé', 10)] }), match('2', { status: 'UPCOMING', date: '2026-11-04T20:00:00Z', home: ATL, away: team('1', 'TBD', { isPlaceHolder: true }) })],
    groups: [],
    scorerRows: [],
    assistRows: [],
    logos: { 50051: 'images/teams/50051.png' },
  });
  assert.equal(data.season, '2026-27');
  assert.equal(data.matches.length, 2);
  assert.deepEqual(Object.keys(data.teams).sort(), ['50051', '50124']);
  assert.equal(data.teams['50051'].logo, 'images/teams/50051.png');
  assert.equal(data.teams['50051'].name, 'Real Madrid');
  assert.equal(data.teams['50124'].name, 'Atlético de Madrid');
  assert.equal(data.teams['50124'].logo, undefined);
  assert.equal(data.teams['50124'].logoUrl, undefined);
});
