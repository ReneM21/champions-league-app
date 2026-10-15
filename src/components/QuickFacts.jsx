import React from 'react';
import { Card, Link } from '@heroui/react';
import ClubLogo from './ClubLogo';
import PlayerAvatar from './PlayerAvatar';
import { useCompetition, usePlayers } from '../data/PlayersContext';

const Fact = ({ label, children, href }) => (
  <Card className="w-72 min-w-0 shrink-0 snap-start sm:w-auto">
    <Card.Content className="min-w-0 gap-2 p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        {href && (
          <Link href={href} className="shrink-0 text-xs">
            Ver
          </Link>
        )}
      </div>
      <div className="flex min-w-0 items-center gap-3">{children}</div>
    </Card.Content>
  </Card>
);

// Resumen de la portada: último campeón, próxima final y máximo goleador en activo
const QuickFacts = () => {
  const { competition } = useCompetition();
  const { players } = usePlayers();
  if (!competition) return null;

  const last = competition.finals[competition.finals.length - 1];
  const next = (competition.upcoming || [])[0];
  const active = players.find((player) => player.active);

  return (
    <section aria-label="Resumen" className="-mx-4 mb-8 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
      <Fact label={`Último campeón · ${last.season}`} href="/temporadas">
        <ClubLogo name={last.winner} className="size-10" />
        <div className="min-w-0">
          <p className="truncate font-semibold">{last.winner}</p>
          <p className="truncate text-sm text-muted">
            {last.score}
            {last.penalties ? ' (pen.)' : last.extraTime ? ' (prór.)' : ''} ante {last.runnerUp}
          </p>
        </div>
      </Fact>
      {next && (
        <Fact label={`Próxima final · ${next.season}`}>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-lg" aria-hidden="true">
            🏟️
          </span>
          <p className="min-w-0 text-sm font-medium">{next.venue}</p>
        </Fact>
      )}
      {active && (
        <Fact label="Máximo goleador en activo" href={`/jugadores/${active.id}`}>
          <PlayerAvatar player={active} className="size-10" />
          <div className="min-w-0">
            <p className="truncate font-semibold">{active.name}</p>
            <p className="text-sm text-muted">
              {active.goals} goles · {active.position}º de la historia
            </p>
          </div>
        </Fact>
      )}
    </section>
  );
};

export default QuickFacts;
