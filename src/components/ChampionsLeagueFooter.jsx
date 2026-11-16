import React from 'react';
import { Link } from '@heroui/react';
import { usePlayers } from '../data/PlayersContext';
import { LOGO } from '../utils/asset';

const ChampionsLeagueFooter = () => {
  const currentYear = new Date().getFullYear();
  const { source } = usePlayers();

  return (
    <footer className="mt-16 px-2 pb-2 sm:px-3 sm:pb-3">
      <div className="glass-surface mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 rounded-[1.75rem] px-6 py-8 text-sm text-muted sm:flex-row">
        <div className="flex items-center gap-3">
          <img src={LOGO} alt="UEFA Champions League" className="h-12 w-auto shrink-0 dark:brightness-0 dark:invert" />
          <p>
            © {currentYear} Champions Stats · Estadísticas históricas de la UEFA Champions League
          </p>
        </div>
        {source && (
          <p>
            Datos:{' '}
            <Link href={source} target="_blank" rel="noopener noreferrer">
              Wikipedia
            </Link>{' '}
            y{' '}
            <Link href="https://www.uefa.com/uefachampionsleague/history/" target="_blank" rel="noopener noreferrer">
              UEFA
            </Link>
          </p>
        )}
      </div>
    </footer>
  );
};

export default ChampionsLeagueFooter;
