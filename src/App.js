import React, { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import ChampionsLeagueHeader from './components/ChampionsLeagueHeader';
import ChampionsLeagueFooter from './components/ChampionsLeagueFooter';
import LoadingScreen from './components/LoadingScreen';
import { usePlayers } from './data/PlayersContext';
import HomePage from './pages/HomePage';
import PlayerDetailPage from './pages/PlayerDetailPage';
import PlayerTeamsPage from './pages/PlayerTeamsPage';
import PlayerSeasonsPage from './pages/PlayerSeasonsPage';
import TeamsPage from './pages/TeamsPage';
import SeasonsPage from './pages/SeasonsPage';
import NotFoundPage from './pages/NotFoundPage';

const ScrollToTopOnNavigate = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => {
  const { status } = usePlayers();

  if (status === 'loading') return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <ScrollToTopOnNavigate />
      <ChampionsLeagueHeader />

      <main className="flex-grow">
        {status === 'error' ? (
          <NotFoundPage
            title="No se pudieron cargar los datos"
            message="Comprueba tu conexión y recarga la página."
          />
        ) : (
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/jugadores/:id" element={<PlayerDetailPage />} />
            <Route path="/jugadores/:id/equipos" element={<PlayerTeamsPage />} />
            <Route path="/jugadores/:id/temporadas" element={<PlayerSeasonsPage />} />
            <Route path="/equipos" element={<TeamsPage />} />
            <Route path="/temporadas" element={<SeasonsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        )}
      </main>

      <ChampionsLeagueFooter />

      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-champions-blue text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-110"
          aria-label="Volver arriba"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default App;
