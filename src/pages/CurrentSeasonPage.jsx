import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Card, Chip, Link, Table, Tabs } from '@heroui/react';
import DataNote from '../components/DataNote';
import MatchCard from '../components/MatchCard';
import PageHeader from '../components/PageHeader';
import PageSkeleton from '../components/PageSkeleton';
import PlayerAvatar from '../components/PlayerAvatar';
import SortSelect from '../components/SortSelect';
import TeamLogo from '../components/TeamLogo';
import { usePlayerByName } from '../data/PlayersContext';
import { TIME_ZONE, TIME_ZONE_LABEL, ZONES, byDay, defaultMatchday, formatDay, formatTime, isLive, matchdaysOf, resultFor, teamMatches, useCurrentSeason, zoneOf } from '../data/currentSeason';
import { formatDate } from '../utils/stats';
import { useTitle } from '../utils/useTitle';

const VIEWS = [
  { id: 'clasificacion', label: 'Clasificación' },
  { id: 'partidos', label: 'Partidos' },
  { id: 'goleadores', label: 'Goleadores' },
  { id: 'asistentes', label: 'Asistentes' },
  { id: 'equipos', label: 'Equipos' },
];

const RESULT_STYLE = {
  G: { label: 'Victoria', className: 'bg-success text-white' },
  E: { label: 'Empate', className: 'bg-default text-foreground' },
  P: { label: 'Derrota', className: 'bg-danger text-white' },
};

// Cuadradito de racha: G, E o P
const ResultBadge = ({ result, className = 'size-5 text-[0.65rem]' }) => (
  <span title={RESULT_STYLE[result].label} className={`inline-flex items-center justify-center rounded font-bold ${RESULT_STYLE[result].className} ${className}`}>
    {result}
  </span>
);

const TREND = { up: { symbol: '▲', className: 'text-success', label: 'Sube' }, down: { symbol: '▼', className: 'text-danger', label: 'Baja' } };

// logoOnly: en móvil solo el escudo (con el nombre para lectores de pantalla)
const TeamButton = ({ team, onTeam, short, logoOnly }) => (
  <button type="button" onClick={() => onTeam(team.id)} title={team.name} className="flex min-w-0 items-center gap-2.5 text-left font-medium hover:text-accent">
    <TeamLogo team={team} className="size-6" />
    <span className={logoOnly ? 'sr-only truncate sm:not-sr-only' : 'truncate'}>
      {short ? (
        <>
          <span className="sm:hidden">{team.short}</span>
          <span className="hidden sm:inline">{team.name}</span>
        </>
      ) : (
        team.name
      )}
    </span>
  </button>
);

// ---------- Clasificación ----------

const StandingsView = ({ data, onTeam }) => {
  if (!data.standings.length)
    return (
      <Card>
        <Card.Content className="p-8 text-center text-muted">La clasificación aparecerá cuando empiece la fase de liga.</Card.Content>
      </Card>
    );
  const table = data.standings[0];
  return (
    <div>
      <Table>
        <Table.ScrollContainer>
          <Table.Content aria-label="Clasificación de la fase de liga" className="sm:min-w-[640px]">
            <Table.Header>
              <Table.Column className="w-10 sm:w-14">#</Table.Column>
              <Table.Column isRowHeader>Equipo</Table.Column>
              <Table.Column className="text-right" title="Partidos jugados">PJ</Table.Column>
              <Table.Column className="hidden text-right sm:table-cell" title="Ganados">G</Table.Column>
              <Table.Column className="hidden text-right sm:table-cell" title="Empatados">E</Table.Column>
              <Table.Column className="hidden text-right sm:table-cell" title="Perdidos">P</Table.Column>
              <Table.Column className="hidden text-right sm:table-cell" title="Goles a favor y en contra">Goles</Table.Column>
              <Table.Column className="hidden text-right sm:table-cell" title="Diferencia de goles">DG</Table.Column>
              <Table.Column className="text-right">Pts</Table.Column>
              <Table.Column className="hidden md:table-cell">Racha</Table.Column>
            </Table.Header>
            <Table.Body>
              {table.rows.map((row) => {
                const team = data.teams[row.team] || { id: row.team, name: row.team };
                const zone = zoneOf(row.rank);
                const trend = TREND[row.trend];
                return (
                  <Table.Row key={row.team} id={row.team}>
                    <Table.Cell>
                      <span className="flex items-center gap-1.5 sm:gap-2">
                        <span className={`h-5 w-1 rounded-full ${zone ? zone.className : 'bg-transparent'}`} title={zone ? zone.label : undefined} />
                        <span className="w-5 font-semibold tabular-nums">{row.rank}</span>
                        {trend && (
                          <span className={`hidden text-[0.6rem] sm:inline ${trend.className}`} title={trend.label} aria-label={trend.label}>
                            {trend.symbol}
                          </span>
                        )}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="flex items-center gap-2">
                        <TeamButton team={team} onTeam={onTeam} short />
                        {row.live && (
                          <Chip color="danger" size="sm" variant="soft">
                            En juego
                          </Chip>
                        )}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="text-right tabular-nums">{row.played}</Table.Cell>
                    <Table.Cell className="hidden text-right tabular-nums sm:table-cell">{row.won}</Table.Cell>
                    <Table.Cell className="hidden text-right tabular-nums sm:table-cell">{row.drawn}</Table.Cell>
                    <Table.Cell className="hidden text-right tabular-nums sm:table-cell">{row.lost}</Table.Cell>
                    <Table.Cell className="hidden whitespace-nowrap text-right tabular-nums text-muted sm:table-cell">
                      {row.goalsFor}:{row.goalsAgainst}
                    </Table.Cell>
                    <Table.Cell className="hidden text-right tabular-nums text-muted sm:table-cell">{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</Table.Cell>
                    <Table.Cell className="text-right text-base font-bold tabular-nums text-accent">{row.points}</Table.Cell>
                    <Table.Cell className="hidden md:table-cell">
                      <span className="flex gap-1">
                        {row.form.map((result, index) => (
                          <ResultBadge key={index} result={result} />
                        ))}
                      </span>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
        {ZONES.map((zone) => (
          <li key={zone.id} className="flex items-center gap-2">
            <span className={`h-4 w-1 rounded-full ${zone.className}`} />
            {zone.from}.º–{zone.to}.º: {zone.label}
          </li>
        ))}
      </ul>
      {!table.official && <p className="mt-2 text-xs text-muted">Clasificación provisional mientras se juega la jornada.</p>}
    </div>
  );
};

// ---------- Partidos por ronda y jornada ----------

const MatchesView = ({ data, onTeam }) => {
  const initial = useMemo(() => defaultMatchday(data.matches), [data.matches]);
  const [roundId, setRoundId] = useState(initial ? initial.round : data.rounds[0] && data.rounds[0].id);
  const days = useMemo(() => matchdaysOf(data.matches, roundId), [data.matches, roundId]);
  const [dayKey, setDayKey] = useState(initial ? initial.key : null);
  const day = days.find((d) => d.key === dayKey) || days[0];
  const index = days.indexOf(day);

  const changeRound = (id) => {
    setRoundId(id);
    const roundDays = matchdaysOf(data.matches, id);
    // Al cambiar de ronda: la jornada por jugar o, si ya se jugó todo, la primera
    const next = roundDays.find((d) => d.matches.some((m) => m.status !== 'FINISHED'));
    setDayKey((next || roundDays[0] || {}).key);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <SortSelect label="Ronda" value={roundId} onChange={changeRound} options={data.rounds.map((r) => ({ id: r.id, label: r.name }))} />
        {days.length > 1 && (
          <SortSelect label={day && day.matches[0].leg ? 'Partido' : 'Jornada'} value={day ? day.key : ''} onChange={setDayKey} options={days.map((d) => ({ id: d.key, label: d.name }))} />
        )}
        {days.length > 1 && (
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" isDisabled={index <= 0} onPress={() => setDayKey(days[index - 1].key)} aria-label="Jornada anterior">
              ‹ Anterior
            </Button>
            <Button size="sm" variant="secondary" isDisabled={index >= days.length - 1} onPress={() => setDayKey(days[index + 1].key)} aria-label="Jornada siguiente">
              Siguiente ›
            </Button>
          </div>
        )}
      </div>

      <p className="-mt-2 mb-6 text-xs text-muted">Horarios en {TIME_ZONE_LABEL}.</p>

      {day ? (
        byDay(day.matches).map((group) => (
          <section key={group.key} className="mb-8">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted first-letter:uppercase">{formatDay(group.date)}</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {group.matches.map((match) => (
                <MatchCard key={match.id} match={match} teams={data.teams} showDate={false} onTeam={onTeam} />
              ))}
            </div>
          </section>
        ))
      ) : (
        <p className="text-muted">No hay partidos en esta ronda.</p>
      )}
    </div>
  );
};

// ---------- Goleadores y asistentes ----------

const LeaderPlayer = ({ name }) => {
  const player = usePlayerByName()(name);
  return (
    <span className="flex min-w-0 items-center gap-3">
      <PlayerAvatar player={player || { name }} className="size-9" />
      {player ? (
        <Link href={`/jugadores/${player.id}`} className="font-medium text-foreground no-underline hover:text-accent sm:truncate">
          {name}
        </Link>
      ) : (
        <span className="font-medium sm:truncate">{name}</span>
      )}
    </span>
  );
};

const LeadersView = ({ data, stat, onTeam }) => {
  const rows = stat === 'goals' ? data.scorers : data.assisters;
  const other = stat === 'goals' ? 'assists' : 'goals';
  const label = { goals: 'Goles', assists: 'Asist.' };
  if (!rows.length)
    return (
      <Card>
        <Card.Content className="p-8 text-center text-muted">Todavía no hay datos.</Card.Content>
      </Card>
    );
  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label={stat === 'goals' ? 'Máximos goleadores' : 'Máximos asistentes'} className="sm:min-w-[560px]">
          <Table.Header>
            <Table.Column className="w-8 sm:w-12">#</Table.Column>
            <Table.Column isRowHeader>Jugador</Table.Column>
            <Table.Column>
              <span className="sr-only sm:not-sr-only">Equipo</span>
            </Table.Column>
            <Table.Column className="hidden text-right sm:table-cell" title="Partidos jugados">PJ</Table.Column>
            <Table.Column className="hidden text-right sm:table-cell">{label[other]}</Table.Column>
            <Table.Column className="text-right">{label[stat]}</Table.Column>
          </Table.Header>
          <Table.Body>
            {rows.map((row, index) => {
              const team = data.teams[row.team];
              const tied = index > 0 && rows[index - 1][stat] === row[stat];
              return (
                <Table.Row key={`${row.name}-${row.team}`} id={`${row.name}-${row.team}`}>
                  <Table.Cell className="font-semibold tabular-nums text-muted">{tied ? '=' : index + 1}</Table.Cell>
                  <Table.Cell>
                    <LeaderPlayer name={row.name} />
                  </Table.Cell>
                  <Table.Cell>{team ? <TeamButton team={team} onTeam={onTeam} short logoOnly /> : null}</Table.Cell>
                  <Table.Cell className="hidden text-right tabular-nums sm:table-cell">{row.matches}</Table.Cell>
                  <Table.Cell className="hidden text-right tabular-nums text-muted sm:table-cell">{row[other]}</Table.Cell>
                  <Table.Cell className="text-right text-base font-bold tabular-nums text-accent">{row[stat]}</Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
};

// ---------- Calendario de cada equipo ----------

const TeamView = ({ data, teamId, onTeam }) => {
  const options = useMemo(() => {
    const inLeague = new Set(((data.standings[0] && data.standings[0].rows) || []).map((r) => r.team));
    const sorted = Object.values(data.teams).sort((a, b) => a.name.localeCompare(b.name, 'es'));
    // Primero los equipos de la fase de liga; después los eliminados en las previas
    return [...sorted.filter((t) => inLeague.has(t.id)), ...sorted.filter((t) => !inLeague.has(t.id))].map((t) => ({
      id: t.id,
      label: inLeague.size && !inLeague.has(t.id) ? `${t.name} (previas)` : t.name,
    }));
  }, [data]);
  const team = data.teams[teamId] || data.teams[(options[0] || {}).id];
  if (!team) return null;

  const matches = teamMatches(data.matches, team.id);
  const standing = data.standings[0] && data.standings[0].rows.find((r) => r.team === team.id);
  const zone = standing && zoneOf(standing.rank);
  const results = matches.map((m) => resultFor(m, team.id)).filter(Boolean);
  const count = (r) => results.filter((x) => x === r).length;
  const goalsFor = matches.reduce((sum, m) => sum + (m.status === 'FINISHED' && m.score ? (m.home === team.id ? m.score.home : m.score.away) : 0), 0);
  const goalsAgainst = matches.reduce((sum, m) => sum + (m.status === 'FINISHED' && m.score ? (m.home === team.id ? m.score.away : m.score.home) : 0), 0);
  const scorers = data.scorers.filter((p) => p.team === team.id).slice(0, 5);
  const roundName = Object.fromEntries(data.rounds.map((r) => [r.id, r.name]));
  const next = matches.find((m) => m.status !== 'FINISHED');

  return (
    <div>
      <div className="mb-6">
        <SortSelect label="Equipo" value={team.id} onChange={onTeam} options={options} />
      </div>

      <Card className="mb-6 overflow-hidden p-0">
        <div className="champions-hero flex flex-wrap items-center gap-5 p-6 text-white">
          <span className="flex size-20 shrink-0 items-center justify-center rounded-full bg-white p-2.5">
            <TeamLogo team={team} className="size-full" />
          </span>
          <div className="min-w-0">
            <p className="text-sm text-white/70">{team.country}</p>
            <h2 className="text-2xl font-bold sm:text-3xl">{team.name}</h2>
            {standing && (
              <p className="mt-1 text-sm text-white/80">
                {standing.rank}.º en la fase de liga · {standing.points} puntos{zone ? ` · ${zone.label}` : ''}
              </p>
            )}
          </div>
        </div>
        <Card.Content className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-5">
          {[
            ['Partidos', results.length],
            ['Victorias', count('G')],
            ['Empates', count('E')],
            ['Derrotas', count('P')],
            ['Goles', `${goalsFor}:${goalsAgainst}`],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
              <p className="text-2xl font-bold tabular-nums text-accent">{value}</p>
            </div>
          ))}
        </Card.Content>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section>
          <h3 className="mb-3 text-lg font-bold">Calendario y resultados</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} teams={data.teams} showRound roundName={roundName[match.round]} onTeam={onTeam} />
            ))}
          </div>
        </section>
        <aside className="space-y-6">
          {next && (
            <Card>
              <Card.Header>
                <Card.Title>Próximo partido</Card.Title>
                <Card.Description>
                  {roundName[next.round]} · {next.matchdayName}
                </Card.Description>
              </Card.Header>
              <Card.Content className="gap-2">
                <p className="font-semibold">
                  {next.home === team.id ? 'vs.' : 'en casa de'} {(data.teams[next.home === team.id ? next.away : next.home] || {}).name || 'Por determinar'}
                </p>
                <p className="text-sm text-muted first-letter:uppercase">
                  {formatDay(next.date)}
                  {next.date ? ` · ${formatTime(next.date)} (${TIME_ZONE_LABEL})` : ''}
                </p>
              </Card.Content>
            </Card>
          )}
          {results.length > 0 && (
            <Card>
              <Card.Header>
                <Card.Title>Racha</Card.Title>
              </Card.Header>
              <Card.Content className="flex-row flex-wrap gap-1.5">
                {results.slice(-10).map((result, index) => (
                  <ResultBadge key={index} result={result} className="size-7 text-xs" />
                ))}
              </Card.Content>
            </Card>
          )}
          {scorers.length > 0 && (
            <Card>
              <Card.Header>
                <Card.Title>Goleadores</Card.Title>
                <Card.Description>Entre los máximos goleadores de la competición</Card.Description>
              </Card.Header>
              <Card.Content className="gap-3">
                {scorers.map((p) => (
                  <div key={p.name} className="flex items-center justify-between gap-3">
                    <LeaderPlayer name={p.name} />
                    <span className="shrink-0 font-bold tabular-nums text-accent">{p.goals}</span>
                  </div>
                ))}
              </Card.Content>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
};

// ---------- Página ----------

const Summary = ({ data }) => {
  const live = data.matches.filter(isLive).length;
  const played = data.matches.filter((m) => m.status === 'FINISHED');
  const goals = played.reduce((sum, m) => sum + (m.score ? m.score.home + m.score.away : 0), 0);
  const current = data.rounds.find((r) => r.status === 'CURRENT') || data.rounds[data.rounds.length - 1];
  const leader = data.standings[0] && data.standings[0].rows[0] && data.teams[data.standings[0].rows[0].team];
  const perMatch = played.length ? (goals / played.length).toFixed(2).replace('.', ',') : '0';
  const items = [
    ['Ronda actual', current ? current.name : '-'],
    ['Partidos jugados', played.length, `de ${data.matches.length} programados`],
    ['Goles', goals, `${perMatch} por partido`],
    ['Líder', leader ? leader.name : '-', leader ? `${data.standings[0].rows[0].points} puntos` : null],
  ];
  return (
    <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map(([label, value, detail]) => (
        <Card key={label} className="min-w-0 gap-1 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
          <p className="text-lg font-bold leading-tight text-accent">{value}</p>
          {detail && <p className="text-xs text-muted">{detail}</p>}
        </Card>
      ))}
      {live > 0 && (
        <p className="col-span-full flex items-center gap-2 text-sm font-medium text-danger">
          <span className="inline-block size-2 animate-pulse rounded-full bg-danger" aria-hidden="true" />
          {live} partido{live === 1 ? '' : 's'} en juego ahora mismo
        </p>
      )}
    </div>
  );
};

const CurrentSeasonPage = () => {
  const { status, data } = useCurrentSeason();
  const [params, setParams] = useSearchParams();
  useTitle(data ? `Temporada ${data.season}` : 'Temporada actual');
  const view = VIEWS.some((v) => v.id === params.get('vista')) ? params.get('vista') : 'clasificacion';
  const setView = (id) => setParams(id === 'clasificacion' ? {} : { vista: id }, { replace: true });
  const openTeam = (teamId) => {
    setParams({ vista: 'equipos', equipo: teamId });
    window.scrollTo(0, 0);
  };

  if (status === 'loading') return <PageSkeleton />;
  if (status === 'error' || !data)
    return (
      <div>
        <PageHeader title="Temporada actual" />
        <Card>
          <Card.Content className="p-8 text-center text-muted">Los datos de la temporada en curso se cargarán en la próxima actualización automática.</Card.Content>
        </Card>
      </div>
    );

  return (
    <div>
      <PageHeader
        title={`Temporada ${data.season}`}
        description="Clasificación, resultados de cada jornada, calendario de cada equipo y máximos goleadores y asistentes de la Champions en curso."
      />

      <Summary data={data} />

      {/* Solo la lista de pestañas va dentro de Tabs (sus paneles se pintan en
          una segunda pasada y la vista aparecía un instante después) */}
      <Tabs selectedKey={view} onSelectionChange={(key) => setView(String(key))}>
        <Tabs.ListContainer className="mb-6 overflow-x-auto">
          <Tabs.List aria-label="Temporada actual">
            {VIEWS.map((v) => (
              <Tabs.Tab key={v.id} id={v.id} className="whitespace-nowrap">
                {v.label}
                <Tabs.Indicator className="transition-none" />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>

      <section aria-label={VIEWS.find((v) => v.id === view).label}>
        {view === 'clasificacion' && <StandingsView data={data} onTeam={openTeam} />}
        {view === 'partidos' && <MatchesView data={data} onTeam={openTeam} />}
        {view === 'goleadores' && <LeadersView data={data} stat="goals" onTeam={openTeam} />}
        {view === 'asistentes' && <LeadersView data={data} stat="assists" onTeam={openTeam} />}
        {view === 'equipos' && <TeamView data={data} teamId={params.get('equipo')} onTeam={openTeam} />}
      </section>

      <DataNote>
        <p>
          Datos oficiales de la{' '}
          <Link href="https://www.uefa.com/uefachampionsleague/" target="_blank" rel="noopener noreferrer">
            UEFA
          </Link>
          , actualizados automáticamente cada media hora los días de partido (martes y miércoles por la tarde y noche) y cada mañana el resto de
          días. Última actualización: <strong>{formatDate(data.updatedAt, TIME_ZONE)}</strong>, a las{' '}
          {formatTime(data.updatedAt)} ({TIME_ZONE_LABEL}).
        </p>
        <p>Todas las fechas y horas están en hora de Colombia.</p>
      </DataNote>
    </div>
  );
};

export default CurrentSeasonPage;
