import React from 'react';
import { Card, Chip, Table } from '@heroui/react';
import PlayerPage from '../components/PlayerPage';
import StatCard from '../components/StatCard';
import { formatRatio, formatValue, goalsPerMatch, sortSeasonsDesc, summarizeSeasons } from '../utils/stats';

const Figure = ({ value, label }) => (
  <div>
    <p className="text-2xl font-bold tabular-nums">{value}</p>
    <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
  </div>
);

// Tarjeta destacada de una temporada (mejor temporada, máxima eficiencia)
const SeasonHighlight = ({ title, season, accentClass, figures }) => (
  <Card className={`border-l-4 ${accentClass}`}>
    <Card.Header className="flex-row items-start justify-between gap-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{title}</p>
        <Card.Title className="text-xl">{season.season}</Card.Title>
        <p className="text-sm text-muted">{season.club}</p>
      </div>
      {season.title && (
        <Chip color="success" size="sm">
          Campeón
        </Chip>
      )}
    </Card.Header>
    <Card.Content className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {figures.map((figure) => (
        <Figure key={figure.label} {...figure} />
      ))}
    </Card.Content>
  </Card>
);

const PlayerSeasonsPage = () => (
  <PlayerPage>
    {(player) => {
      const summary = summarizeSeasons(player.seasons);
      const { best, mostEfficient } = summary;

      if (summary.count === 0) {
        return (
          <Card>
            <Card.Content className="p-8 text-center text-muted">
              No hay información disponible sobre las temporadas de este jugador.
            </Card.Content>
          </Card>
        );
      }

      return (
        <div className="grid gap-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="Temporadas" value={summary.count} note={`${summary.first.season} – ${summary.last.season}`} />
            <StatCard label="Equipos" value={summary.clubs.length} note={summary.clubs.join(', ')} />
            <StatCard
              label="Títulos"
              value={player.titles}
              note={
                player.titles > 0
                  ? summary.titleSeasons.length > 0
                    ? `Campeón en ${summary.titleSeasons.join(', ')}`
                    : null
                  : 'Aún sin títulos'
              }
            />
            <StatCard label="Goles por partido" value={formatRatio(summary.goalsPerMatch)} highlight />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {best && (
              <SeasonHighlight
                title="Mejor temporada"
                season={best}
                accentClass="border-l-champions-gold"
                figures={[
                  { label: 'Goles', value: best.goals },
                  { label: 'Partidos', value: formatValue(best.matches) },
                  { label: 'Asistencias', value: formatValue(best.assists) },
                  { label: 'Goles/partido', value: formatRatio(goalsPerMatch(best.goals, best.matches)) },
                ]}
              />
            )}
            {mostEfficient && (
              <SeasonHighlight
                title="Máxima eficiencia"
                season={mostEfficient}
                accentClass="border-l-success"
                figures={[
                  { label: 'Goles/partido', value: formatRatio(goalsPerMatch(mostEfficient.goals, mostEfficient.matches)) },
                  { label: 'Goles', value: mostEfficient.goals },
                  { label: 'Partidos', value: mostEfficient.matches },
                  { label: 'Asistencias', value: formatValue(mostEfficient.assists) },
                ]}
              />
            )}
          </div>

          <Card>
            <Card.Header>
              <Card.Title>Todas las temporadas</Card.Title>
              <Card.Description>
                Suma: {summary.totalGoals} goles en {formatValue(summary.totalMatches)} partidos y{' '}
                {formatValue(summary.totalAssists)} asistencias. Se actualiza a mano y puede no incluir la temporada en curso;
                el promedio solo cuenta las temporadas con partidos registrados.
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <Table>
                <Table.ScrollContainer>
                  <Table.Content aria-label={`Temporadas de ${player.name}`} className="min-w-[520px]">
                    <Table.Header>
                      <Table.Column isRowHeader>Temporada</Table.Column>
                      <Table.Column>Equipo</Table.Column>
                      <Table.Column className="text-right">Partidos</Table.Column>
                      <Table.Column className="text-right">Goles</Table.Column>
                      <Table.Column className="text-right">Promedio</Table.Column>
                    </Table.Header>
                    <Table.Body>
                      {sortSeasonsDesc(player.seasons).map((season) => (
                        <Table.Row key={`${season.season}-${season.club}`} id={`${season.season}-${season.club}`}>
                          <Table.Cell className="font-medium">
                            <span className="inline-flex items-center gap-2">
                              {season.season}
                              {season.title && (
                                <Chip color="success" size="sm">
                                  Campeón
                                </Chip>
                              )}
                            </span>
                          </Table.Cell>
                          <Table.Cell className="text-muted">{season.club}</Table.Cell>
                          <Table.Cell className="text-right tabular-nums text-muted">{formatValue(season.matches)}</Table.Cell>
                          <Table.Cell className="text-right font-semibold tabular-nums text-accent">{season.goals}</Table.Cell>
                          <Table.Cell className="text-right tabular-nums text-muted">
                            {formatRatio(goalsPerMatch(season.goals, season.matches))}
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Content>
                </Table.ScrollContainer>
              </Table>
            </Card.Content>
          </Card>
        </div>
      );
    }}
  </PlayerPage>
);

export default PlayerSeasonsPage;
