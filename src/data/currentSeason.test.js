import { describe, expect, it } from 'vitest';
import { byDay, defaultMatchday, matchdaysOf, resultFor, teamMatches, zoneOf } from './currentSeason';

const match = (id, round, matchday, date, status = 'FINISHED', extra = {}) => ({
  id,
  round,
  matchday,
  matchdayName: `Jornada ${matchday}`,
  date,
  status,
  home: 'A',
  away: 'B',
  score: status === 'UPCOMING' ? null : { home: 1, away: 0 },
  goals: [],
  ...extra,
});

const MATCHES = [
  match('1', 'liga', 1, '2026-09-16T19:00:00Z'),
  match('2', 'liga', 1, '2026-09-17T19:00:00Z'),
  match('3', 'liga', 2, '2026-10-01T19:00:00Z'),
  match('4', 'liga', 3, '2026-10-21T19:00:00Z', 'UPCOMING'),
  match('5', 'liga', 3, '2026-10-22T19:00:00Z', 'UPCOMING'),
];

describe('defaultMatchday', () => {
  it('elige la próxima jornada por jugar', () => {
    expect(defaultMatchday(MATCHES, new Date('2026-10-05T00:00:00Z'))).toEqual({ round: 'liga', key: 'liga-3' });
  });

  it('elige la jornada en juego aunque haya otras pendientes', () => {
    const live = [...MATCHES.slice(0, 2), { ...MATCHES[2], status: 'LIVE' }, ...MATCHES.slice(3)];
    expect(defaultMatchday(live, new Date('2026-10-01T19:30:00Z'))).toEqual({ round: 'liga', key: 'liga-2' });
  });

  it('si ya se jugó todo, la última jornada', () => {
    const done = MATCHES.map((m) => ({ ...m, status: 'FINISHED' }));
    expect(defaultMatchday(done, new Date('2027-07-01T00:00:00Z'))).toEqual({ round: 'liga', key: 'liga-3' });
  });
});

describe('matchdaysOf y byDay', () => {
  it('agrupa por jornada y por día', () => {
    const days = matchdaysOf(MATCHES, 'liga');
    expect(days.map((d) => [d.key, d.matches.length])).toEqual([
      ['liga-1', 2],
      ['liga-2', 1],
      ['liga-3', 2],
    ]);
    expect(byDay(days[0].matches)).toHaveLength(2);
  });
});

describe('resultFor', () => {
  it('victoria, empate, derrota y partidos sin jugar', () => {
    const won = match('1', 'liga', 1, null, 'FINISHED', { score: { home: 2, away: 1 } });
    expect(resultFor(won, 'A')).toBe('G');
    expect(resultFor(won, 'B')).toBe('P');
    expect(resultFor(match('2', 'liga', 1, null, 'FINISHED', { score: { home: 0, away: 0 } }), 'A')).toBe('E');
    expect(resultFor(match('3', 'liga', 1, null, 'UPCOMING'), 'A')).toBeNull();
  });

  it('un empate decidido en los penaltis cuenta como victoria o derrota', () => {
    const shootout = match('1', 'previa', 2, null, 'FINISHED', { score: { home: 2, away: 2 }, penalties: { home: 4, away: 1 } });
    expect(resultFor(shootout, 'A')).toBe('G');
    expect(resultFor(shootout, 'B')).toBe('P');
  });
});

describe('zoneOf y teamMatches', () => {
  it('zonas de la fase de liga', () => {
    expect(zoneOf(1).id).toBe('r16');
    expect(zoneOf(8).id).toBe('r16');
    expect(zoneOf(9).id).toBe('playoff');
    expect(zoneOf(24).id).toBe('playoff');
    expect(zoneOf(25).id).toBe('out');
  });

  it('partidos de un equipo', () => {
    expect(teamMatches([...MATCHES, { ...MATCHES[0], id: '9', home: 'C', away: 'D' }], 'B')).toHaveLength(5);
  });
});
