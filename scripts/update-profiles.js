// Crea la ficha automática de los jugadores de los rankings: biografía
// (introducción de su artículo en la Wikipedia en español), fecha de
// nacimiento y posición (Wikidata). Si el jugador tiene ficha manual en
// players.json, la app usa lo manual y la automática solo completa huecos.
// Se guarda en public/data/profiles.json. Lo ejecuta el workflow
// .github/workflows/update-data.yml; en local: npm run update-profiles
const fs = require('fs');
const path = require('path');
const {
  wikidataIdFromPageProps,
  entityData,
  labelsFromEntities,
  extractFromQuery,
  trimBiography,
  playersWithoutProfile,
  PROFILE_VERSION,
} = require('./profiles');

const DATA = path.join(__dirname, '..', 'public', 'data');
const PROFILES_FILE = path.join(DATA, 'profiles.json');
const HEADERS = { 'User-Agent': 'champions-league-app (https://github.com/ReneM21/champions-league-app)' };

const readJson = (file, fallback) => (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback);

async function api(host, params) {
  const url = `https://${host}/w/api.php?${new URLSearchParams({ format: 'json', ...params })}`;
  const response = await fetch(url, { headers: HEADERS });
  if (!response.ok) throw new Error(`${response.status} en ${url}`);
  return response.json();
}

async function buildProfile(player) {
  const pageProps = await api('en.wikipedia.org', {
    action: 'query',
    formatversion: '2',
    prop: 'pageprops',
    ppprop: 'wikibase_item',
    redirects: '1',
    titles: player.article,
  });
  const qid = wikidataIdFromPageProps(pageProps);
  if (!qid) return { reason: `el artículo "${player.article}" no tiene elemento en Wikidata` };

  const data = entityData(
    await api('www.wikidata.org', { action: 'wbgetentities', ids: qid, props: 'claims|sitelinks', sitefilter: 'eswiki' }),
    qid
  );
  if (!data) return { reason: `no se pudo leer ${qid} de Wikidata` };

  const position = data.positionIds.length
    ? labelsFromEntities(
        await api('www.wikidata.org', { action: 'wbgetentities', ids: data.positionIds.join('|'), props: 'labels', languages: 'es' }),
        data.positionIds
      ).join(', ')
    : '';

  let biography = '';
  if (data.esTitle) {
    const extract = await api('es.wikipedia.org', {
      action: 'query',
      formatversion: '2',
      prop: 'extracts',
      exintro: '1',
      explaintext: '1',
      redirects: '1',
      titles: data.esTitle,
    });
    biography = trimBiography(extractFromQuery(extract));
  }

  return {
    profile: {
      version: PROFILE_VERSION,
      wikidata: qid,
      birthdate: data.birthdate,
      position: position || null,
      biography: biography || null,
      biographySource: data.esTitle ? `https://es.wikipedia.org/wiki/${encodeURIComponent(data.esTitle.replace(/ /g, '_'))}` : null,
    },
  };
}

async function main() {
  const rankings = [readJson(path.join(DATA, 'ranking.json'), { players: [] }), readJson(path.join(DATA, 'assists.json'), { players: [] })];
  const profiles = readJson(PROFILES_FILE, {});

  const pending = playersWithoutProfile(rankings, profiles);
  if (pending.length === 0) {
    console.log('Todos los jugadores tienen ficha.');
    return;
  }

  let added = 0;
  const errors = [];
  for (const player of pending) {
    try {
      const { profile, reason } = await buildProfile(player);
      if (!profile) {
        console.log(`- ${player.name}: ${reason}`);
        continue;
      }
      profiles[player.id] = profile;
      added++;
      console.log(`+ ${player.name}: ${profile.birthdate || 'sin fecha'} · ${profile.position || 'sin posición'} · biografía de ${profile.biography ? profile.biography.length : 0} caracteres`);
    } catch (error) {
      errors.push(`${player.name}: ${error.message}`);
    }
  }

  if (added > 0) {
    const sorted = Object.fromEntries(Object.keys(profiles).sort().map((id) => [id, profiles[id]]));
    fs.writeFileSync(PROFILES_FILE, `${JSON.stringify(sorted, null, 2)}\n`);
    console.log(`${added} ficha(s) nuevas.`);
  }

  if (errors.length) {
    console.error(`Errores:\n- ${errors.join('\n- ')}`);
    // Solo falla si no se pudo crear ninguna, como el paso de fotos
    if (added === 0) process.exit(1);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
