import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { buttonVariants } from '@heroui/react';
import ThemeToggle from './ThemeToggle';
import { LOGO } from '../utils/asset';

const SECTIONS = [
  { to: '/', label: 'Goleadores' },
  { to: '/asistencias', label: 'Asistencias' },
  { to: '/equipos', label: 'Equipos' },
  { to: '/temporadas', label: 'Temporadas' },
];

const ChampionsLeagueHeader = () => {
  const { pathname } = useLocation();

  // Las fichas de jugador cuelgan de la lista de goleadores
  const isActive = (to) => (to === '/' ? pathname === '/' || pathname.startsWith('/jugadores') : pathname === to);

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
          <img src={LOGO} alt="" className="size-9 rounded-full bg-white p-0.5 shadow-sm ring-1 ring-border" />
          <span className="text-lg font-bold tracking-tight">
            Champions <span className="text-muted font-medium">Stats</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <nav aria-label="Secciones" className="hidden items-center gap-1 sm:flex">
            {links}
          </nav>
          <ThemeToggle />
        </div>
      </div>

      {/* En móvil el menú va en una segunda fila con scroll horizontal */}
      <nav aria-label="Secciones" className="flex gap-1 overflow-x-auto border-t border-separator px-3 py-2 sm:hidden">
        {links}
      </nav>
    </header>
  );
};

export default ChampionsLeagueHeader;
