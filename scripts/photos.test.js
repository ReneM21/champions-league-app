// Se ejecuta con el test runner de Node: npm run test:scripts
const test = require('node:test');
const assert = require('node:assert/strict');
const { commonsFileFromSummary, photoFromImageInfo, extensionFromUrl, playersWithoutPhoto } = require('./photos');

test('commonsFileFromSummary extrae el archivo de Commons', () => {
  assert.equal(
    commonsFileFromSummary({ originalimage: { source: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Ryan_Giggs_2011.jpg' } }),
    'Ryan_Giggs_2011.jpg'
  );
  assert.equal(
    commonsFileFromSummary({ thumbnail: { source: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Xavi_Hern%C3%A1ndez.jpg/320px-Xavi_Hern%C3%A1ndez.jpg' } }),
    'Xavi_Hernández.jpg'
  );
});

test('commonsFileFromSummary descarta imágenes que no son de Commons o artículos sin imagen', () => {
  assert.equal(commonsFileFromSummary({ originalimage: { source: 'https://upload.wikimedia.org/wikipedia/en/1/1a/Logo.png' } }), null);
  assert.equal(commonsFileFromSummary({ title: 'Sin imagen' }), null);
  assert.equal(commonsFileFromSummary(null), null);
});

test('photoFromImageInfo extrae URL y crédito en texto plano', () => {
  const response = {
    query: {
      pages: {
        123: {
          imageinfo: [
            {
              url: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Foto.jpg',
              thumburl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Foto.jpg/400px-Foto.jpg',
              descriptionurl: 'https://commons.wikimedia.org/wiki/File:Foto.jpg',
              extmetadata: {
                Artist: { value: '<a href="//commons.wikimedia.org/wiki/User:Ana">Ana  García</a>' },
                LicenseShortName: { value: 'CC BY-SA 4.0' },
                LicenseUrl: { value: 'https://creativecommons.org/licenses/by-sa/4.0' },
              },
            },
          ],
        },
      },
    },
  };
  assert.deepEqual(photoFromImageInfo(response), {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Foto.jpg/400px-Foto.jpg',
    author: 'Ana García',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    source: 'https://commons.wikimedia.org/wiki/File:Foto.jpg',
  });
});

test('photoFromImageInfo descarta archivos sin licencia o sin datos', () => {
  const sinLicencia = { query: { pages: { 1: { imageinfo: [{ url: 'x', extmetadata: { Artist: { value: 'A' } } }] } } } };
  assert.equal(photoFromImageInfo(sinLicencia), null);
  assert.equal(photoFromImageInfo({ query: { pages: { '-1': { missing: '' } } } }), null);
});

test('extensionFromUrl', () => {
  assert.equal(extensionFromUrl('https://x/400px-Foto.JPEG'), '.jpg');
  assert.equal(extensionFromUrl('https://x/400px-Escudo.svg.png'), '.png');
  assert.equal(extensionFromUrl('https://x/sin-extension'), '.jpg');
});

test('playersWithoutPhoto ignora a quien ya tiene foto y no repite jugadores', () => {
  const rankings = [
    { players: [{ id: 'a', name: 'A' }, { id: 'b', name: 'Jugador B', article: 'Jugador_B_(footballer)' }] },
    { players: [{ id: 'b', name: 'Jugador B' }, { id: 'c', name: 'C' }, { id: 'd', name: 'Jugador D' }] },
  ];
  const details = [{ id: 'a', image: 'images/players/1.jpeg' }, { id: 'd' }];
  const photos = { c: { image: 'images/players/c.jpg' } };
  assert.deepEqual(playersWithoutPhoto(rankings, details, photos), [
    { id: 'b', name: 'Jugador B', article: 'Jugador_B_(footballer)' },
    { id: 'd', name: 'Jugador D', article: 'Jugador_D' },
  ]);
});
