import React from 'react';
import { Link, NavLink, useParams, useSearchParams } from 'react-router-dom';
import { buttonVariants } from '@heroui/react';
import PlayerAvatar from './PlayerAvatar';
import { usePlayer } from '../data/PlayersContext';
import NotFoundPage from '../pages/NotFoundPage';

const TABS = [
  { path: '', label: 'Perfil' },
  { path: '/equipos', label: 'Equipos' },
  { path: '/temporadas', label: 'Temporadas' },
];

// Marco común de las fichas de jugador: busca el jugador de la URL y pinta
// la portada y el submenú Perfil / Equipos / Temporadas.
// Desde la lista de asistidores se llega con ?ranking=asistencias: entonces
// las vistas destacan las asistencias en lugar de los goles.
// children(player, stat) recibe la estadística destacada: 'goals' o 'assists'.
const PlayerPage = ({ children }) => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const player = usePlayer(id);

  if (!player) {
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
      <Link to={fromAssists ? '/asistencias' : '/'} className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'mb-4 text-muted' })}>
        ← {fromAssists ? 'Asistidores' : 'Goleadores'}
      </Link>

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

      {children(player, stat)}
    </div>
  );
};

export default PlayerPage;
