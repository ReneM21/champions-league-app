import React from 'react';
import { Card, Chip, Label, ProgressBar } from '@heroui/react';
import PlayerPage from '../components/PlayerPage';
import { formatValue, STAT_LABELS, teamBreakdown } from '../utils/stats';

const Figure = ({ value, label }) => (
  <div>
    <p className="text-lg font-semibold tabular-nums">{formatValue(value)}</p>
    <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
  </div>
);

// Goles y asistencias por equipo. La estadística destacada (número grande,
// barra y orden) depende de si se llegó desde goleadores o asistidores.
const PlayerTeamsPage = () => (
  <PlayerPage>
    {(player, stat) => {
      const teams = teamBreakdown(player, stat);
      const labels = STAT_LABELS[stat];
      const other = stat === 'goals' ? 'assists' : 'goals';

      if (teams.length === 0) {
        // Sin temporadas: se muestran los clubes que da el ranking
        const clubs = player.clubs || [];
        return (
          <Card>
            <Card.Header>
              <Card.Title>Clubes en la Champions League</Card.Title>
              <Card.Description>Todavía no hay desglose por equipo para este jugador.</Card.Description>
            </Card.Header>
            <Card.Content>
              {clubs.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {clubs.map((club) => (
                    <Chip key={club} color="accent" variant="soft">
                      {club}
                    </Chip>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No hay información disponible sobre los equipos de este jugador.</p>
              )}
            </Card.Content>
          </Card>
        );
      }

      return (
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            {teams.map((team) => (
              <Card key={team.name}>
                <Card.Header className="flex-row items-center justify-between">
                  <Card.Title>{team.name}</Card.Title>
                  <span className="text-sm text-muted">
                    {team.seasons ? `${team.seasons} temporada${team.seasons === 1 ? '' : 's'}` : '-'}
                  </span>
                </Card.Header>
                <Card.Content className="gap-4">
                  <div className="flex items-end justify-between gap-4">
                    <p>
                      <span className="text-3xl font-bold tabular-nums text-accent">{formatValue(team[stat])}</span>
                      <span className="ml-2 text-muted">{labels.many}</span>
                    </p>
                    <div className="flex gap-6 text-right">
                      <Figure value={team[other]} label={STAT_LABELS[other].title} />
                      <Figure value={team.matches} label="Partidos" />
                    </div>
                  </div>
                  <ProgressBar value={team.share} aria-label={`Porcentaje de ${labels.many} con ${team.name}`}>
                    <Label className="text-xs text-muted">Del total del jugador</Label>
                    <ProgressBar.Output />
                    <ProgressBar.Track>
                      <ProgressBar.Fill />
                    </ProgressBar.Track>
                  </ProgressBar>
                </Card.Content>
              </Card>
            ))}
          </div>
          <p className="text-sm text-muted">
            Porcentaje sobre {player[stat] === null ? 'el total' : `${labels.article} ${player[stat]} ${labels.many}`} del jugador en la competición
            {stat === 'goals' ? '' : ' (la UEFA registra las asistencias desde la temporada 2001-02)'}.
          </p>
        </div>
      );
    }}
  </PlayerPage>
);

export default PlayerTeamsPage;
