import React from 'react';
import { asset, LOGO } from '../utils/asset';

const PlayerAvatar = ({ player, className = 'h-12 w-12' }) => (
  <div className={`flex-shrink-0 overflow-hidden rounded-full border-2 border-champions-blue bg-white ${className}`}>
    <img
      src={player.image ? asset(player.image) : LOGO}
      alt={player.name}
      className="h-full w-full object-cover"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = LOGO;
      }}
    />
  </div>
);

export default PlayerAvatar;
