import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { LOGO } from '../utils/asset';

const linkClass = (isActive) =>
  `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
    isActive ? 'bg-champions-blue text-white' : 'text-champions-blue hover:bg-blue-50 hover:text-blue-800'
  }`;

const ChampionsLeagueHeader = () => {
  const { pathname } = useLocation();
  // Las fichas de jugador cuelgan de la lista de goleadores
  const scorersActive = pathname === '/' || pathname.startsWith('/jugadores');

  return (
    <header className="sticky top-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <Link to="/" className="flex items-center">
            <div className="h-12 w-12 overflow-hidden mr-3 rounded-full shadow-lg border-2 border-champions-blue transform transition-transform duration-300 hover:scale-110 bg-gradient-to-br from-white to-blue-100">
              <img src={LOGO} alt="UEFA Champions League" className="h-full w-full object-contain p-1 rounded-full" />
            </div>
            <h1 className="hidden sm:block text-champions-blue font-bold text-xl">Champions League</h1>
          </Link>

          <nav className="flex items-center space-x-2 sm:space-x-4">
            <NavLink to="/" className={() => linkClass(scorersActive)}>
              Goleadores
            </NavLink>
            <NavLink to="/equipos" className={({ isActive }) => linkClass(isActive)}>
              Equipos
            </NavLink>
            <NavLink to="/temporadas" className={({ isActive }) => linkClass(isActive)}>
              Temporadas
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default ChampionsLeagueHeader;
