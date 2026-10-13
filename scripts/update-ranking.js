// Descarga un ranking histórico de la Champions desde Wikipedia y lo guarda
// en public/data. Lo ejecuta el workflow .github/workflows/update-data.yml.
// En local:
//   npm run update-data      -> goleadores (ranking.json)
//   npm run update-assists   -> asistidores (assists.json)
const fs = require('fs');
const path = require('path');
const { parseStatTable, topPlayers, validateRanking } = require('./ranking-parser');

const RANKINGS = {
  goals: { page: 'List_of_UEFA_Champions_League_top_scorers', output: 'ranking.json' },
  assists: { page: 'UEFA_Champions_League_records_and_statistics', output: 'assists.json' },
};

async function main(stat) {
  const config = RANKINGS[stat];
  if (!config) throw new Error(`Ranking desconocido: "${stat}". Usa: ${Object.keys(RANKINGS).join(', ')}.`);

  const source = `https://en.wikipedia.org/wiki/${config.page}`;
  const output = path.join(__dirname, '..', 'public', 'data', config.output);

  const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/html/${config.page}`, {
    // Wikipedia pide identificar a los clientes automáticos
    headers: { 'User-Agent': 'champions-league-app (https://github.com/ReneM21/champions-league-app)' },
  });
  if (!response.ok) throw new Error(`Wikipedia respondió ${response.status}`);

  const players = topPlayers(parseStatTable(await response.text(), stat), stat);
  const previous = fs.existsSync(output) ? JSON.parse(fs.readFileSync(output, 'utf8')) : null;
  validateRanking(players, previous, stat);

  console.table(players.map(({ name, nationality, matches, [stat]: value }) => ({ name, nationality, [stat]: value, matches })));

  // Sin cambios no se reescribe el archivo, así no hay commits vacíos
  if (previous && previous.updatedAt && JSON.stringify(previous.players) === JSON.stringify(players)) {
    console.log('Sin cambios en el ranking.');
    return;
  }

  const ranking = { updatedAt: new Date().toISOString(), source, players };
  fs.writeFileSync(output, `${JSON.stringify(ranking, null, 2)}\n`);
  console.log(`Ranking actualizado en ${path.relative(process.cwd(), output)}.`);
}

main(process.argv[2] || 'goals').catch((error) => {
  console.error(error.message);
  process.exit(1);
});
