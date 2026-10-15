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
  cleanBiography,
  PROFILE_VERSION,
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
  const current = { version: PROFILE_VERSION };
  assert.deepEqual(playersWithoutProfile(rankings, { a: current }), [
    { id: 'b', name: 'Jugador B', article: 'Jugador_B' },
    { id: 'c', name: 'C', article: 'C_(footballer)' },
  ]);
  assert.deepEqual(playersWithoutProfile(rankings, { a: current, b: current, c: current }), []);
  // Las fichas de una versión anterior se regeneran
  assert.deepEqual(playersWithoutProfile(rankings, { a: current, b: { version: 1 }, c: {} }).map((p) => p.id), ['b', 'c']);
});

test('cleanBiography quita pronunciación, corchetes y paréntesis vacíos (casos reales)', () => {
  assert.equal(
    cleanBiography('Sir David Robert Joseph Beckham (pronunciación en inglés: /ˈdeɪvɪd ˈbɛkəm/; Londres, Inglaterra, 2 de mayo de 1975) es un exfutbolista.'),
    'Sir David Robert Joseph Beckham (Londres, Inglaterra, 2 de mayo de 1975) es un exfutbolista.'
  );
  assert.equal(
    cleanBiography('Karim Mostafa Benzema ([árabe: / كريم بنزيما /; pronunciación en francés: /ka.ʁim bɛn.ze.ma/]; Lyon, Ródano, 19 de diciembre de 1987) es un futbolista francés de ascendencia argelina\u200b\u200b que juega como delantero.'),
    'Karim Mostafa Benzema (Lyon, Ródano, 19 de diciembre de 1987) es un futbolista francés de ascendencia argelina que juega como delantero.'
  );
  assert.equal(
    cleanBiography('Robert Lewandowski (pronunciado /ˈrɔbɛrt lɛvanˈdɔfskʲi/ ()) (Varsovia, 21 de agosto de 1988) es un futbolista polaco.'),
    'Robert Lewandowski (Varsovia, 21 de agosto de 1988) es un futbolista polaco.'
  );
  assert.equal(
    cleanBiography('Erling Braut Haaland (nacido como Håland, pronunciación en noruego: /æɭɪŋ ˈhɔːlɑːnd/; Leeds, Inglaterra, 21 de julio de 2000)\u200b es un futbolista noruego.'),
    'Erling Braut Haaland (nacido como Håland; Leeds, Inglaterra, 21 de julio de 2000) es un futbolista noruego.'
  );
});

test('trimBiography no corta en abreviaturas como "F. C."', () => {
  const text = 'Juega como delantero en el Manchester City F. C. de la Premier League. Es internacional con Noruega.';
  assert.equal(trimBiography(text, 80), 'Juega como delantero en el Manchester City F. C. de la Premier League.');
  assert.equal(trimBiography(text, 200), text);
});
