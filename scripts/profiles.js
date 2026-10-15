// Funciones puras para crear la ficha automática de un jugador a partir de
// Wikidata y de la Wikipedia en español. update-profiles.js hace las descargas.

const firstPage = (response) => {
  const pages = Object.values((response && response.query && response.query.pages) || {});
  return pages[0] || null;
};

// Identificador de Wikidata del artículo (prop=pageprops&ppprop=wikibase_item)
function wikidataIdFromPageProps(response) {
  const page = firstPage(response);
  return (page && page.pageprops && page.pageprops.wikibase_item) || null;
}

const claimValues = (entity, property) =>
  ((entity.claims && entity.claims[property]) || [])
    .map((claim) => claim.mainsnak && claim.mainsnak.datavalue && claim.mainsnak.datavalue.value)
    .filter(Boolean);

// "+1973-11-29T00:00:00Z" (precisión de día) -> "29/11/1973"
function formatWikidataDate(value) {
  if (!value || value.precision < 11) return null;
  const match = /^\+?(\d{4})-(\d{2})-(\d{2})/.exec(value.time || '');
  return match ? `${match[3]}/${match[2]}/${match[1]}` : null;
}

// Datos que interesan de la entidad (wbgetentities con props=claims|sitelinks)
function entityData(response, id) {
  const entity = response && response.entities && response.entities[id];
  if (!entity || entity.missing !== undefined) return null;
  return {
    birthdate: formatWikidataDate(claimValues(entity, 'P569')[0]),
    positionIds: claimValues(entity, 'P413').map((value) => value.id).filter(Boolean),
    esTitle: (entity.sitelinks && entity.sitelinks.eswiki && entity.sitelinks.eswiki.title) || null,
  };
}

// Etiquetas en español de varias entidades (wbgetentities con props=labels)
function labelsFromEntities(response, ids) {
  const entities = (response && response.entities) || {};
  return ids
    .map((id) => entities[id] && entities[id].labels && entities[id].labels.es && entities[id].labels.es.value)
    .filter(Boolean);
}

// Introducción del artículo (prop=extracts&exintro&explaintext)
function extractFromQuery(response) {
  const page = firstPage(response);
  return (page && page.extract) || '';
}

// Recorta la introducción a frases completas (como mucho maxChars, al menos una frase)
function trimBiography(text, maxChars = 600) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  const sentences = clean.split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ¿¡])/);
  let result = sentences[0];
  for (const sentence of sentences.slice(1)) {
    if (result.length + 1 + sentence.length > maxChars) break;
    result += ` ${sentence}`;
  }
  return result;
}

// Jugadores de los rankings que todavía no tienen ficha automática. Los que
// tienen ficha manual también la reciben (por ejemplo, para la posición),
// pero en la app los datos manuales siempre tienen prioridad.
function playersWithoutProfile(rankings, profiles) {
  const seen = new Set();
  const result = [];
  for (const player of rankings.flatMap((r) => r.players)) {
    if (profiles[player.id] || seen.has(player.id)) continue;
    seen.add(player.id);
    result.push({ id: player.id, name: player.name, article: player.article || player.name.replace(/ /g, '_') });
  }
  return result;
}

module.exports = {
  wikidataIdFromPageProps,
  formatWikidataDate,
  entityData,
  labelsFromEntities,
  extractFromQuery,
  trimBiography,
  playersWithoutProfile,
};
