import React from 'react';
import { asset } from '../utils/asset';

// Escudo de un equipo de la temporada actual (current-season.json); si no se
// pudo descargar, sus siglas
const TeamLogo = ({ team, className = 'size-6' }) => {
  if (team && team.logo) return <img src={asset(team.logo)} alt="" className={`shrink-0 object-contain ${className}`} />;
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-accent-soft text-[0.55rem] font-bold text-accent ${className}`}
    >
      {((team && (team.code || team.name)) || '?').slice(0, 3).toUpperCase()}
    </span>
  );
};

export default TeamLogo;
