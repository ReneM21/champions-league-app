// Descarga de Wikimedia Commons la foto de los jugadores de los rankings que
// no tienen una, y guarda autor y licencia en public/data/photos.json.
// Lo ejecuta el workflow .github/workflows/update-data.yml; en local:
// npm run update-photos
const fs = require('fs');
const path = require('path');
const { commonsFileFromSummary, photoFromImageInfo, extensionFromUrl, playersWithoutPhoto } = require('./photos');

const ROOT = path.join(__dirname, '..', 'public');
const DATA = path.join(ROOT, 'data');
const PHOTOS_FILE = path.join(DATA, 'photos.json');
const MAX_BYTES = 2 * 1024 * 1024;
const HEADERS = { 'User-Agent': 'champions-league-app (https://github.com/ReneM21/champions-league-app)' };

const readJson = (file, fallback) => (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback);

// Devuelve null si la página no existe (404): se trata como "sin foto"
async function getJson(url) {
  const response = await fetch(url, { headers: HEADERS });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`${response.status} en ${url}`);
  return response.json();
}

async function findPhoto(player) {
  const summary = await getJson(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(player.article)}`);
  const fileName = commonsFileFromSummary(summary);
  if (!fileName) return null;

  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    prop: 'imageinfo',
    iiprop: 'url|extmetadata',
    iiurlwidth: '400',
    titles: `File:${fileName}`,
  });
  return photoFromImageInfo(await getJson(`https://commons.wikimedia.org/w/api.php?${params}`));
}

async function download(url, file) {
  const response = await fetch(url, { headers: HEADERS });
  if (!response.ok) throw new Error(`${response.status} al descargar ${url}`);
  if (!(response.headers.get('content-type') || '').startsWith('image/')) throw new Error(`${url} no es una imagen`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > MAX_BYTES) throw new Error(`${url} pesa demasiado (${bytes.length} bytes)`);
  fs.writeFileSync(file, bytes);
}

async function main() {
  const rankings = [readJson(path.join(DATA, 'ranking.json'), { players: [] }), readJson(path.join(DATA, 'assists.json'), { players: [] })];
  const details = readJson(path.join(DATA, 'players.json'), []);
  const photos = readJson(PHOTOS_FILE, {});

  const pending = playersWithoutPhoto(rankings, details, photos);
  if (pending.length === 0) {
    console.log('Todos los jugadores tienen foto.');
    return;
  }

  let added = 0;
  const errors = [];
  for (const player of pending) {
    try {
      const photo = await findPhoto(player);
      if (!photo) {
        console.log(`- ${player.name}: el artículo no tiene una foto libre en Commons.`);
        continue;
      }
      const image = `images/players/${player.id}${extensionFromUrl(photo.url)}`;
      await download(photo.url, path.join(ROOT, image));
      const { url, ...credit } = photo;
      photos[player.id] = { image, ...credit };
      added++;
      console.log(`+ ${player.name}: ${photo.author} (${photo.license})`);
    } catch (error) {
      errors.push(`${player.name}: ${error.message}`);
    }
  }

  if (added > 0) {
    const sorted = Object.fromEntries(Object.keys(photos).sort().map((id) => [id, photos[id]]));
    fs.writeFileSync(PHOTOS_FILE, `${JSON.stringify(sorted, null, 2)}\n`);
    console.log(`${added} foto(s) nuevas.`);
  }

  if (errors.length) {
    console.error(`Errores:\n- ${errors.join('\n- ')}`);
    // Solo falla si no se pudo descargar nada: así un único jugador
    // problemático no deja el workflow en rojo todos los días.
    if (added === 0) process.exit(1);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
