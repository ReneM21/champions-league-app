// Descarga de Wikipedia todas las finales de la Copa de Europa y la Champions
// League, el máximo goleador de cada temporada, los títulos por club y la
// clasificación histórica, y lo guarda en
// public/data/competition.json (páginas Equipos y Temporadas de la app).
// Lo ejecuta el workflow .github/workflows/update-data.yml; en local:
// npm run update-competition
const fs = require('fs');
const path = require('path');
const { parseFinals, parseUpcomingFinals, parseClubTitles, parseAllTimeTable, parseSeasonTopScorers, parseRecords, validateCompetition } = require('./competition');

const OUTPUT = path.join(__dirname, '..', 'public', 'data', 'competition.json');
const PAGES = {
  finals: 'List_of_European_Cup_and_UEFA_Champions_League_finals',
  records: 'European_Cup_and_UEFA_Champions_League_records_and_statistics',
  scorers: 'List_of_UEFA_Champions_League_top_scorers',
};

async function page(name) {
  const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/html/${name}`, {
    headers: { 'User-Agent': 'champions-league-app (https://github.com/ReneM21/champions-league-app)' },
  });
  if (!response.ok) throw new Error(`Wikipedia respondió ${response.status} en ${name}`);
  return response.text();
}

async function main() {
  const [finalsHtml, recordsHtml, scorersHtml] = await Promise.all([page(PAGES.finals), page(PAGES.records), page(PAGES.scorers)]);
  const data = {
    finals: parseFinals(finalsHtml),
    upcoming: parseUpcomingFinals(finalsHtml),
    clubs: parseClubTitles(recordsHtml),
    allTime: parseAllTimeTable(recordsHtml),
    topScorers: parseSeasonTopScorers(scorersHtml),
    records: parseRecords(recordsHtml),
  };
  validateCompetition(data);
  const last = data.finals[data.finals.length - 1];
  console.log(`${data.finals.length} finales (última: ${last.season}, ${last.winner}), ${data.clubs.length} clubes finalistas, ${data.allTime.length} en la clasificación histórica.`);

  const previous = fs.existsSync(OUTPUT) ? JSON.parse(fs.readFileSync(OUTPUT, 'utf8')) : null;
  const { updatedAt, sources, ...previousData } = previous || {};
  if (previous && JSON.stringify(previousData) === JSON.stringify(data)) {
    console.log('Sin cambios.');
    return;
  }
  const output = {
    updatedAt: new Date().toISOString(),
    sources: Object.values(PAGES).map((name) => `https://en.wikipedia.org/wiki/${name}`),
    ...data,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Guardado ${path.relative(process.cwd(), OUTPUT)}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
