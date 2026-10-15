import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, Chip, Link } from '@heroui/react';
import ClubLogo from '../components/ClubLogo';
import CurrentSeason from '../components/CurrentSeason';
import DataNote from '../components/DataNote';
import Pagination, { paginate } from '../components/Pagination';
import PlayerAvatar from '../components/PlayerAvatar';
import PageHeader from '../components/PageHeader';
import PageSkeleton from '../components/PageSkeleton';
import SortSelect from '../components/SortSelect';
import { useCompetition, usePlayerByName } from '../data/PlayersContext';
import { formatDate } from '../utils/stats';
import { useTitle } from '../utils/useTitle';

const SEASONS_PER_PAGE = 8;

const SORT_OPTIONS = [
  { id: 'recent', label: 'Más recientes' },
  { id: 'oldest', label: 'Más antiguas' },
  { id: 'goals', label: 'Más goles del máximo goleador' },
];

const ERAS = [
  { id: 'all', label: 'Todas las épocas' },
  { id: 'champions', label: 'Champions League (desde 1992-93)' },
  { id: 'european-cup', label: 'Copa de Europa (1955-56 a 1991-92)' },
];

const isChampionsEra = (season) => season.season >= '1992-93';

// Una temporada: la final (de Wikipedia) y sus máximos goleadores y asistentes
const toSeason = (final, topScorers, leaders) => ({
  ...final,
  topScorers: (topScorers.find((s) => s.season === final.season) || { players: [] }).players,
  topAssists: (leaders[final.season] && leaders[final.season].topAssists) || [],
});

const finalNote = (season) =>
  [season.extraTime && 'tras la prórroga', season.penalties && 'en los penaltis', season.replay && `en el partido de desempate (el primero acabó ${season.firstScore})`]
    .filter(Boolean)
    .join(', ');

// Jugador con enlace a su ficha si está en los rankings de la app
const Leader = ({ player, value, label }) => {
  const found = usePlayerByName()(player.name);
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <PlayerAvatar player={found || { name: player.name }} className="size-9" />
        <div className="min-w-0">
          {found ? (
            <Link href={`/jugadores/${found.id}`} className="block truncate font-medium text-foreground no-underline hover:text-accent">
              {player.name}
            </Link>
          ) : (
            <p className="truncate font-medium">{player.name}</p>
          )}
          <p className="flex items-center gap-1.5 truncate text-sm text-muted">
            <ClubLogo name={player.club} className="size-4" />
            {player.club}
          </p>
        </div>
      </div>
      <p className="shrink-0 text-right">
        <span className="text-xl font-bold tabular-nums text-accent">{value}</span>
        <span className="ml-1 text-xs text-muted">{label}</span>
      </p>
    </div>
  );
};

const SeasonCard = ({ season }) => {
  const note = finalNote(season);
  return (
    <Card className="overflow-hidden p-0">
      <div className="champions-hero flex items-end justify-between gap-4 p-5 text-white">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-white/70">{isChampionsEra(season) ? 'Champions League' : 'Copa de Europa'}</p>
          <h2 className="text-2xl font-bold">{season.season}</h2>
        </div>
        <div className="min-w-0 text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-white/70">Campeón</p>
          <p className="flex items-center justify-end gap-2 font-semibold text-champions-gold">
            <ClubLogo name={season.winner} className="size-6 rounded-full bg-white p-0.5" />
            <span className="truncate">{season.winner}</span>
          </p>
        </div>
      </div>

      <Card.Content className="gap-5 p-5">
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">Final · {season.venue}</p>
          <div className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 flex-1 items-center gap-2 font-medium">
              <ClubLogo name={season.winner} className="size-7" />
              <span className="truncate">{season.winner}</span>
            </span>
            <Chip color="accent" size="lg" className="shrink-0 font-bold tabular-nums">
              {season.score}
            </Chip>
            <span className="flex min-w-0 flex-1 items-center justify-end gap-2 text-right font-medium">
              <span className="truncate">{season.runnerUp}</span>
              <ClubLogo name={season.runnerUp} className="size-7" />
            </span>
          </div>
          <p className="mt-2 text-xs text-muted">
            {[note && `Ganó ${note}`, season.attendance && `${season.attendance.toLocaleString('es-ES')} espectadores`].filter(Boolean).join(' · ')}
          </p>
        </div>

        {season.topScorers.length > 0 && (
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
              {season.topScorers.length > 1 ? 'Máximos goleadores' : 'Máximo goleador'}
            </p>
            <div className="space-y-3">
              {season.topScorers.map((player) => (
                <Leader key={player.name} player={player} value={player.goals} label="goles" />
              ))}
            </div>
          </div>
        )}

        {season.topAssists.length > 0 && (
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
              {season.topAssists.length > 1 ? 'Máximos asistentes' : 'Máximo asistente'} (UEFA)
            </p>
            <div className="space-y-3">
              {season.topAssists.slice(0, 3).map((player) => (
                <Leader key={player.name} player={player} value={player.assists} label="asist." />
              ))}
              {season.topAssists.length > 3 && (
                <p className="text-xs text-muted" title={season.topAssists.slice(3).map((p) => p.name).join(', ')}>
                  y {season.topAssists.length - 3} más con {season.topAssists[0].assists} asistencias:{' '}
                  {season.topAssists
                    .slice(3)
                    .map((p) => p.name)
                    .join(', ')}
                </p>
              )}
            </div>
          </div>
        )}
      </Card.Content>
    </Card>
  );
};

const SeasonsPage = () => {
  useTitle('Temporadas históricas');
  const { competition, seasonLeaders } = useCompetition();
  const [sort, setSort] = useState('recent');
  const [era, setEra] = useState('all');
  const [page, setPage] = useState(1);
  // El club va en la URL (?club=...) para enlazarlo desde la página Equipos
  const [params, setParams] = useSearchParams();
  const club = params.get('club') || 'all';
  const setClub = (value) => setParams(value === 'all' ? {} : { club: value }, { replace: true });

  const seasons = useMemo(() => {
    if (!competition) return [];
    const all = competition.finals.map((final) => toSeason(final, competition.topScorers || [], seasonLeaders));
    const filtered = all.filter(
      (s) => (era === 'all' || (era === 'champions') === isChampionsEra(s)) && (club === 'all' || s.winner === club || s.runnerUp === club)
    );
    const topGoals = (s) => (s.topScorers[0] ? s.topScorers[0].goals : 0);
    if (sort === 'oldest') return filtered;
    if (sort === 'goals') return [...filtered].sort((a, b) => topGoals(b) - topGoals(a) || b.season.localeCompare(a.season));
    return [...filtered].reverse();
  }, [competition, seasonLeaders, sort, era, club]);

  const clubOptions = useMemo(() => {
    if (!competition) return [];
    const names = [...new Set(competition.finals.flatMap((f) => [f.winner, f.runnerUp]))].sort((a, b) => a.localeCompare(b, 'es'));
    return [{ id: 'all', label: 'Todos los clubes' }, ...names.map((name) => ({ id: name, label: name }))];
  }, [competition]);

  if (!competition) return <PageSkeleton />;

  const { items, pageCount } = paginate(seasons, page, SEASONS_PER_PAGE);
  const change = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div>
      <PageHeader title="Temporadas históricas" description="Todas las ediciones desde 1955-56: la final, el campeón y los máximos goleadores.">
        <div className="flex flex-wrap gap-4">
          <SortSelect label="Club" value={club} onChange={change(setClub)} options={clubOptions} />
          <SortSelect label="Época" value={era} onChange={change(setEra)} options={ERAS} />
          <SortSelect label="Ordenar por" value={sort} onChange={change(setSort)} options={SORT_OPTIONS} />
        </div>
      </PageHeader>

      {club !== 'all' && (
        <p className="mb-4 text-sm text-muted">
          {seasons.length} final{seasons.length === 1 ? '' : 'es'} de {club}:{' '}
          {seasons.filter((s) => s.winner === club).length} ganada{seasons.filter((s) => s.winner === club).length === 1 ? '' : 's'}.
        </p>
      )}

      {club === 'all' && page === 1 && <CurrentSeason />}

      <section className="grid gap-6 md:grid-cols-2">
        {items.map((season) => (
          <SeasonCard key={season.season} season={season} />
        ))}
      </section>

      <Pagination page={page} pageCount={pageCount} onChange={setPage} />

      <DataNote>
        <p>
          Finales y máximos goleadores de{' '}
          <Link href={competition.sources[0]} target="_blank" rel="noopener noreferrer">
            Wikipedia
          </Link>{' '}
          (CC BY-SA), actualizados automáticamente el <strong>{formatDate(competition.updatedAt)}</strong>. Los máximos asistentes
          son datos oficiales de la UEFA, que registra las asistencias desde 2001-02.
        </p>
      </DataNote>
    </div>
  );
};

export default SeasonsPage;
