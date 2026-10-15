import React, { useMemo, useState } from 'react';
import { Card, Chip, Link } from '@heroui/react';
import ClubLogo from '../components/ClubLogo';
import DataNote from '../components/DataNote';
import Pagination, { paginate } from '../components/Pagination';
import PlayerAvatar from '../components/PlayerAvatar';
import PageHeader from '../components/PageHeader';
import PageSkeleton from '../components/PageSkeleton';
import SortSelect from '../components/SortSelect';
import { useCompetition, usePlayerByName } from '../data/PlayersContext';
import { formatDate } from '../utils/stats';
import { useTitle } from '../utils/useTitle';

const TEAMS_PER_PAGE = 8;

const SORTS = {
  titles: (a, b) => b.titles - a.titles || b.finals - a.finals,
  finals: (a, b) => b.finals - a.finals || b.titles - a.titles,
  played: (a, b) => (b.stats ? b.stats.played : -1) - (a.stats ? a.stats.played : -1) || b.titles - a.titles,
  recent: (a, b) => Math.max(0, ...b.wonYears, ...b.lostYears) - Math.max(0, ...a.wonYears, ...a.lostYears),
};

const SORT_OPTIONS = [
  { id: 'titles', label: 'Más títulos' },
  { id: 'finals', label: 'Más finales' },
  { id: 'played', label: 'Más partidos' },
  { id: 'recent', label: 'Última final' },
];

const FILTERS = [
  { id: 'champions', label: 'Campeones' },
  { id: 'all', label: 'Todos los finalistas' },
];

// "1956" -> "1955-56"
const seasonOfFinal = (year) => `${year - 1}-${String(year % 100).padStart(2, '0')}`;

const Figure = ({ value, label }) => (
  <div>
    <p className="text-xl font-bold tabular-nums">{value}</p>
    <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
  </div>
);

// Los goleadores que están en los rankings de la app enlazan a su ficha
const Scorer = ({ scorer }) => {
  const player = usePlayerByName()(scorer.name);
  return (
    <li className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <PlayerAvatar player={player || { name: scorer.name }} className="size-9" />
        {player ? (
          <Link href={`/jugadores/${player.id}`} className="truncate font-medium text-foreground no-underline hover:text-accent">
            {scorer.name}
          </Link>
        ) : (
          <span className="truncate font-medium">{scorer.name}</span>
        )}
      </div>
      <span className="shrink-0 text-sm font-semibold tabular-nums text-accent">{scorer.goals} goles</span>
    </li>
  );
};

const TeamCard = ({ team }) => (
  <Card>
    <Card.Header className="flex-row items-center gap-4">
      <ClubLogo name={team.club} className="size-12" />
      <div className="min-w-0 flex-1">
        <Card.Title className="text-lg">{team.club}</Card.Title>
        <p className="text-sm text-muted">
          {team.finals} final{team.finals === 1 ? '' : 'es'} · {team.runnersUp} subcampeonato{team.runnersUp === 1 ? '' : 's'}
        </p>
      </div>
      <Chip color="warning" variant="soft" className="shrink-0 font-bold">
        🏆 {team.titles}
      </Chip>
    </Card.Header>

    <Card.Content className="gap-5">
      {team.stats && (
        <div className="grid grid-cols-3 gap-4 rounded-2xl bg-surface-secondary p-4">
          <Figure value={team.stats.played} label="Partidos" />
          <Figure value={team.stats.won} label="Ganados" />
          <Figure value={team.stats.drawn} label="Empates" />
          <Figure value={team.stats.lost} label="Perdidos" />
          <Figure value={team.stats.goalsFor} label="Goles" />
          <Figure value={(team.stats.goalsFor / team.stats.played).toFixed(2)} label="Goles/partido" />
        </div>
      )}

      {team.topScorers && team.topScorers.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">Máximos goleadores (desde 1992-93)</p>
          <ul className="space-y-3">
            {team.topScorers.map((scorer) => (
              <Scorer key={scorer.name} scorer={scorer} />
            ))}
          </ul>
        </div>
      )}

      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">Finales</p>
        <div className="flex flex-wrap gap-2">
          {[...team.wonYears.map((year) => ({ year, won: true })), ...team.lostYears.map((year) => ({ year, won: false }))]
            .sort((a, b) => a.year - b.year)
            .map(({ year, won }) => (
              <Chip key={year} size="sm" color={won ? 'success' : 'default'} variant={won ? 'soft' : 'secondary'} title={seasonOfFinal(year)}>
                {won ? '🏆 ' : ''}
                {year}
              </Chip>
            ))}
        </div>
      </div>
    </Card.Content>
  </Card>
);

// Alemania Occidental cuenta como Alemania, como hace la UEFA
const nation = (country) => (country === 'Alemania Occidental' ? 'Alemania' : country);

// Títulos y finales por país, con barras (una sola serie: los títulos)
const CountryTitles = ({ finals }) => {
  const byCountry = new Map();
  for (const final of finals) {
    const winner = nation(final.winnerCountry);
    const loser = nation(final.runnerUpCountry);
    if (!byCountry.has(winner)) byCountry.set(winner, { country: winner, titles: 0, runnersUp: 0, clubs: new Set() });
    if (!byCountry.has(loser)) byCountry.set(loser, { country: loser, titles: 0, runnersUp: 0, clubs: new Set() });
    byCountry.get(winner).titles++;
    byCountry.get(winner).clubs.add(final.winner);
    byCountry.get(loser).runnersUp++;
  }
  const rows = [...byCountry.values()].filter((row) => row.titles > 0).sort((a, b) => b.titles - a.titles || b.runnersUp - a.runnersUp);
  const max = rows[0] ? rows[0].titles : 1;
  return (
    <Card className="mb-8">
      <Card.Header>
        <Card.Title>Títulos por país</Card.Title>
        <Card.Description>Copas de Europa ganadas por los clubes de cada país (Alemania incluye Alemania Occidental).</Card.Description>
      </Card.Header>
      <Card.Content>
        <ul className="space-y-2">
          {rows.map((row) => (
            <li key={row.country} className="grid grid-cols-[7rem_minmax(0,1fr)_auto] items-center gap-3 text-sm sm:grid-cols-[9rem_minmax(0,1fr)_auto]">
              <span className="truncate font-medium">{row.country}</span>
              <span className="flex h-3 items-center" title={`${row.titles} títulos de ${row.clubs.size} club${row.clubs.size === 1 ? '' : 'es'}`}>
                <span className="h-full rounded-r bg-accent" style={{ width: `${(row.titles / max) * 100}%` }} />
              </span>
              <span className="w-24 text-right tabular-nums text-muted">
                <span className="font-semibold text-foreground">{row.titles}</span> · {row.clubs.size} club{row.clubs.size === 1 ? '' : 'es'}
              </span>
            </li>
          ))}
        </ul>
      </Card.Content>
    </Card>
  );
};

const TeamsPage = () => {
  useTitle('Equipos');
  const { competition, clubs } = useCompetition();
  const [sort, setSort] = useState('titles');
  const [filter, setFilter] = useState('champions');
  const [page, setPage] = useState(1);

  const teams = useMemo(() => {
    if (!competition) return [];
    return competition.clubs
      .map((club) => ({
        ...club,
        finals: club.titles + club.runnersUp,
        stats: competition.allTime.find((row) => row.club === club.club) || null,
        topScorers: clubs[club.club] && clubs[club.club].topScorers,
      }))
      .filter((team) => filter === 'all' || team.titles > 0)
      .sort(SORTS[sort]);
  }, [competition, clubs, sort, filter]);

  if (!competition) return <PageSkeleton />;

  const { items, pageCount } = paginate(teams, page, TEAMS_PER_PAGE);
  const change = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Equipos"
        description="Los clubes que han llegado a la final de la Copa de Europa y la Champions League: títulos, finales y cifras históricas."
      >
        <div className="flex flex-wrap gap-4">
          <SortSelect label="Mostrar" value={filter} onChange={change(setFilter)} options={FILTERS} />
          <SortSelect label="Ordenar por" value={sort} onChange={change(setSort)} options={SORT_OPTIONS} />
        </div>
      </PageHeader>

      {page === 1 && <CountryTitles finals={competition.finals} />}

      <section className="grid gap-6 md:grid-cols-2">
        {items.map((team) => (
          <TeamCard key={team.club} team={team} />
        ))}
      </section>

      <Pagination page={page} pageCount={pageCount} onChange={setPage} />

      <DataNote>
        <p>
          Títulos, finales y clasificación histórica de{' '}
          <Link href={competition.sources[1] || competition.sources[0]} target="_blank" rel="noopener noreferrer">
            Wikipedia
          </Link>{' '}
          (CC BY-SA), actualizados automáticamente el <strong>{formatDate(competition.updatedAt)}</strong>. Partidos, victorias y
          goles incluyen las rondas previas y solo se muestran para los 25 primeros de la clasificación histórica.
        </p>
        <p>Los máximos goleadores de cada club son datos oficiales de la UEFA desde la temporada 1992-93.</p>
      </DataNote>
    </div>
  );
};

export default TeamsPage;
