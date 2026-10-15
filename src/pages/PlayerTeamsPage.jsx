import React from 'react';
import { Card, Chip, Label, ProgressBar } from '@heroui/react';
import PlayerPage from '../components/PlayerPage';
import { teamBreakdown } from '../utils/stats';

const PlayerTeamsPage = () => (
  <PlayerPage>
    {(player) => {
      const teams = teamBreakdown(player);

      if (teams.length === 0) {
        // Sin ficha manual: se muestran los clubes que da el ranking, sin desglose de goles
        const clubs = player.clubs || [];
        return (
          <Card>
            <Card.Header>
              <Card.Title>Clubes en la Champions League</Card.Title>
              <Card.Description>Todavía no hay desglose de goles por equipo para este jugador.</Card.Description>
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
                <Card.Content className="gap-3">
                  <p>
                    <span className="text-3xl font-bold tabular-nums text-accent">{team.goals}</span>
                    <span className="ml-2 text-muted">goles</span>
                  </p>
                  <ProgressBar value={team.share} aria-label={`Porcentaje de goles con ${team.name}`}>
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
          <p className="text-sm text-muted">Porcentaje sobre los {player.goals} goles totales del jugador en la competición.</p>
        </div>
      );
    }}
  </PlayerPage>
);

export default PlayerTeamsPage;
