// Análisis de las tablas de Wikipedia sobre la competición: todas las finales,
// títulos por club y la clasificación histórica. Sin E/S:
// update-competition.js descarga las páginas y escribe public/data/competition.json.
const cheerio = require('cheerio');
const { tableGrid, cleanText, toInt, translateNation } = require('./ranking-parser');

// Nombres de club de Wikipedia -> nombres que usa la app (los de la UEFA)
const CLUB_NAMES = {
  Milan: 'AC Milan',
  'Inter Milan': 'Inter de Milán',
  'Bayern Munich': 'Bayern München',
  'Atlético Madrid': 'Atlético de Madrid',
  'Red Star Belgrade': 'Estrella Roja',
  'Steaua București': 'Steaua de Bucarest',
  'Hamburger SV': 'Hamburgo',
  'Borussia Mönchengladbach': 'Borussia Mönchengladbach',
};

// Países que no están en la lista de naciones de los rankings
const COUNTRIES = {
  'West Germany': 'Alemania Occidental',
  Yugoslavia: 'Yugoslavia',
  Scotland: 'Escocia',
  Greece: 'Grecia',
  Romania: 'Rumanía',
  Serbia: 'Serbia',
};

// Ciudades y países de los estadios en español
const PLACES = {
  Paris: 'París',
  Brussels: 'Bruselas',
  Bern: 'Berna',
  London: 'Londres',
  Vienna: 'Viena',
  Milan: 'Milán',
  Lisbon: 'Lisboa',
  Belgrade: 'Belgrado',
  Rome: 'Roma',
  Munich: 'Múnich',
  Athens: 'Atenas',
  Seville: 'Sevilla',
  Istanbul: 'Estambul',
  Moscow: 'Moscú',
  Berlin: 'Berlín',
  Kyiv: 'Kiev',
  Switzerland: 'Suiza',
  Austria: 'Austria',
  'SFR Yugoslavia': 'Yugoslavia',
  Turkey: 'Turquía',
  Russia: 'Rusia',
  Wales: 'Gales',
  Ukraine: 'Ucrania',
  Hungary: 'Hungría',
};

const clubName = (name) => CLUB_NAMES[name] || name;
const country = (name) => COUNTRIES[name] || translateNation(name);

// "Allianz Arena, Munich, Germany" -> "Allianz Arena, Múnich, Alemania"
const venueName = (text) =>
  text
    .split(',')
    .map((part, i) => (i === 0 ? part.trim() : PLACES[part.trim()] || country(part.trim())))
    .join(', ');

// "1955–56" -> "1955-56"; "1999–2000" -> "1999-00"
const seasonLabel = (text) => {
  const match = /(\d{4})\s*[–—-]\s*(\d{2,4})/.exec(cleanText(text));
  return match ? `${match[1]}-${match[2].slice(-2)}` : cleanText(text);
};

// Busca la tabla por las palabras de su cabecera
function findTable($, words) {
  return $('table.wikitable')
    .toArray()
    .find((table) => {
      const header = cleanText($(table).find('tr').first().text()).toLowerCase();
      return words.every((word) => header.includes(word));
    });
}

// Cuadrícula de texto, con la cabecera como claves de cada fila
function rowsOf($, table) {
  const grid = tableGrid($, table);
  const header = grid[0].map((cell) => cleanText($(cell).text()));
  return grid.slice(1).map((row) => {
    const cells = row.map((cell) => $(cell));
    return { cells, text: (i) => cleanText(cells[i] ? cells[i].text() : ''), header };
  });
}

// Todas las finales jugadas: temporada, campeón, resultado, subcampeón y estadio
function parseFinals(html) {
  const $ = cheerio.load(html);
  const table = findTable($, ['season', 'winners', 'score', 'runners-up', 'venue']);
  if (!table) throw new Error('No se encontró la tabla de finales');
  const finals = [];
  for (const row of rowsOf($, table)) {
    const col = (name) => row.header.findIndex((h) => h.toLowerCase().startsWith(name));
    const season = seasonLabel(row.text(col('season')));
    if (!/^\d{4}-\d{2}$/.test(season)) continue;
    // Las dos columnas "Country" son la 1 (campeón) y la 5 (subcampeón)
    const raw = row.text(col('score'));
    const score = raw.replace(/[†*&]/g, '').trim();
    if (!/\d/.test(score)) continue;
    const final = {
      season,
      winner: clubName(row.text(col('winners'))),
      winnerCountry: country(row.text(1)),
      score,
      extraTime: raw.includes('†'),
      penalties: raw.includes('*'),
      replay: raw.includes('&'),
      runnerUp: clubName(row.text(col('runners-up'))),
      runnerUpCountry: country(row.text(5)),
      venue: venueName(row.text(col('venue'))),
      attendance: toInt(row.text(col('attendance'))) || null,
    };
    // Final repetida (1974): una sola entrada con el resultado del desempate
    const previous = finals.find((f) => f.season === season);
    if (previous) Object.assign(previous, final, { replay: true, firstScore: previous.score });
    else finals.push(final);
  }
  return finals;
}

// Próximas finales (solo el estadio)
function parseUpcomingFinals(html) {
  const $ = cheerio.load(html);
  const table = findTable($, ['season', 'finalist', 'venue']);
  if (!table) return [];
  return rowsOf($, table)
    .map((row) => ({ season: seasonLabel(row.text(0)), venue: venueName(row.text(row.header.length - 1)) }))
    .filter((final) => /^\d{4}-\d{2}$/.test(final.season) && final.venue);
}

const years = (text) => (cleanText(text).match(/\d{4}/g) || []).map(Number);

// Títulos y subcampeonatos por club
function parseClubTitles(html) {
  const $ = cheerio.load(html);
  const table = findTable($, ['club', 'title', 'runners-up', 'seasons won']);
  if (!table) throw new Error('No se encontró la tabla de títulos por club');
  return rowsOf($, table)
    .map((row) => ({
      club: clubName(row.text(0)),
      titles: toInt(row.text(1)),
      runnersUp: toInt(row.text(2)) || 0,
      wonYears: years(row.text(3)),
      lostYears: years(row.text(4)),
    }))
    .filter((club) => club.club && Number.isInteger(club.titles));
}

// Clasificación histórica (incluye las rondas previas): partidos, victorias, goles...
function parseAllTimeTable(html) {
  const $ = cheerio.load(html);
  const table = findTable($, ['rank', 'club', 'seasons', 'pts']);
  if (!table) throw new Error('No se encontró la clasificación histórica');
  return rowsOf($, table)
    .map((row) => {
      const at = (name) => row.text(row.header.findIndex((h) => h.endsWith(name)));
      return {
        rank: toInt(at('Rank')),
        club: clubName(at('Club')),
        seasons: toInt(at('Seasons')),
        played: toInt(at('Pld')),
        won: toInt(at('W')),
        drawn: toInt(at('D')),
        lost: toInt(at('L')),
        goalsFor: toInt(at('GF')),
        goalsAgainst: toInt(at('GA')),
        points: toInt(at('Pts')),
      };
    })
    .filter((club) => club.club && Number.isInteger(club.played));
}

// Máximo goleador de cada temporada (con empates, en filas agrupadas con rowspan)
function parseSeasonTopScorers(html) {
  const $ = cheerio.load(html);
  const table = findTable($, ['season', 'player', 'club', 'goals']);
  if (!table) throw new Error('No se encontró la tabla de máximos goleadores por temporada');
  const bySeason = new Map();
  for (const row of rowsOf($, table)) {
    const season = seasonLabel(row.text(0));
    const goals = toInt(row.text(3));
    const name = row.text(1);
    if (!/^\d{4}-\d{2}$/.test(season) || !name || !Number.isInteger(goals)) continue;
    if (!bySeason.has(season)) bySeason.set(season, []);
    bySeason.get(season).push({ name, club: clubName(row.text(2)), goals });
  }
  return [...bySeason.entries()].map(([season, players]) => ({ season, players }));
}

// Comprobaciones antes de guardar: si Wikipedia cambia el formato, no se toca nada
function validateCompetition({ finals, clubs, allTime, topScorers = null }) {
  const problems = [];
  if (finals.length < 70) problems.push(`solo ${finals.length} finales`);
  if (finals[0] && finals[0].season !== '1955-56') problems.push(`la primera final es ${finals[0] && finals[0].season}`);
  const madrid = clubs.find((c) => c.club === 'Real Madrid');
  if (!madrid || madrid.titles < 15) problems.push('el Real Madrid no aparece con al menos 15 títulos');
  const titlesFromFinals = finals.length;
  const titlesFromClubs = clubs.reduce((total, c) => total + c.titles, 0);
  if (titlesFromFinals !== titlesFromClubs) problems.push(`${titlesFromFinals} finales pero ${titlesFromClubs} títulos por club`);
  // Cada título y subcampeonato por club tiene que estar en la lista de finales
  for (const club of clubs) {
    for (const year of club.wonYears) {
      const final = finals.find((f) => Number(f.season.slice(0, 4)) + 1 === year);
      if (!final || final.winner !== club.club) problems.push(`${club.club} ganó en ${year} pero la final dice ${final && final.winner}`);
    }
    for (const year of club.lostYears) {
      const final = finals.find((f) => Number(f.season.slice(0, 4)) + 1 === year);
      if (!final || final.runnerUp !== club.club) problems.push(`${club.club} perdió en ${year} pero la final dice ${final && final.runnerUp}`);
    }
  }
  if (topScorers && topScorers.length < finals.length) problems.push(`solo ${topScorers.length} temporadas con máximo goleador`);
  if (allTime.length < 20) problems.push(`solo ${allTime.length} clubes en la clasificación histórica`);
  if (problems.length) throw new Error(`Datos de la competición no válidos: ${problems.join('; ')}`);
}

module.exports = { parseFinals, parseUpcomingFinals, parseClubTitles, parseAllTimeTable, parseSeasonTopScorers, validateCompetition, clubName };
