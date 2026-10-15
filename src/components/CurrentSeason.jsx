import React, { useState } from 'react';
import { Button, Card, Chip, Link } from '@heroui/react';
import ClubLogo from './ClubLogo';
import PlayerAvatar from './PlayerAvatar';
import { useCompetition, usePlayerByName } from '../data/PlayersContext';

const LeaderRow = ({ row, stat, position }) => {
  const player = usePlayerByName()(row.name);
  return (
    <li className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-3 py-2">
      <span className="text-sm font-semibold tabular-nums text-muted">{position}</span>
      <span className="flex min-w-0 items-center gap-3">
        <PlayerAvatar player={player || { name: row.name }} className="size-8" />
        <span className="min-w-0">
          {player ? (
            <Link href={`/jugadores/${player.id}`} className="block truncate font-medium text-foreground no-underline hover:text-accent">
              {row.name}
            </Link>
          ) : (
            <span className="block truncate font-medium">{row.name}</span>
          )}
          <span className="flex items-center gap-1.5 truncate text-xs text-muted">
            <ClubLogo name={row.club} className="size-3.5" />
            {row.club} · {row.matches} partido{row.matches === 1 ? '' : 's'}
          </span>
        </span>
      </span>
      <span className="text-lg font-bold tabular-nums text-accent">{row[stat]}</span>
    </li>
  );
};

const LeaderList = ({ title, rows, stat }) => (
  <div className="min-w-0">
    <p className="text-xs font-medium uppercase tracking-wide text-muted">{title}</p>
    {rows.length ? (
      <ol className="divide-y divide-separator">
        {rows.map((row, index) => (
          <LeaderRow key={row.name} row={row} stat={stat} position={index > 0 && rows[index - 1][stat] === row[stat] ? '=' : index + 1} />
        ))}
      </ol>
    ) : (
      <p className="py-4 text-sm text-muted">Todavía no hay datos.</p>
    )}
  </div>
);

// Temporada en curso: máximos goleadores y asistentes (UEFA, actualizados a diario)
const CurrentSeason = () => {
  const { currentSeason, competition } = useCompetition();
  const [all, setAll] = useState(false);
  if (!currentSeason) return null;
  const finalOfSeason = competition && (competition.finals.find((f) => f.season === currentSeason.season) || (competition.upcoming || []).find((f) => f.season === currentSeason.season));
  const count = all ? 10 : 5;
  return (
    <Card className="mb-8">
      <Card.Header className="flex-row flex-wrap items-center justify-between gap-2">
        <div>
          <Card.Title className="text-lg">Temporada {currentSeason.season}</Card.Title>
          <Card.Description>
            Máximos goleadores y asistentes de la Champions en curso, con datos oficiales de la UEFA actualizados cada día.
          </Card.Description>
        </div>
        {finalOfSeason && !finalOfSeason.winner && (
          <Chip color="warning" variant="soft" className="font-semibold">
            Final: {finalOfSeason.venue}
          </Chip>
        )}
      </Card.Header>
      <Card.Content className="gap-4">
        <div className="grid gap-6 md:grid-cols-2">
          <LeaderList title="Goleadores" rows={currentSeason.scorers.slice(0, count)} stat="goals" />
          <LeaderList title="Asistentes" rows={currentSeason.assisters.slice(0, count)} stat="assists" />
        </div>
        {(currentSeason.scorers.length > 5 || currentSeason.assisters.length > 5) && (
          <Button size="sm" variant="ghost" className="self-start" onPress={() => setAll(!all)}>
            {all ? 'Ver menos' : 'Ver los 10 primeros'}
          </Button>
        )}
      </Card.Content>
    </Card>
  );
};

export default CurrentSeason;
