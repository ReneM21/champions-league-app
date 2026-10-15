// Se ejecuta con el test runner de Node: npm run test:scripts
const test = require('node:test');
const assert = require('node:assert/strict');
const { pageImageFromQuery, photoFromImageInfo, extensionFromUrl, playersWithoutPhoto } = require('./photos');

test('pageImageFromQuery lee la imagen principal (formatversion 1 y 2)', () => {
  const v2 = { query: { redirects: [{ from: 'Xavi', to: 'Xavi Hernández' }], pages: [{ pageid: 1, title: 'Xavi Hernández', pageimage: 'Xavi_2016.jpg' }] } };
  assert.equal(pageImageFromQuery(v2), 'Xavi_2016.jpg');
  const v1 = { query: { pages: { 123: { pageid: 123, title: 'Ryan Giggs', pageimage: 'Ryan_Giggs_2018.jpg' } } } };
  assert.equal(pageImageFromQuery(v1), 'Ryan_Giggs_2018.jpg');
});

test('pageImageFromQuery devuelve null sin imagen o sin página', () => {
  assert.equal(pageImageFromQuery({ query: { pages: [{ pageid: 1, title: 'Sin imagen' }] } }), null);
  assert.equal(pageImageFromQuery({ query: { pages: [{ title: 'No existe', missing: true }] } }), null);
  assert.equal(pageImageFromQuery(null), null);
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

test('playersWithoutPhoto incluye a quien tiene una foto elegida a mano distinta de la descargada', () => {
  const rankings = [{ players: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }, { id: 'c', name: 'C' }] }];
  const details = [
    { id: 'a', photoFile: 'File:A 2008.jpg' },
    { id: 'b', photoFile: 'File:B 2010.jpg' },
    { id: 'c', image: 'images/players/c.jpg', photoFile: 'File:C.jpg' },
  ];
  const photos = { a: { image: 'images/players/a.jpg' }, b: { image: 'images/players/b.jpg', file: 'File:B 2010.jpg' } };
  assert.deepEqual(playersWithoutPhoto(rankings, details, photos), [{ id: 'a', name: 'A', article: 'A', photoFile: 'File:A 2008.jpg' }]);
});
