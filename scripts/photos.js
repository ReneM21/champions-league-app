// Funciones puras para elegir la foto de un jugador en Wikimedia Commons y
// extraer su crédito. update-photos.js hace las descargas.
const cheerio = require('cheerio');

const COMMONS_PREFIX = 'https://upload.wikimedia.org/wikipedia/commons/';

// Imagen principal del artículo (API REST /page/summary). Solo se aceptan
// archivos de Commons, que tienen licencia libre; las imágenes subidas a la
// Wikipedia en inglés suelen ser "fair use" y no se pueden reutilizar.
function commonsFileFromSummary(summary) {
  const url = (summary && (summary.originalimage || summary.thumbnail) || {}).source;
  if (!url || !url.startsWith(COMMONS_PREFIX)) return null;

  // .../commons/a/ab/Nombre.jpg  o  .../commons/thumb/a/ab/Nombre.jpg/320px-Nombre.jpg
  const parts = url.slice(COMMONS_PREFIX.length).split('/');
  const fileName = parts[0] === 'thumb' ? parts[3] : parts[2];
  return fileName ? decodeURIComponent(fileName) : null;
}

const htmlToText = (html) => cheerio.load(`<div>${html || ''}</div>`)('div').text().replace(/\s+/g, ' ').trim();

// Crédito y URL de descarga a partir de la respuesta de la API de Commons
// (prop=imageinfo, iiprop=url|extmetadata, iiurlwidth=...)
function photoFromImageInfo(response) {
  const pages = Object.values((response && response.query && response.query.pages) || {});
  const info = pages[0] && pages[0].imageinfo && pages[0].imageinfo[0];
  if (!info) return null;

  const meta = info.extmetadata || {};
  const value = (key) => (meta[key] && meta[key].value) || '';
  const license = htmlToText(value('LicenseShortName'));
  if (!license) return null; // sin licencia conocida no se usa

  return {
    url: info.thumburl || info.url,
    author: htmlToText(value('Artist')) || 'Autor desconocido',
    license,
    licenseUrl: value('LicenseUrl') || null,
    source: info.descriptionurl,
  };
}

function extensionFromUrl(url) {
  const match = url.toLowerCase().match(/\.(jpe?g|png|webp|gif)(?:$|\?)/);
  return match ? `.${match[1] === 'jpeg' ? 'jpg' : match[1]}` : '.jpg';
}

// Jugadores de los rankings sin foto propia ni descargada
function playersWithoutPhoto(rankings, details, photos) {
  const withImage = new Set(details.filter((d) => d.image).map((d) => d.id));
  const seen = new Set();
  const result = [];
  for (const player of rankings.flatMap((r) => r.players)) {
    if (withImage.has(player.id) || photos[player.id] || seen.has(player.id)) continue;
    seen.add(player.id);
    result.push({ id: player.id, name: player.name, article: player.article || player.name.replace(/ /g, '_') });
  }
  return result;
}

module.exports = { commonsFileFromSummary, photoFromImageInfo, extensionFromUrl, playersWithoutPhoto };
