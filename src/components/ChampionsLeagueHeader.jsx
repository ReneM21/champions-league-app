import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { buttonVariants } from '@heroui/react';
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

  return (
    <header className="sticky top-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <Link to="/" className="flex items-center">
            <div className="h-10 w-10 sm:h-12 sm:w-12 overflow-hidden mr-2 sm:mr-3 rounded-full shadow-lg border-2 border-champions-blue transform transition-transform duration-300 hover:scale-110 bg-linear-to-br from-white to-blue-100">
              <img src={LOGO} alt="UEFA Champions League" className="h-full w-full object-contain p-1 rounded-full" />
            </div>
            <h1 className="hidden sm:block text-champions-blue font-bold text-xl">Champions League</h1>
          </Link>

          {/* Enlaces de React Router con el estilo de los botones de HeroUI */}
          <nav className="flex items-center gap-0.5 sm:gap-2">
            {SECTIONS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={buttonVariants({
                  variant: isActive(to) ? 'primary' : 'ghost',
                  size: 'sm',
                  className: 'px-2 text-xs sm:px-3 sm:text-sm',
                })}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default ChampionsLeagueHeader;
