import React from 'react';
import { Card, Chip, Link } from '@heroui/react';
import TeamLogo from './TeamLogo';
import { usePlayerByName } from '../data/PlayersContext';
import { formatShortDay, formatTime, isLive, isPlayed } from '../data/currentSeason';

const GOAL_NOTE = { penalty: ' (p.)', own: ' (p.p.)' };

// Nombre del jugador con enlace a su ficha si está en los rankings de la app
const PlayerName = ({ name }) => {
  const player = usePlayerByName()(name);
  if (!player) return name;
  return (
    <Link href={`/jugadores/${player.id}`} className="text-inherit no-underline hover:text-accent">
      {name}
    </Link>
  );
};

const StatusChip = ({ match }) => {
  if (isLive(match))
    return (
      <Chip color="danger" size="sm" variant="soft" className="font-semibold">
        <span className="mr-1 inline-block size-1.5 rounded-full bg-danger" aria-hidden="true" />
        En juego
      </Chip>
    );
  if (match.status === 'FINISHED')
    return (
      <Chip size="sm" variant="soft">
        Final
      </Chip>
    );
  if (match.status === 'POSTPONED')
    return (
      <Chip color="warning" size="sm" variant="soft">
        Aplazado
      </Chip>
    );
  return (
    <Chip color="accent" size="sm" variant="soft" className="tabular-nums">
      {formatTime(match.date)}
    </Chip>
  );
};

// Fila de un equipo: escudo, nombre y goles; en negrita el ganador
const TeamLine = ({ team, goals, winner, played, onTeam }) => (
  <div className="flex items-center justify-between gap-3">
    <button
      type="button"
      onClick={onTeam && team ? () => onTeam(team.id) : undefined}
      disabled={!onTeam}
      className={`flex min-w-0 items-center gap-2.5 text-left ${onTeam ? 'cursor-pointer hover:text-accent' : 'cursor-default'} ${winner ? 'font-semibold' : ''}`}
    >
      <TeamLogo team={team} className="size-7" />
      <span className="truncate">{team ? team.name : 'Por determinar'}</span>
    </button>
    <span className={`text-xl tabular-nums ${winner ? 'font-bold' : 'font-medium text-muted'}`}>{played ? goals : ''}</span>
  </div>
);

// Goles de un equipo, uno por línea
const GoalList = ({ goals, align = 'left' }) => (
  <ul className={`space-y-0.5 text-xs text-muted ${align === 'right' ? 'text-right' : ''}`}>
    {goals.map((goal, index) => (
      <li key={index}>
        <span className="tabular-nums">{goal.minute}</span> <PlayerName name={goal.player} />
        {GOAL_NOTE[goal.type] || ''}
      </li>
    ))}
  </ul>
);

// Partido de la temporada actual. teams: id -> equipo. Con onTeam, los
// nombres de los equipos abren su calendario. showDate=false cuando la fecha
// y la jornada ya están en el título de la sección.
const MatchCard = ({ match, teams, showRound, roundName, showDate = true, onTeam }) => {
  const home = teams[match.home];
  const away = teams[match.away];
  const played = isPlayed(match) && match.score;
  const homeGoals = match.goals.filter((g) => g.teamId === match.home);
  const awayGoals = match.goals.filter((g) => g.teamId === match.away);
  // En negrita quien ganó el partido (o la tanda de penaltis); quién pasa la eliminatoria va abajo
  const winner = match.winner || (match.penalties ? (match.penalties.home > match.penalties.away ? match.home : match.away) : null);
  const extras = [
    match.aggregate && `Global ${match.aggregate.home}-${match.aggregate.away}`,
    match.penalties && `Penaltis ${match.penalties.home}-${match.penalties.away}`,
    match.qualified && teams[match.qualified] && `Pasa ${teams[match.qualified].name}`,
  ].filter(Boolean);
  const reds = match.redCards || [];

  return (
    <Card className={`gap-3 p-4 ${isLive(match) ? 'ring-2 ring-danger/60' : ''}`}>
      <div className="flex items-center justify-between gap-2 text-xs text-muted">
        <span className="truncate">
          {[showRound && roundName, showDate && match.matchdayName, showDate && formatShortDay(match.date)].filter(Boolean).join(' · ')}
        </span>
        <StatusChip match={match} />
      </div>

      <div className="space-y-2">
        <TeamLine team={home} goals={match.score && match.score.home} winner={played && winner === match.home} played={played} onTeam={onTeam} />
        <TeamLine team={away} goals={match.score && match.score.away} winner={played && winner === match.away} played={played} onTeam={onTeam} />
      </div>

      {(homeGoals.length > 0 || awayGoals.length > 0) && (
        <div className="grid grid-cols-2 gap-3 border-t border-separator pt-2">
          <GoalList goals={homeGoals} />
          <GoalList goals={awayGoals} align="right" />
        </div>
      )}

      {reds.length > 0 && (
        <p className="text-xs text-muted">
          <span className="mr-1 inline-block h-2.5 w-2 rounded-[1px] bg-danger align-middle" aria-hidden="true" />
          Expulsado{reds.length > 1 ? 's' : ''}: {reds.map((r) => `${r.player} (${r.minute})`).join(', ')}
        </p>
      )}

      {extras.length > 0 && <p className="text-xs font-medium text-accent">{extras.join(' · ')}</p>}

      {(match.stadium || match.attendance) && (
        <p className="truncate text-xs text-muted">
          {[match.stadium && `${match.stadium}${match.city ? `, ${match.city}` : ''}`, match.attendance && `${match.attendance.toLocaleString('es-ES')} espectadores`]
            .filter(Boolean)
            .join(' · ')}
        </p>
      )}
    </Card>
  );
};

export default MatchCard;
