import React from 'react';
import { Link } from '@heroui/react';
import { usePlayers } from '../data/PlayersContext';
import { LOGO } from '../utils/asset';

const ChampionsLeagueFooter = () => {
  const currentYear = new Date().getFullYear();
  const { source } = usePlayers();

  return (
    <footer className="mt-16 border-t border-separator bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted sm:flex-row">
        <div className="flex items-center gap-3">
          <img src={LOGO} alt="UEFA Champions League" className="h-12 w-auto shrink-0 dark:brightness-0 dark:invert" />
          <p>
            © {currentYear} Champions Stats · Estadísticas históricas de la UEFA Champions League
            <span className="champions-star ml-2" aria-hidden="true">★</span>
          </p>
        </div>
        {source && (
          <p>
            Datos:{' '}
            <Link href={source} target="_blank" rel="noopener noreferrer">
              Wikipedia
            </Link>{' '}
            · Fotos adicionales:{' '}
            <Link href="https://commons.wikimedia.org" target="_blank" rel="noopener noreferrer">
              Wikimedia Commons
            </Link>
          </p>
        )}
      </div>
    </footer>
  );
};

export default ChampionsLeagueFooter;
