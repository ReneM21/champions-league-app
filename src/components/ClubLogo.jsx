import React from 'react';
import { useClubLogo } from '../data/PlayersContext';
import { asset } from '../utils/asset';

const initials = (name) =>
  name
    .split(' ')
    .filter((word) => word.length > 2)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || name.slice(0, 2).toUpperCase();

// Escudo de un club; si no hay escudo descargado, sus iniciales
const ClubLogo = ({ name, className = 'size-6' }) => {
  const logo = useClubLogo(name);
  if (logo) return <img src={asset(logo)} alt="" loading="lazy" className={`shrink-0 object-contain ${className}`} />;
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-accent-soft text-[0.6rem] font-bold text-accent ${className}`}
    >
      {initials(name)}
    </span>
  );
};

export default ClubLogo;
