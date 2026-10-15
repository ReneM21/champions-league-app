import React from 'react';
import { Card, Chip, Link } from '@heroui/react';
import PlayerAvatar from './PlayerAvatar';

const MEDALS = [
  { label: '1º', className: 'bg-champions-gold text-black' },
  { label: '2º', className: 'bg-zinc-300 text-black' },
  { label: '3º', className: 'bg-amber-700 text-white' },
];

// Tarjetas con los tres primeros del ranking (por posición en la lista).
// profileOf(player) devuelve la ficha a la que enlazar, o null.
const Podium = ({ players, stat, statLabel, profileOf }) => (
  <div className="mb-8 grid gap-4 sm:grid-cols-3">
    {players.slice(0, 3).map((player, index) => {
      const profile = profileOf(player);
      const shown = profile || player;
      const medal = MEDALS[index];
      return (
        <Card key={player.id} className="relative overflow-hidden">
          <Card.Content className="flex-row items-center gap-3 p-4 sm:gap-4 sm:p-5">
            <PlayerAvatar player={shown} className="size-12 sm:size-16" />
            <div className="min-w-0 flex-1">
              <Chip size="sm" className={`mb-1 font-bold ${medal.className}`}>
                {medal.label}
              </Chip>
              <p className="truncate text-base font-semibold" title={shown.name}>
                {profile ? (
                  <Link href={`/jugadores/${profile.id}`} className="inline font-semibold text-foreground no-underline hover:text-accent">
                    {shown.name}
                  </Link>
                ) : (
                  shown.name
                )}
              </p>
              <p className="text-sm text-muted">{player.nationality || '-'}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-2xl font-bold tabular-nums text-accent sm:text-3xl">{player[stat]}</p>
              <p className="text-xs uppercase tracking-wide text-muted">{statLabel}</p>
            </div>
          </Card.Content>
        </Card>
      );
    })}
  </div>
);

export default Podium;
