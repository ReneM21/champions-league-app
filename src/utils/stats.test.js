import { formatRatio, rankPlayers, summarizeSeasons, teamBreakdown } from './stats';

describe('rankPlayers', () => {
  it('comparte posición en caso de empate', () => {
    const ranked = rankPlayers([{ goals: 60 }, { goals: 56 }, { goals: 56 }, { goals: 50 }]);
    expect(ranked.map((p) => p.position)).toEqual([1, 2, 2, 4]);
  });
});

describe('summarizeSeasons', () => {
  const seasons = [
    { season: '2012-13', club: 'B', goals: 5 },
    { season: '2010-11', club: 'A', goals: 10, matches: 10, assists: 2, title: true },
    { season: '2011-12', club: 'A', goals: 10, matches: 5 },
  ];

  it('ordena cronológicamente y agrupa clubes y títulos', () => {
    const summary = summarizeSeasons(seasons);
    expect(summary.first.season).toBe('2010-11');
    expect(summary.last.season).toBe('2012-13');
    expect(summary.clubs).toEqual(['A', 'B']);
    expect(summary.titleSeasons).toEqual(['2010-11']);
  });

  it('en un empate de goles elige la primera temporada', () => {
    expect(summarizeSeasons(seasons).best.season).toBe('2010-11');
  });

  it('ignora las temporadas sin partidos al calcular promedios', () => {
    const summary = summarizeSeasons(seasons);
    expect(summary.totalGoals).toBe(25);
    expect(summary.totalMatches).toBe(15);
    expect(summary.totalAssists).toBe(2);
    expect(formatRatio(summary.goalsPerMatch)).toBe('1.33');
    expect(summary.mostEfficient.season).toBe('2011-12');
  });

  it('devuelve valores vacíos sin temporadas', () => {
    const summary = summarizeSeasons([]);
    expect(summary.best).toBeNull();
    expect(summary.mostEfficient).toBeNull();
    expect(summary.totalMatches).toBeNull();
    expect(formatRatio(summary.goalsPerMatch)).toBe('-');
  });
});

describe('teamBreakdown', () => {
  it('cuenta temporadas y porcentaje de goles por equipo', () => {
    const player = {
      goals: 20,
      teams: [{ name: 'A', goals: 15 }, { name: 'B', goals: 5 }],
      seasons: [{ club: 'A' }, { club: 'A' }, { club: 'B' }],
    };
    expect(teamBreakdown(player)).toEqual([
      { name: 'A', goals: 15, seasons: 2, share: 75 },
      { name: 'B', goals: 5, seasons: 1, share: 25 },
    ]);
  });
});
