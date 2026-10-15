import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { buttonVariants } from '@heroui/react';
import PlayerSearch from './PlayerSearch';
import ThemeToggle from './ThemeToggle';
import { STARBALL } from '../utils/asset';

const SECTIONS = [
  { to: '/', label: 'Goleadores' },
  { to: '/asistencias', label: 'Asistencias' },
  { to: '/equipos', label: 'Equipos' },
  { to: '/temporadas', label: 'Temporadas' },
  { to: '/records', label: 'Récords' },
  { to: '/comparar', label: 'Comparar' },
];

const ChampionsLeagueHeader = () => {
  const { pathname, search } = useLocation();

  // Las fichas de jugador cuelgan de la lista de goleadores, o de la de
  // asistidores si se abrieron desde ella (?ranking=asistencias)
  const fromAssists = search.includes('ranking=asistencias');
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
        className: isActive(to) ? 'text-accent font-semibold' : 'text-muted',
      })}
    >
      {label}
    </NavLink>
  ));

  return (
    <header className="sticky top-0 z-50 border-b border-separator bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={STARBALL} alt="" className="size-9 dark:brightness-0 dark:invert" />
          <span className="text-lg font-bold tracking-tight">
            Champions <span className="text-muted font-medium">Stats</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <nav aria-label="Secciones" className="hidden items-center gap-1 xl:flex">
            {links}
          </nav>
          <PlayerSearch className="hidden w-56 sm:block" />
          <ThemeToggle />
        </div>
      </div>

      {/* En pantallas pequeñas el menú va en una segunda fila con scroll horizontal */}
      <div className="border-t border-separator xl:hidden">
        <nav aria-label="Secciones" className="flex gap-1 overflow-x-auto px-3 py-2">
          {links}
        </nav>
        <div className="px-3 pb-2 sm:hidden">
          <PlayerSearch className="w-full" />
        </div>
      </div>
    </header>
  );
};

export default ChampionsLeagueHeader;
