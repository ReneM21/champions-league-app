import React from 'react';
import { Card, Chip, Table } from '@heroui/react';
import ClubLogo from '../components/ClubLogo';
import SeasonChart from '../components/SeasonChart';
import StatCard from '../components/StatCard';
import { formatRatio, formatValue, goalsPerMatch as perMatch, sortSeasonsDesc, STAT_LABELS, summarizeSeasons } from '../utils/stats';

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
        <p className="flex items-center gap-2 text-sm text-muted">
          <ClubLogo name={season.club} className="size-5" />
          {season.club}
        </p>
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

const PlayerSeasonsPage = ({ player, stat }) => {
  const summary = summarizeSeasons(player.seasons, stat);
  const { best, mostEfficient } = summary;
  const labels = STAT_LABELS[stat];
  const fromUefa = player.seasonsSource === 'uefa';

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
    <div className="grid grid-cols-1 gap-6">
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
              : player.titles === 0
                ? 'Aún sin títulos'
                : null
          }
        />
        <StatCard label={`${labels.title} por partido`} value={formatRatio(summary.perMatch)} highlight />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {best && (
          <SeasonHighlight
            title="Mejor temporada"
            season={best}
            accentClass="border-l-champions-gold"
            figures={[
              { label: labels.title, value: best[stat] },
              { label: 'Partidos', value: formatValue(best.matches) },
              stat === 'goals'
                ? { label: 'Asistencias', value: formatValue(best.assists) }
                : { label: 'Goles', value: formatValue(best.goals) },
              { label: labels.perMatch, value: formatRatio(perMatch(best[stat], best.matches)) },
            ]}
          />
        )}
        {mostEfficient && (
          <SeasonHighlight
            title="Máxima eficiencia"
            season={mostEfficient}
            accentClass="border-l-success"
            figures={[
              { label: labels.perMatch, value: formatRatio(perMatch(mostEfficient[stat], mostEfficient.matches)) },
              { label: labels.title, value: mostEfficient[stat] },
              { label: 'Partidos', value: mostEfficient.matches },
              stat === 'goals'
                ? { label: 'Asistencias', value: formatValue(mostEfficient.assists) }
                : { label: 'Goles', value: formatValue(mostEfficient.goals) },
            ]}
          />
        )}
      </div>

      <SeasonChart seasons={player.seasons} stat={stat} />

      <Card>
        <Card.Header>
          <Card.Title>Todas las temporadas</Card.Title>
          <Card.Description>
            Suma: {summary.totalGoals} goles y {formatValue(summary.totalAssists)} asistencias en{' '}
            {formatValue(summary.totalMatches)} partidos.{' '}
            {fromUefa
              ? 'Datos oficiales de la UEFA, actualizados automáticamente. La UEFA registra las asistencias desde la temporada 2001-02 ("-" en las anteriores).'
              : 'Se actualiza a mano y puede no incluir la temporada en curso.'}{' '}
            El promedio solo cuenta las temporadas con partidos registrados.
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label={`Temporadas de ${player.name}`} className="min-w-[620px]">
                <Table.Header>
                  <Table.Column isRowHeader>Temporada</Table.Column>
                  <Table.Column>Equipo</Table.Column>
                  <Table.Column className="text-right">Partidos</Table.Column>
                  <Table.Column className="text-right">Goles</Table.Column>
                  <Table.Column className="text-right">Asistencias</Table.Column>
                  <Table.Column className="text-right">{labels.perMatch}</Table.Column>
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
                      <Table.Cell className="text-muted">
                        <span className="inline-flex items-center gap-2">
                          <ClubLogo name={season.club} className="size-5" />
                          {season.club}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="text-right tabular-nums text-muted">{formatValue(season.matches)}</Table.Cell>
                      <Table.Cell className={`text-right tabular-nums ${stat === 'goals' ? 'font-semibold text-accent' : 'text-muted'}`}>
                        {formatValue(season.goals)}
                      </Table.Cell>
                      <Table.Cell className={`text-right tabular-nums ${stat === 'assists' ? 'font-semibold text-accent' : 'text-muted'}`}>
                        {formatValue(season.assists)}
                      </Table.Cell>
                      <Table.Cell className="text-right tabular-nums text-muted">
                        {season[stat] === null || season[stat] === undefined ? '-' : formatRatio(perMatch(season[stat], season.matches))}
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
};

export default PlayerSeasonsPage;
