import React from 'react';
import { Avatar } from '@heroui/react';
import { asset } from '../utils/asset';

export const creditText = (credit) => `Foto: ${credit.author} · ${credit.license} · Wikimedia Commons`;

const initials = (name) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

// Si no hay foto o no carga, HeroUI muestra las iniciales del jugador
const PlayerAvatar = ({ player, className = 'size-12' }) => (
  <Avatar color="accent" variant="soft" className={`rounded-full ring-2 ring-surface shadow-sm ${className}`}>
    {player.image && (
      <Avatar.Image
        src={asset(player.image)}
        alt={player.name}
        title={player.photoCredit ? creditText(player.photoCredit) : undefined}
        className="object-cover object-top"
      />
    )}
    <Avatar.Fallback className="rounded-full font-semibold">{initials(player.name)}</Avatar.Fallback>
  </Avatar>
);

export default PlayerAvatar;
