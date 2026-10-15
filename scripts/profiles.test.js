// Se ejecuta con el test runner de Node: npm run test:scripts
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  wikidataIdFromPageProps,
  formatWikidataDate,
  entityData,
  labelsFromEntities,
  extractFromQuery,
  trimBiography,
  playersWithoutProfile,
} = require('./profiles');

test('wikidataIdFromPageProps lee el elemento de Wikidata', () => {
  assert.equal(wikidataIdFromPageProps({ query: { pages: [{ title: 'Ryan Giggs', pageprops: { wikibase_item: 'Q1' } }] } }), 'Q1');
  assert.equal(wikidataIdFromPageProps({ query: { pages: [{ title: 'No existe', missing: true }] } }), null);
});

test('formatWikidataDate solo acepta fechas con precisión de día', () => {
  assert.equal(formatWikidataDate({ time: '+1973-11-29T00:00:00Z', precision: 11 }), '29/11/1973');
  assert.equal(formatWikidataDate({ time: '+1973-00-00T00:00:00Z', precision: 9 }), null);
  assert.equal(formatWikidataDate(undefined), null);
});

test('entityData extrae nacimiento, posiciones y título en español', () => {
  const response = {
    entities: {
      Q1: {
        claims: {
          P569: [{ mainsnak: { datavalue: { value: { time: '+1980-01-25T00:00:00Z', precision: 11 } } } }],
          P413: [{ mainsnak: { datavalue: { value: { id: 'Q10' } } } }, { mainsnak: { snaktype: 'somevalue' } }],
        },
        sitelinks: { eswiki: { title: 'Xavi Hernández' } },
      },
    },
  };
  assert.deepEqual(entityData(response, 'Q1'), { birthdate: '25/01/1980', positionIds: ['Q10'], esTitle: 'Xavi Hernández' });
  assert.equal(entityData({ entities: { Q2: { id: 'Q2', missing: '' } } }, 'Q2'), null);
  assert.deepEqual(entityData({ entities: { Q3: {} } }, 'Q3'), { birthdate: null, positionIds: [], esTitle: null });
});

test('labelsFromEntities devuelve las etiquetas en español que existan', () => {
  const response = { entities: { Q10: { labels: { es: { value: 'centrocampista' } } }, Q11: { labels: {} } } };
  assert.deepEqual(labelsFromEntities(response, ['Q10', 'Q11']), ['centrocampista']);
});

test('extractFromQuery lee la introducción', () => {
  assert.equal(extractFromQuery({ query: { pages: [{ extract: 'Hola.' }] } }), 'Hola.');
  assert.equal(extractFromQuery(null), '');
});

test('trimBiography corta en frases completas', () => {
  const text = 'Primera frase. Segunda frase algo más larga.\n\nTercera frase.';
  assert.equal(trimBiography(text, 40), 'Primera frase.');
  assert.equal(trimBiography(text, 200), 'Primera frase. Segunda frase algo más larga. Tercera frase.');
  assert.equal(trimBiography('Una sola frase muy larga sin punto final', 10), 'Una sola frase muy larga sin punto final');
  assert.equal(trimBiography(''), '');
});

test('playersWithoutProfile ignora fichas automáticas existentes y repetidos', () => {
  const rankings = [{ players: [{ id: 'a', name: 'A' }, { id: 'b', name: 'Jugador B' }] }, { players: [{ id: 'b', name: 'Jugador B' }, { id: 'c', name: 'C', article: 'C_(footballer)' }] }];
  assert.deepEqual(playersWithoutProfile(rankings, { a: {} }), [
    { id: 'b', name: 'Jugador B', article: 'Jugador_B' },
    { id: 'c', name: 'C', article: 'C_(footballer)' },
  ]);
  assert.deepEqual(playersWithoutProfile(rankings, { a: {}, b: {}, c: {} }), []);
});
