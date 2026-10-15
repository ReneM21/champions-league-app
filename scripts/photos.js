// Funciones puras para elegir la foto de un jugador en Wikimedia Commons y
// extraer su crédito. update-photos.js hace las descargas.
const cheerio = require('cheerio');

// Imagen principal del artículo según la API de MediaWiki
// (prop=pageimages&pilicense=free: solo devuelve imágenes con licencia libre).
// Admite formatversion=1 (pages como objeto) y 2 (pages como lista).
function pageImageFromQuery(response) {
  const pages = Object.values((response && response.query && response.query.pages) || {});
  const page = pages.find((p) => p && p.pageimage);
  return page ? page.pageimage : null;
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

// Jugadores de los rankings sin foto propia ni descargada. También los que
// tienen elegida a mano una foto de Commons ("photoFile" en players.json)
// distinta de la descargada, por ejemplo una de cuando jugaban.
function playersWithoutPhoto(rankings, details, photos) {
  const detailsById = new Map(details.map((d) => [d.id, d]));
  const seen = new Set();
  const result = [];
  for (const player of rankings.flatMap((r) => r.players)) {
    const detail = detailsById.get(player.id) || {};
    const current = photos[player.id];
    const wanted = detail.photoFile && (!current || current.file !== detail.photoFile);
    if (detail.image || seen.has(player.id) || (current && !wanted)) continue;
    seen.add(player.id);
    result.push({
      id: player.id,
      name: player.name,
      article: player.article || player.name.replace(/ /g, '_'),
      ...(detail.photoFile ? { photoFile: detail.photoFile } : {}),
    });
  }
  return result;
}

module.exports = { pageImageFromQuery, photoFromImageInfo, extensionFromUrl, playersWithoutPhoto };
