import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Pagination, { paginate } from '../components/Pagination';
import { usePlayerByName } from '../data/PlayersContext';

const SEASONS = [
  {
    id: 1,
    year: '2021-2022',
    winner: 'Real Madrid',
    topScorer: { name: 'Karim Benzema', team: 'Real Madrid', goals: 15 },
    finalScore: '1-0',
    finalTeams: ['Real Madrid', 'Liverpool'],
    finalVenue: 'Stade de France, Paris',
    totalGoals: 380,
    matches: 125,
    teams: 32
  },
  {
    id: 2,
    year: '2020-2021',
    winner: 'Chelsea',
    topScorer: { name: 'Erling Haaland', team: 'Borussia Dortmund', goals: 10 },
    finalScore: '1-0',
    finalTeams: ['Chelsea', 'Manchester City'],
    finalVenue: 'Estádio do Dragão, Porto',
    totalGoals: 366,
    matches: 119,
    teams: 32
  },
  {
    id: 3,
    year: '2019-2020',
    winner: 'Bayern Munich',
    topScorer: { name: 'Robert Lewandowski', team: 'Bayern Munich', goals: 15 },
    finalScore: '1-0',
    finalTeams: ['Bayern Munich', 'Paris Saint-Germain'],
    finalVenue: 'Estádio da Luz, Lisboa',
    totalGoals: 386,
    matches: 119,
    teams: 32
  },
  {
    id: 4,
    year: '2018-2019',
    winner: 'Liverpool',
    topScorer: { name: 'Lionel Messi', team: 'Barcelona', goals: 12 },
    finalScore: '2-0',
    finalTeams: ['Liverpool', 'Tottenham Hotspur'],
    finalVenue: 'Wanda Metropolitano, Madrid',
    totalGoals: 366,
    matches: 119,
    teams: 32
  },
  {
    id: 5,
    year: '2017-2018',
    winner: 'Real Madrid',
    topScorer: { name: 'Cristiano Ronaldo', team: 'Real Madrid', goals: 15 },
    finalScore: '3-1',
    finalTeams: ['Real Madrid', 'Liverpool'],
    finalVenue: 'NSC Olimpiyskiy Stadium, Kiev',
    totalGoals: 401,
    matches: 125,
    teams: 32
  },
  {
    id: 6,
    year: '2016-2017',
    winner: 'Real Madrid',
    topScorer: { name: 'Cristiano Ronaldo', team: 'Real Madrid', goals: 12 },
    finalScore: '4-1',
    finalTeams: ['Real Madrid', 'Juventus'],
    finalVenue: 'Millennium Stadium, Cardiff',
    totalGoals: 380,
    matches: 125,
    teams: 32
  }
];

const startYear = (season) => parseInt(season.year.split('-')[0], 10);

const SORTS = {
  all: (seasons) => seasons,
  recent: (seasons) => [...seasons].sort((a, b) => startYear(b) - startYear(a)),
  oldest: (seasons) => [...seasons].sort((a, b) => startYear(a) - startYear(b)),
  mostGoals: (seasons) => [...seasons].sort((a, b) => b.totalGoals - a.totalGoals),
};

const SEASONS_PER_PAGE = 4;

const SeasonsPage = () => {
  const [sort, setSort] = useState('all');
  const [page, setPage] = useState(1);
  const findPlayer = usePlayerByName();
  const { items, pageCount } = paginate(SORTS[sort](SEASONS), page, SEASONS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      <section className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-champions-blue mb-4">Temporadas Históricas de la Champions League</h2>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Explora las estadísticas de cada edición de la UEFA Champions League, conoce a los campeones, máximos goleadores y momentos destacados.
        </p>
      </section>

      <section className="mb-8">
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm max-w-md mx-auto flex items-center justify-center">
          <label htmlFor="seasonSort" className="text-gray-700 mr-3 font-medium">Ordenar por:</label>
          <select
            id="seasonSort"
            className="rounded-md border-gray-300 shadow-sm"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">Sin ordenar</option>
            <option value="recent">Más recientes</option>
            <option value="oldest">Más antiguas</option>
            <option value="mostGoals">Más goles</option>
          </select>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {items.map((season) => {
          const scorer = findPlayer(season.topScorer.name);

          return (
            <div key={season.id} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <div className="champions-gradient-blue p-6 text-white">
                <h3 className="text-2xl font-bold">{season.year}</h3>
                <div className="flex items-center mt-1">
                  <span className="mr-2">🏆</span>
                  <span className="font-medium text-champions-gold">{season.winner}</span>
                </div>
              </div>

              <div className="bg-champions-blue/10 p-4 border-b border-gray-200">
                <h4 className="font-bold text-champions-blue mb-2">Final</h4>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">{season.finalTeams[0]}</span>
                  <span className="bg-champions-blue text-white font-bold px-3 py-1 rounded-md">{season.finalScore}</span>
                  <span className="font-medium text-gray-700">{season.finalTeams[1]}</span>
                </div>
                <div className="text-sm text-gray-500 mt-2 text-center">{season.finalVenue}</div>
              </div>

              <div className="grid grid-cols-3 p-4 text-center border-b border-gray-200">
                <div className="p-2">
                  <span className="block text-xl font-bold text-champions-blue">{season.totalGoals}</span>
                  <span className="block text-sm text-gray-500">Goles</span>
                </div>
                <div className="p-2 border-l border-r border-gray-200">
                  <span className="block text-xl font-bold text-champions-blue">{season.matches}</span>
                  <span className="block text-sm text-gray-500">Partidos</span>
                </div>
                <div className="p-2">
                  <span className="block text-xl font-bold text-champions-blue">{season.teams}</span>
                  <span className="block text-sm text-gray-500">Equipos</span>
                </div>
              </div>

              <div className="p-4">
                <h4 className="font-bold text-champions-blue mb-2">Máximo Goleador</h4>
                <div className="flex items-center justify-between">
                  <div>
                    {scorer ? (
                      <Link to={`/jugadores/${scorer.id}`} className="font-medium hover:text-champions-blue">
                        {season.topScorer.name}
                      </Link>
                    ) : (
                      <p className="font-medium">{season.topScorer.name}</p>
                    )}
                    <p className="text-sm text-gray-500">{season.topScorer.team}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg mr-2">⚽</span>
                    <span className="text-xl font-bold text-champions-blue">{season.topScorer.goals}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <Pagination page={page} pageCount={pageCount} onChange={setPage} />
    </div>
  );
};

export default SeasonsPage;
