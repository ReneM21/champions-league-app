import React from 'react';
import { Link, NavLink, useParams, useSearchParams } from 'react-router-dom';
import { buttonVariants } from '@heroui/react';
import PlayerAvatar from './PlayerAvatar';
import { usePlayer } from '../data/PlayersContext';
import NotFoundPage from '../pages/NotFoundPage';
import ShareButton from './ShareButton';
import { useTitle } from '../utils/useTitle';
import PlayerDetailPage from '../pages/PlayerDetailPage';
import PlayerTeamsPage from '../pages/PlayerTeamsPage';
import PlayerSeasonsPage from '../pages/PlayerSeasonsPage';

const TABS = [
  { path: '', label: 'Perfil', Component: PlayerDetailPage },
  { path: '/equipos', label: 'Equipos', Component: PlayerTeamsPage },
  { path: '/temporadas', label: 'Temporadas', Component: PlayerSeasonsPage },
];

// Ficha de jugador: busca el jugador de la URL y pinta la portada, el submenú
// Perfil / Equipos / Temporadas y la pestaña elegida. Es una sola ruta
// (/jugadores/:id/*), así que al cambiar de pestaña la portada y la foto no se
// vuelven a montar y no hay parpadeo: solo cambia el contenido de abajo.
// Desde la lista de asistidores se llega con ?ranking=asistencias: entonces
// las pestañas destacan las asistencias ('assists') en lugar de los goles.
const PlayerPage = () => {
  const { id, '*': tabPath = '' } = useParams();
  const [searchParams] = useSearchParams();
  const player = usePlayer(id);
  const tab = TABS.find(({ path }) => path.replace('/', '') === tabPath.replace(/\/$/, ''));
  useTitle(player ? `${player.name}${tab && tab.path ? ` · ${tab.label}` : ''}` : null);

  if (!player || !tab) {
    return <NotFoundPage title="Jugador no encontrado" message="El jugador que buscas no está en los rankings de goleadores ni de asistidores." />;
  }

  // Los asistidores que no están entre los goleadores vuelven a su ranking
  const fromAssists = Boolean(player.assistsPosition) && (searchParams.get('ranking') === 'asistencias' || !player.goalsPosition);
  const stat = fromAssists ? 'assists' : 'goals';
  const query = fromAssists ? '?ranking=asistencias' : '';
  const rankLine = fromAssists
    ? `${player.assistsPosition}º máximo asistidor de la historia`
    : `${player.goalsPosition}º máximo goleador de la historia`;
  const headline = fromAssists ? { value: player.assists, label: 'asistencias' } : { value: player.goals, label: 'goles' };

  return (
    <div className="animate-fadeIn">
      <div className="mb-4 flex items-center justify-between gap-2">
        <Link to={fromAssists ? '/asistencias' : '/'} className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'text-muted' })}>
          ← {fromAssists ? 'Asistidores' : 'Goleadores'}
        </Link>
        <div className="flex gap-2">
          <ShareButton title={`${player.name} en la Champions League · Champions Stats`} variant="ghost" />
          <Link to={`/comparar?a=${player.id}`} className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
            Comparar
          </Link>
        </div>
      </div>

      <section className="champions-hero mb-6 flex flex-col gap-6 rounded-3xl p-6 text-white sm:flex-row sm:items-center sm:p-8">
        <PlayerAvatar player={player} className="size-24 ring-4 ring-white/20" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white/70">{rankLine}</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{player.name}</h1>
          <p className="mt-1 text-white/80">
            {[player.nationality, player.years].filter(Boolean).join(' · ') || ' '}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-5xl font-bold tabular-nums text-champions-gold">{headline.value}</p>
          <p className="text-sm uppercase tracking-wide text-white/70">{headline.label}</p>
        </div>
      </section>

      <nav aria-label="Secciones del jugador" className="mb-8 flex gap-1 overflow-x-auto rounded-2xl bg-surface p-1 shadow-sm">
        {TABS.map(({ path, label }) => (
          <NavLink
            key={label}
            to={`/jugadores/${player.id}${path}${query}`}
            end
            className={({ isActive }) =>
              buttonVariants({
                variant: isActive ? 'primary' : 'ghost',
                size: 'sm',
                className: 'flex-1',
              })
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <tab.Component player={player} stat={stat} />
    </div>
  );
};

export default PlayerPage;
