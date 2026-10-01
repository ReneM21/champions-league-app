import React from 'react';
import { LOGO } from '../utils/asset';

const ChampionsLeagueFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-champions-blue text-white border-t border-champions-gold">
      <div className="flex justify-center items-center p-6">
        <div className="w-10 h-10 mr-4 overflow-hidden rounded-lg shadow-md border border-champions-gold/30 bg-champions-blue/80">
          <img
            src={LOGO}
            alt="Champions League Logo"
            className="w-full h-full object-contain transform hover:scale-110 transition-transform duration-300"
          />
        </div>
        <p className="text-sm">
          &copy; {currentYear} <span className="text-champions-gold">UEFA Champions League</span> - Estadísticas Históricas
        </p>
      </div>

      {/* Barra decorativa con estrellas */}
      <div className="px-6 py-2 bg-opacity-20 bg-black text-center border-t border-opacity-20 border-white">
        <div className="flex justify-center space-x-4">
          {Array(5).fill('').map((_, i) => (
            <span key={i} className="champions-star" style={{ animationDelay: `${i * 0.5}s` }}>★</span>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default ChampionsLeagueFooter;
