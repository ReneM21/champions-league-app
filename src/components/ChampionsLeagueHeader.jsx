import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { buttonVariants } from '@heroui/react';
import PlayerSearch from './PlayerSearch';
import { usePlayers } from '../data/PlayersContext';
import ThemeToggle from './ThemeToggle';
import { STARBALL } from '../utils/asset';

const SECTIONS = [
  { to: '/', label: 'Goleadores' },
  { to: '/asistencias', label: 'Asistencias' },
  { to: '/temporada-actual', label: 'Temporada actual' },
  { to: '/equipos', label: 'Equipos' },
  { to: '/temporadas', label: 'Temporadas' },
  { to: '/records', label: 'Récords' },
  { to: '/comparar', label: 'Comparar' },
];

const ChampionsLeagueHeader = () => {
  const { pathname, search } = useLocation();

  // Las fichas de jugador cuelgan de la lista de goleadores, o de la de
  // asistidores si se abrieron desde ella (?ranking=asistencias)
  const { byId } = usePlayers();
  const playerId = (pathname.match(/^\/jugadores\/([^/]+)/) || [])[1];
  const player = playerId && byId ? byId.get(playerId) : null;
  // Igual que en la ficha: los asistidores que no son goleadores cuelgan de Asistencias
  const fromAssists = search.includes('ranking=asistencias') || Boolean(player && !player.goalsPosition);
  const isActive = (to) => {
    if (pathname.startsWith('/jugadores')) return to === (fromAssists ? '/asistencias' : '/');
    return pathname === to;
  };

  const links = SECTIONS.map(({ to, label }) => (
    <NavLink
      key={to}
      to={to}
      className={buttonVariants({
        variant: isActive(to) ? 'secondary' : 'ghost',
        size: 'sm',
        className: `px-2 ${isActive(to) ? 'text-accent font-semibold' : 'text-muted'}`,
      })}
    >
      {label}
    </NavLink>
  ));

  return (
    // Barra flotante de vidrio: se queda arriba y el contenido pasa por detrás
    <header className="site-header sticky top-0 z-50 px-2 pt-2 sm:px-3 sm:pt-3">
      <div className="liquid-glass mx-auto max-w-7xl rounded-[1.75rem]">
        <div className="flex h-14 items-center justify-between gap-4 px-4">
          <Link to="/" className="flex shrink-0 items-center gap-3 whitespace-nowrap">
            <img src={STARBALL} alt="" className="size-9 dark:brightness-0 dark:invert" />
            <span className="text-lg font-bold tracking-tight">
              Champions <span className="text-muted font-medium">Stats</span>
            </span>
          </Link>

          <div className="flex min-w-0 items-center gap-6">
            <nav aria-label="Secciones" className="hidden min-w-0 items-center gap-0.5 xl:flex">
              {links}
            </nav>
            {/* sm:flex (no sm:block): así el campo ocupa justo su caja y no invade el botón de tema */}
            <PlayerSearch className="hidden w-56 sm:flex" />
            <ThemeToggle />
          </div>
        </div>

        {/* En pantallas pequeñas el menú va en una segunda fila con scroll horizontal */}
        <div className="border-t border-separator xl:hidden">
          <nav aria-label="Secciones" className="flex gap-1 overflow-x-auto px-3 py-2">
            {links}
          </nav>
          <div className="px-3 pb-3 sm:hidden">
            <PlayerSearch className="w-full" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default ChampionsLeagueHeader;
