import React, { Suspense, lazy, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Button } from '@heroui/react';
import ChampionsLeagueHeader from './components/ChampionsLeagueHeader';
import ChampionsLeagueFooter from './components/ChampionsLeagueFooter';
import PageSkeleton from './components/PageSkeleton';
import { usePlayers } from './data/PlayersContext';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

// El resto de páginas se descargan al visitarlas: la portada carga antes
const PlayerDetailPage = lazy(() => import('./pages/PlayerDetailPage'));
const PlayerTeamsPage = lazy(() => import('./pages/PlayerTeamsPage'));
const PlayerSeasonsPage = lazy(() => import('./pages/PlayerSeasonsPage'));
const TeamsPage = lazy(() => import('./pages/TeamsPage'));
const SeasonsPage = lazy(() => import('./pages/SeasonsPage'));
const AssistsPage = lazy(() => import('./pages/AssistsPage'));
const ComparePage = lazy(() => import('./pages/ComparePage'));
const RecordsPage = lazy(() => import('./pages/RecordsPage'));

const ScrollToTopOnNavigate = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => {
  const { status } = usePlayers();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <ScrollToTopOnNavigate />
      <ChampionsLeagueHeader />

      <main className="mx-auto w-full max-w-6xl grow px-4 py-8">
        {status === 'loading' ? (
          <PageSkeleton />
        ) : status === 'error' ? (
          <NotFoundPage
            title="No se pudieron cargar los datos"
            message="Comprueba tu conexión y recarga la página."
          />
        ) : (
          <Suspense fallback={<PageSkeleton />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/jugadores/:id" element={<PlayerDetailPage />} />
              <Route path="/jugadores/:id/equipos" element={<PlayerTeamsPage />} />
              <Route path="/jugadores/:id/temporadas" element={<PlayerSeasonsPage />} />
              <Route path="/equipos" element={<TeamsPage />} />
              <Route path="/asistencias" element={<AssistsPage />} />
              <Route path="/temporadas" element={<SeasonsPage />} />
              <Route path="/comparar" element={<ComparePage />} />
              <Route path="/records" element={<RecordsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        )}
      </main>

      <ChampionsLeagueFooter />

      <div className="fixed bottom-4 right-4 z-50">
        <Button
          isIconOnly
          size="lg"
          onPress={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="rounded-full shadow-lg"
          aria-label="Volver arriba"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

export default App;
