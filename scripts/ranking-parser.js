// Análisis de las tablas históricas de Wikipedia (goleadores y asistidores)
// y validación del ranking resultante. Sin E/S: update-ranking.js descarga y escribe.
const cheerio = require('cheerio');

const TOP_N = 10;

// Nombres de Wikipedia que no coinciden con el id que usa la app
const ID_ALIASES = {
  'Raúl': 'raul-gonzalez',
};

// Nación en inglés o código FIFA -> nombre en español
const NATIONS = {
  Argentina: 'Argentina', ARG: 'Argentina',
  Austria: 'Austria', AUT: 'Austria',
  Belgium: 'Bélgica', BEL: 'Bélgica',
  Brazil: 'Brasil', BRA: 'Brasil',
  Cameroon: 'Camerún', CMR: 'Camerún',
  Croatia: 'Croacia', CRO: 'Croacia',
  Egypt: 'Egipto', EGY: 'Egipto',
  England: 'Inglaterra', ENG: 'Inglaterra',
  France: 'Francia', FRA: 'Francia',
  Germany: 'Alemania', GER: 'Alemania',
  Italy: 'Italia', ITA: 'Italia',
  Netherlands: 'Países Bajos', NED: 'Países Bajos',
  Norway: 'Noruega', NOR: 'Noruega',
  Poland: 'Polonia', POL: 'Polonia',
  Portugal: 'Portugal', POR: 'Portugal',
  Spain: 'España', ESP: 'España',
  Sweden: 'Suecia', SWE: 'Suecia',
  Ukraine: 'Ucrania', UKR: 'Ucrania',
  Uruguay: 'Uruguay', URU: 'Uruguay',
  Wales: 'Gales', WAL: 'Gales',
};

const slugify = (text) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const playerId = (name) => ID_ALIASES[name] || slugify(name);

const translateNation = (nation) => (nation ? NATIONS[nation] || nation : '');

const cleanText = (text) => text.replace(/\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim();

const toInt = (text) => {
  const digits = cleanText(text).replace(/[^\d]/g, '');
  return digits ? parseInt(digits, 10) : NaN;
};

// Convierte las filas en una cuadrícula expandiendo rowspan/colspan, para que
// cada celda quede en su columna aunque haya puestos empatados agrupados.
function tableGrid($, table) {
  const grid = [];
  $(table)
    .find('tr')
    .each((rowIndex, tr) => {
      grid[rowIndex] = grid[rowIndex] || [];
      let col = 0;
      $(tr)
        .children('th, td')
        .each((_, cell) => {
          while (grid[rowIndex][col]) col++;
          const rowspan = parseInt($(cell).attr('rowspan') || '1', 10);
          const colspan = parseInt($(cell).attr('colspan') || '1', 10);
          for (let r = 0; r < rowspan; r++) {
            grid[rowIndex + r] = grid[rowIndex + r] || [];
            for (let c = 0; c < colspan; c++) grid[rowIndex + r][col + c] = cell;
          }
          col += colspan;
        });
    });
  return grid;
}

// Configuración de cada ranking.
// - header: cabecera de la columna de la estadística (sin "per game", ratios...).
// - requireApps: la tabla debe tener columna de partidos. En la página de
//   goleadores evita confundir la tabla histórica con la de cada temporada.
// - largestTable: usa la tabla candidata con más filas en vez de la primera
//   (la página de récords tiene varias tablas con columna de asistencias).
// - leader: comprobación mínima del líder histórico.
const STATS = {
  goals: {
    label: 'goles',
    header: /^goals?\b(?!.*(per|ratio|\/))/,
    requireApps: true,
    largestTable: false,
    leader: { id: 'cristiano-ronaldo', min: 140 },
  },
  assists: {
    label: 'asistencias',
    header: /^assists?\b(?!.*(per|ratio|\/))/,
    requireApps: false,
    largestTable: true,
    leader: null,
  },
};

const MIN_LEADER = 30; // ningún líder histórico tiene menos

// Índice de cada columna a partir del texto de la cabecera
function columnIndexes($, headerRow, statHeader) {
  const find = (regex) => headerRow.findIndex((cell) => cell && regex.test(cleanText($(cell).text()).toLowerCase()));
  return {
    player: find(/^player/),
    nation: find(/^(nation|country)/),
    stat: find(statHeader),
    apps: find(/^(apps|appearances|matches)/),
    years: find(/^(years|career|seasons)/),
    clubs: find(/^club/),
  };
}

function nationFromCell($, cell) {
  const flag = $(cell).find('.flagicon').first();
  const title = flag.find('a[title]').attr('title');
  if (title) return title;
  const src = flag.find('img').attr('src') || flag.find('img').attr('resource') || '';
  const match = decodeURIComponent(src).match(/Flag_of_(?:the_)?([^./]+?)(?:_\(\d+\))?\.svg/);
  if (match) return match[1].replace(/_/g, ' ');
  const code = cleanText($(cell).text()).match(/\(([A-Z]{3})\)/);
  return code ? code[1] : '';
}

function playerName($, cell) {
  const copy = $(cell).clone();
  copy.find('.flagicon, sup, style, .sortkey').remove();
  const link = copy.find('a').first();
  const raw = link.length ? link.text() : copy.text();
  return cleanText(raw).replace(/\s*\([A-Z]{3}\)\s*$/, '').replace(/[*†‡^]+$/, '').trim();
}

function clubsFromCell($, cell) {
  const copy = $(cell).clone();
  copy.find('sup, .flagicon, style').remove();
  const links = copy.find('a').map((_, a) => cleanText($(a).text())).get();
  const names = links.length ? links : copy.text().split(/\n|,|;/);
  return [...new Set(names.map((n) => cleanText(n).replace(/\s*\(.*?\)\s*/g, '')).filter(Boolean))];
}

function rowsFromTable($, table, stat, config) {
  const grid = tableGrid($, table);
  const headerIndex = grid.findIndex((row) => {
    const cols = columnIndexes($, row, config.header);
    return cols.player >= 0 && cols.stat >= 0 && (!config.requireApps || cols.apps >= 0);
  });
  if (headerIndex < 0) return [];

  const cols = columnIndexes($, grid[headerIndex], config.header);
  const rows = [];
  for (const row of grid.slice(headerIndex + 1)) {
    const playerCell = row[cols.player];
    if (!playerCell || ($(playerCell).is('th') && cleanText($(playerCell).text()).toLowerCase() === 'player')) continue;
    const name = playerName($, playerCell);
    const value = toInt($(row[cols.stat]).text());
    if (!name || Number.isNaN(value)) continue;

    const nation =
      cols.nation >= 0
        ? nationFromCell($, row[cols.nation]) || cleanText($(row[cols.nation]).text())
        : nationFromCell($, playerCell);
    const apps = cols.apps >= 0 ? toInt($(row[cols.apps]).text()) : NaN;
    rows.push({
      id: playerId(name),
      name,
      nationality: translateNation(nation),
      [stat]: value,
      matches: Number.isNaN(apps) ? null : apps,
      years: cols.years >= 0 ? cleanText($(row[cols.years]).text()) : '',
      clubs: cols.clubs >= 0 ? clubsFromCell($, row[cols.clubs]) : [],
    });
  }
  return rows;
}

// Devuelve las filas de la tabla histórica de la estadística ('goals' o 'assists')
function parseStatTable(html, stat) {
  const config = STATS[stat];
  const $ = cheerio.load(html);
  let best = [];

  for (const table of $('table').toArray()) {
    const rows = rowsFromTable($, table, stat, config);
    if (rows.length && !config.largestTable) return rows;
    if (rows.length > best.length) best = rows;
  }
  if (best.length) return best;

  throw new Error(`No se encontró la tabla de ${config.label} (columnas Player y ${stat === 'goals' ? 'Goals' : 'Assists'}).`);
}

const parseTopScorers = (html) => parseStatTable(html, 'goals');

// Los TOP_N con más valor en la estadística, incluidos los empatados con el último
function topPlayers(rows, stat = 'goals', n = TOP_N) {
  const sorted = [...rows].sort((a, b) => b[stat] - a[stat]);
  if (sorted.length <= n) return sorted;
  const cutoff = sorted[n - 1][stat];
  return sorted.filter((row) => row[stat] >= cutoff);
}

// Lanza un error si el resultado no es fiable; así el workflow falla sin publicar
function validateRanking(players, previous, stat = 'goals') {
  const { label, leader } = STATS[stat];
  const errors = [];
  if (players.length < TOP_N) errors.push(`Solo hay ${players.length} jugadores (mínimo ${TOP_N}).`);
  players.forEach((p, i) => {
    if (!Number.isInteger(p[stat]) || p[stat] <= 0) errors.push(`Valor de ${label} no válido para ${p.name}: ${p[stat]}`);
    if (i > 0 && p[stat] > players[i - 1][stat]) errors.push(`El ranking no está ordenado en ${p.name}.`);
  });
  const ids = players.map((p) => p.id);
  if (new Set(ids).size !== ids.length) errors.push('Hay ids de jugador repetidos.');

  if (players.length && players[0][stat] < MIN_LEADER) {
    errors.push(`El líder solo tiene ${players[0][stat]} ${label} (mínimo ${MIN_LEADER}).`);
  }
  if (leader) {
    const found = players.find((p) => p.id === leader.id);
    if (!found || found[stat] < leader.min) errors.push(`Cristiano Ronaldo no aparece con al menos ${leader.min} ${label}.`);
  }

  // Solo se compara con un ranking que ya vino de Wikipedia (el inicial es manual)
  if (previous && previous.updatedAt) {
    for (const before of previous.players) {
      const now = players.find((p) => p.id === before.id);
      if (now && now[stat] < before[stat] - 2) {
        errors.push(`${now.name} baja de ${before[stat]} a ${now[stat]} ${label}.`);
      }
    }
  }

  if (errors.length) throw new Error(`Datos descartados:\n- ${errors.join('\n- ')}`);
}

module.exports = { parseStatTable, parseTopScorers, topPlayers, validateRanking, playerId, translateNation, STATS, TOP_N };
