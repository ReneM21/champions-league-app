// Descarga el ranking histórico de goleadores de la Champions desde Wikipedia
// y lo guarda en public/data/ranking.json. Lo ejecuta el workflow
// .github/workflows/update-data.yml; en local: npm run update-data
const fs = require('fs');
const path = require('path');
const { parseTopScorers, topPlayers, validateRanking } = require('./ranking-parser');

const PAGE = 'List_of_UEFA_Champions_League_top_scorers';
const SOURCE = `https://en.wikipedia.org/wiki/${PAGE}`;
const API_URL = `https://en.wikipedia.org/api/rest_v1/page/html/${PAGE}`;
const OUTPUT = path.join(__dirname, '..', 'public', 'data', 'ranking.json');

async function main() {
  const response = await fetch(API_URL, {
    // Wikipedia pide identificar a los clientes automáticos
    headers: { 'User-Agent': 'champions-league-app (https://github.com/ReneM21/champions-league-app)' },
  });
  if (!response.ok) throw new Error(`Wikipedia respondió ${response.status}`);

  const players = topPlayers(parseTopScorers(await response.text()));
  const previous = fs.existsSync(OUTPUT) ? JSON.parse(fs.readFileSync(OUTPUT, 'utf8')) : null;
  validateRanking(players, previous);

  console.table(players.map(({ name, nationality, goals, matches }) => ({ name, nationality, goals, matches })));

  // Sin cambios no se reescribe el archivo, así no hay commits vacíos
  if (previous && previous.updatedAt && JSON.stringify(previous.players) === JSON.stringify(players)) {
    console.log('Sin cambios en el ranking.');
    return;
  }

  const ranking = { updatedAt: new Date().toISOString(), source: SOURCE, players };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(ranking, null, 2)}\n`);
  console.log(`Ranking actualizado en ${path.relative(process.cwd(), OUTPUT)}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
