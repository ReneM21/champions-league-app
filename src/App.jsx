import React, { Suspense, lazy, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Button } from '@heroui/react';
import ChampionsLeagueHeader from './components/ChampionsLeagueHeader';
import ChampionsLeagueFooter from './components/ChampionsLeagueFooter';
import PageSkeleton from './components/PageSkeleton';
import { usePlayers } from './data/PlayersContext';
import { asset } from './utils/asset';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

// El resto de páginas se descargan aparte para que la portada cargue antes,
// y se precargan en segundo plano en cuanto la app está lista: así al
// navegar no aparece el esqueleto de carga
const PAGES = {
  PlayerPage: () => import('./components/PlayerPage'),
  TeamsPage: () => import('./pages/TeamsPage'),
  SeasonsPage: () => import('./pages/SeasonsPage'),
  AssistsPage: () => import('./pages/AssistsPage'),
  ComparePage: () => import('./pages/ComparePage'),
  RecordsPage: () => import('./pages/RecordsPage'),
};
const PlayerPage = lazy(PAGES.PlayerPage);
const TeamsPage = lazy(PAGES.TeamsPage);
const SeasonsPage = lazy(PAGES.SeasonsPage);
const AssistsPage = lazy(PAGES.AssistsPage);
const ComparePage = lazy(PAGES.ComparePage);
const RecordsPage = lazy(PAGES.RecordsPage);

// Las imágenes precargadas se guardan aquí para que el navegador las mantenga
// decodificadas en memoria y aparezcan al instante al cambiar de página
const preloaded = [];

const preloadImages = (urls) => {
  for (const url of new Set(urls)) {
    const image = new Image();
    image.decoding = 'async';
    image.src = asset(url);
    preloaded.push(image);
  }
};

// Tras cargar los datos, precarga las páginas y luego los escudos y las fotos
// (salvo con ahorro de datos), para que no aparezcan de golpe al navegar
const usePreload = ({ status, clubs, byId }) => {
  useEffect(() => {
    if (status !== 'ready') return undefined;
    const timer = setTimeout(() => {
      Object.values(PAGES).forEach((load) => load().catch(() => {}));
      if (navigator.connection && navigator.connection.saveData) return;
      preloadImages([
        ...Object.values(clubs || {}).map((club) => club.logo),
        ...[...(byId || new Map()).values()].map((player) => player.image),
      ].filter(Boolean));
    }, 300);
    return () => clearTimeout(timer);
  }, [status, clubs, byId]);
};

// Sube al principio al cambiar de página, pero no al cambiar de pestaña dentro
// de la misma ficha de jugador
const ScrollToTopOnNavigate = () => {
  const { pathname } = useLocation();
  const page = pathname.match(/^\/jugadores\/[^/]+/) ? pathname.split('/').slice(0, 3).join('/') : pathname;
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);
  return null;
};

const App = () => {
  const data = usePlayers();
  const { status } = data;
  usePreload(data);

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
              <Route path="/jugadores/:id/*" element={<PlayerPage />} />
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
