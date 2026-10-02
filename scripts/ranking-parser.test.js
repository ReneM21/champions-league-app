// Se ejecuta con el test runner de Node: npm run test:scripts
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { parseTopScorers, topPlayers, validateRanking } = require('./ranking-parser');

const fixture = fs.readFileSync(path.join(__dirname, '__fixtures__', 'wikipedia-top-scorers.html'), 'utf8');

test('lee la tabla histórica e ignora las demás tablas', () => {
  const rows = parseTopScorers(fixture);
  assert.equal(rows.length, 12);
  assert.deepEqual(rows[0], {
    id: 'cristiano-ronaldo',
    name: 'Cristiano Ronaldo',
    nationality: 'Portugal',
    goals: 140,
    matches: 183,
    years: '2003–2022',
    clubs: ['Manchester United', 'Real Madrid', 'Juventus'],
  });
  assert.ok(!rows.some((r) => r.name === 'Harry Kane'));
});

test('mantiene las columnas alineadas cuando el puesto ocupa varias filas', () => {
  const rows = parseTopScorers(fixture);
  const ruud = rows.find((r) => r.id === 'ruud-van-nistelrooy');
  assert.equal(ruud.goals, 57);
  assert.equal(ruud.matches, 81);
  assert.equal(ruud.nationality, 'Países Bajos');
});

test('usa los alias y traduce las naciones', () => {
  const rows = parseTopScorers(fixture);
  const raul = rows.find((r) => r.name === 'Raúl');
  assert.equal(raul.id, 'raul-gonzalez');
  assert.equal(raul.nationality, 'España');
  assert.equal(rows.find((r) => r.id === 'andriy-shevchenko').nationality, 'Ucrania');
});

test('acepta una columna de nación separada y códigos FIFA', () => {
  const html = `<table>
    <tr><th>Rank</th><th>Nation</th><th>Player</th><th>Goals</th><th>Matches</th></tr>
    <tr><td>1</td><td>POR</td><td><a>Cristiano Ronaldo</a></td><td>140</td><td>183</td></tr>
  </table>`;
  const [row] = parseTopScorers(html);
  assert.equal(row.nationality, 'Portugal');
  assert.equal(row.matches, 183);
  assert.deepEqual(row.clubs, []);
});

test('falla si no encuentra la tabla', () => {
  assert.throws(() => parseTopScorers('<table><tr><th>Season</th></tr></table>'), /No se encontró la tabla/);
});

test('topPlayers incluye a todos los empatados con el décimo', () => {
  const rows = Array.from({ length: 12 }, (_, i) => ({ id: `p${i}`, goals: i < 9 ? 100 - i : 50 }));
  assert.equal(topPlayers(rows).length, 12);
  assert.equal(topPlayers(parseTopScorers(fixture)).length, 10);
});

test('validateRanking acepta el ranking del ejemplo', () => {
  assert.doesNotThrow(() => validateRanking(topPlayers(parseTopScorers(fixture)), null));
});

test('validateRanking rechaza datos sospechosos', () => {
  const players = topPlayers(parseTopScorers(fixture));
  assert.throws(() => validateRanking(players.slice(0, 5), null), /mínimo 10/);
  assert.throws(() => validateRanking(players.filter((p) => p.id !== 'cristiano-ronaldo').concat(players[9]), null), /Cristiano Ronaldo/);

  const generated = { updatedAt: '2026-01-01T00:00:00Z', players: [{ id: 'lionel-messi', goals: 140 }] };
  assert.throws(() => validateRanking(players, generated), /Lionel Messi baja de 140 a 129/);
  // El ranking inicial es manual (updatedAt null): no se compara
  assert.doesNotThrow(() => validateRanking(players, { ...generated, updatedAt: null }));
});
