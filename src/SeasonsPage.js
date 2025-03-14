import React, { useState } from 'react';
import ChampionsLeagueHeader from './ChampionsLeagueHeader';
import ChampionsLeagueFooter from './ChampionsLeagueFooter';

const SeasonsPage = () => {
  const [seasons, setSeasons] = useState([
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
      teams: 32,
      image: '/images/seasons/2022.jpg'
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
      teams: 32,
      image: '/images/seasons/2021.jpg'
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
      teams: 32,
      image: '/images/seasons/2020.jpg'
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
      teams: 32,
      image: '/images/seasons/2019.jpg'
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
      teams: 32,
      image: '/images/seasons/2018.jpg'
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
      teams: 32,
      image: '/images/seasons/2017.jpg'
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const seasonsPerPage = 4;

  // Filtrar temporadas basadas en el filtro seleccionado
  const filteredSeasons = () => {
    switch (filter) {
      case 'mostGoals':
        return [...seasons].sort((a, b) => b.totalGoals - a.totalGoals);
      case 'recent':
        return [...seasons].sort((a, b) => {
          const yearA = parseInt(a.year.split('-')[0]);
          const yearB = parseInt(b.year.split('-')[0]);
          return yearB - yearA;
        });
      case 'oldest':
        return [...seasons].sort((a, b) => {
          const yearA = parseInt(a.year.split('-')[0]);
          const yearB = parseInt(b.year.split('-')[0]);
          return yearA - yearB;
        });
      default:
        return seasons;
    }
  };

  // Obtener temporadas para la página actual
  const currentSeasons = filteredSeasons().slice(
    (currentPage - 1) * seasonsPerPage,
    currentPage * seasonsPerPage
  );

  // Cambiar página
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ChampionsLeagueHeader activeSection="seasons" />
      
      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Introducción */}
          <section className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-champions-blue mb-4">Temporadas Históricas de la Champions League</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Explora las estadísticas de cada edición de la UEFA Champions League, conoce a los campeones, máximos goleadores y momentos destacados.
            </p>
          </section>

          {/* Filtros */}
          <section className="mb-8">
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm max-w-md mx-auto">
              <div className="flex items-center justify-center">
                <label htmlFor="seasonFilter" className="text-gray-700 mr-3 font-medium">Ordenar por:</label>
                <select 
                  id="seasonFilter" 
                  className="rounded-md border-gray-300 shadow-sm focus:border-champions-blue focus:ring focus:ring-champions-blue focus:ring-opacity-50"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">Sin ordenar</option>
                  <option value="recent">Más recientes</option>
                  <option value="oldest">Más antiguas</option>
                  <option value="mostGoals">Más goles</option>
                </select>
              </div>
            </div>
          </section>

          {/* Galería de temporadas */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {currentSeasons.map((season) => (
              <div key={season.id} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={season.image || '/images/seasons/default.jpg'} 
                    alt={`Temporada ${season.year}`} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/seasons/default.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-2xl font-bold">{season.year}</h3>
                    <div className="flex items-center mt-1">
                      <span className="text-champions-gold mr-2">🏆</span>
                      <span className="font-medium">{season.winner}</span>
                    </div>
                  </div>
                </div>
                
                {/* Datos de la final */}
                <div className="bg-champions-blue/10 p-4 border-b border-gray-200">
                  <h4 className="font-bold text-champions-blue mb-2">Final</h4>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">{season.finalTeams[0]}</span>
                    <span className="bg-champions-blue text-white font-bold px-3 py-1 rounded-md">
                      {season.finalScore}
                    </span>
                    <span className="font-medium text-gray-700">{season.finalTeams[1]}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-2 text-center">
                    {season.finalVenue}
                  </div>
                </div>
                
                {/* Estadísticas */}
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
                
                {/* Máximo goleador */}
                <div className="p-4 border-b border-gray-200">
                  <h4 className="font-bold text-champions-blue mb-2">Máximo Goleador</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{season.topScorer.name}</p>
                      <p className="text-sm text-gray-500">{season.topScorer.team}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-champions-gold text-lg mr-2">⚽</span>
                      <span className="text-xl font-bold text-champions-blue">{season.topScorer.goals}</span>
                    </div>
                  </div>
                </div>
                
                {/* Ver detalles */}
                <div className="p-4 text-center">
                  <button className="bg-champions-blue hover:bg-blue-900 text-white py-2 px-6 rounded-full transition-colors duration-300 font-medium">
                    Ver temporada completa
                  </button>
                </div>
              </div>
            ))}
          </section>

          {/* Paginación */}
          <div className="flex justify-center mt-10">
            <div className="flex space-x-2">
              {[...Array(Math.ceil(filteredSeasons().length / seasonsPerPage))].map((_, idx) => (
                <button
                  key={idx}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentPage === idx + 1
                      ? 'bg-champions-blue text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => handlePageChange(idx + 1)}
                >
                  {idx + 1}
                </button>
              ))}
              {currentPage < Math.ceil(filteredSeasons().length / seasonsPerPage) && (
                <button
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-gray-200"
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  →
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <ChampionsLeagueFooter />
    </div>
  );
};

export default SeasonsPage;
