import React, { useState, useEffect } from 'react';
import ChampionsLeagueHeader from './ChampionsLeagueHeader';
import ChampionsLeagueFooter from './ChampionsLeagueFooter';

const TeamsPage = () => {
  const [teams, setTeams] = useState([
    {
      id: 1,
      name: 'Real Madrid',
      logo: '/images/teams/real-madrid.png',
      titles: 14,
      matches: 480,
      goals: 1053,
      goalsPerMatch: 2.19,
      topScorers: [
        { id: 1, name: 'Cristiano Ronaldo', goals: 105, image: '/images/players/1.jpeg' },
        { id: 2, name: 'Karim Benzema', goals: 78, image: '/images/players/2.jpg' },
        { id: 3, name: 'Raúl González', goals: 66, image: '/images/players/3.avif' }
      ],
      titleYears: ['1956', '1957', '1958', '1959', '1960', '1966', '1998', '2000', '2002', '2014', '2016', '2017', '2018', '2022']
    },
    {
      id: 2,
      name: 'AC Milan',
      logo: '/images/teams/ac-milan.png',
      titles: 7,
      matches: 362,
      goals: 768,
      goalsPerMatch: 2.12,
      topScorers: [
        { id: 4, name: 'Andriy Shevchenko', goals: 48, image: '/images/players/4.webp' },
        { id: 5, name: 'Filippo Inzaghi', goals: 41, image: '/images/players/5.webp' },
        { id: 6, name: 'Kaká', goals: 30, image: '/images/players/6.webp' }
      ],
      titleYears: ['1963', '1969', '1989', '1990', '1994', '2003', '2007']
    },
    {
      id: 3,
      name: 'Bayern Munich',
      logo: '/images/teams/bayern-munich.png',
      titles: 6,
      matches: 394,
      goals: 842,
      goalsPerMatch: 2.14,
      topScorers: [
        { id: 7, name: 'Robert Lewandowski', goals: 69, image: '/images/players/7.webp' },
        { id: 8, name: 'Thomas Müller', goals: 52, image: '/images/players/8.webp' },
        { id: 9, name: 'Gerd Müller', goals: 34, image: '/images/players/9.webp' }
      ],
      titleYears: ['1974', '1975', '1976', '2001', '2013', '2020']
    },
    {
      id: 4,
      name: 'Liverpool',
      logo: '/images/teams/liverpool.png',
      titles: 6,
      matches: 310,
      goals: 650,
      goalsPerMatch: 2.10,
      topScorers: [
        { id: 10, name: 'Mohamed Salah', goals: 42, image: '/images/players/10.webp' },
        { id: 11, name: 'Steven Gerrard', goals: 30, image: '/images/players/11.webp' },
        { id: 12, name: 'Sadio Mané', goals: 26, image: '/images/players/12.webp' }
      ],
      titleYears: ['1977', '1978', '1981', '1984', '2005', '2019']
    },
    {
      id: 5,
      name: 'FC Barcelona',
      logo: '/images/teams/barcelona.png',
      titles: 5,
      matches: 358,
      goals: 780,
      goalsPerMatch: 2.18,
      topScorers: [
        { id: 13, name: 'Lionel Messi', goals: 120, image: '/images/players/13.webp' },
        { id: 14, name: 'Luis Suárez', goals: 20, image: '/images/players/14.webp' },
        { id: 15, name: 'Rivaldo', goals: 16, image: '/images/players/15.webp' }
      ],
      titleYears: ['1992', '2006', '2009', '2011', '2015']
    },
    {
      id: 6,
      name: 'Ajax',
      logo: '/images/teams/ajax.png',
      titles: 4,
      matches: 248,
      goals: 520,
      goalsPerMatch: 2.10,
      topScorers: [
        { id: 16, name: 'Jari Litmanen', goals: 24, image: '/images/players/default.jpg' },
        { id: 17, name: 'Sören Lerby', goals: 15, image: '/images/players/default.jpg' },
        { id: 18, name: 'Johan Cruyff', goals: 14, image: '/images/players/default.jpg' }
      ],
      titleYears: ['1971', '1972', '1973', '1995']
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const teamsPerPage = 4;

  // Filtrar equipos basados en el filtro seleccionado
  const filteredTeams = () => {
    switch (filter) {
      case 'titles':
        return [...teams].sort((a, b) => b.titles - a.titles);
      case 'goals':
        return [...teams].sort((a, b) => b.goals - a.goals);
      case 'country':
        // En un caso real, tendríamos que agrupar por país
        return [...teams];
      default:
        return teams;
    }
  };

  // Obtener equipos para la página actual
  const currentTeams = filteredTeams().slice(
    (currentPage - 1) * teamsPerPage,
    currentPage * teamsPerPage
  );

  // Cambiar página
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ChampionsLeagueHeader activeSection="teams" />
      
      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Introducción */}
          <section className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-champions-blue mb-4">Equipos Legendarios de la Champions</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Descubre los equipos más exitosos en la historia de la UEFA Champions League, sus estadísticas, goleadores y títulos.
            </p>
          </section>

          {/* Filtros */}
          <section className="mb-8">
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm max-w-md mx-auto">
              <div className="flex items-center justify-center">
                <label htmlFor="teamFilter" className="text-gray-700 mr-3 font-medium">Filtrar por:</label>
                <select 
                  id="teamFilter" 
                  className="rounded-md border-gray-300 shadow-sm focus:border-champions-blue focus:ring focus:ring-champions-blue focus:ring-opacity-50"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">Todos los equipos</option>
                  <option value="titles">Más títulos</option>
                  <option value="goals">Más goles</option>
                  <option value="country">Por país</option>
                </select>
              </div>
            </div>
          </section>

          {/* Galería de equipos */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {currentTeams.map((team) => (
              <div key={team.id} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                {/* Encabezado del equipo */}
                <div className="bg-champions-blue text-white p-4 flex items-center">
                  <div className="bg-white rounded-full p-2 h-16 w-16 flex items-center justify-center mr-4">
                    <img 
                      src={team.logo || '/images/logos/default.png'} 
                      alt={team.name} 
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/logos/cc.png';
                      }}
                    />
                  </div>
                  
                  <h3 className="text-xl font-bold">{team.name}</h3>
                  
                  <div className="ml-auto flex flex-col items-center">
                    <span className="text-3xl font-bold">{team.titles}</span>
                    <span className="text-sm text-blue-200">Títulos</span>
                  </div>
                </div>
                
                {/* Estadísticas */}
                <div className="grid grid-cols-3 p-4 text-center border-b border-gray-200">
                  <div className="p-2">
                    <span className="block text-xl font-bold text-champions-blue">{team.matches}</span>
                    <span className="block text-sm text-gray-500">Partidos</span>
                  </div>
                  <div className="p-2 border-l border-r border-gray-200">
                    <span className="block text-xl font-bold text-champions-blue">{team.goals}</span>
                    <span className="block text-sm text-gray-500">Goles</span>
                  </div>
                  <div className="p-2">
                    <span className="block text-xl font-bold text-champions-blue">{team.goalsPerMatch}</span>
                    <span className="block text-sm text-gray-500">Goles/partido</span>
                  </div>
                </div>
                
                {/* Máximos goleadores */}
                <div className="p-4 border-b border-gray-200">
                  <h4 className="font-bold text-champions-blue mb-2">Máximos Goleadores</h4>
                  <ul className="space-y-3">
                    {team.topScorers.map((scorer) => (
                      <li key={scorer.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                            <img 
                              src={scorer.image} 
                              alt={scorer.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/images/players/default.jpg';
                              }}
                            />
                          </div>
                          <span className="font-medium">{scorer.name}</span>
                        </div>
                        <span className="text-champions-blue font-bold">{scorer.goals} goles</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Historial de títulos */}
                <div className="p-4 border-b border-gray-200">
                  <h4 className="font-bold text-champions-blue mb-2">Títulos de Champions League</h4>
                  <div className="flex flex-wrap gap-2">
                    {team.titleYears.map((year, idx) => (
                      <span 
                        key={idx} 
                        className="bg-blue-50 text-champions-blue px-2 py-1 rounded-md text-sm font-medium"
                      >
                        {year}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Ver detalles */}
                <div className="p-4 text-center">
                  <button className="bg-champions-blue hover:bg-blue-900 text-white py-2 px-6 rounded-full transition-colors duration-300 font-medium">
                    Ver perfil completo
                  </button>
                </div>
              </div>
            ))}
          </section>

          {/* Paginación */}
          <div className="flex justify-center mt-10">
            <div className="flex space-x-2">
              {[...Array(Math.ceil(filteredTeams().length / teamsPerPage))].map((_, idx) => (
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
              {currentPage < Math.ceil(filteredTeams().length / teamsPerPage) && (
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

export default TeamsPage;
