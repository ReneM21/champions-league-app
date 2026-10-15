import React, { useState } from 'react';
import { Card, Chip, Link } from '@heroui/react';
import ClubLogo from '../components/ClubLogo';
import Pagination, { paginate } from '../components/Pagination';
import PlayerAvatar from '../components/PlayerAvatar';
import PageHeader from '../components/PageHeader';
import SortSelect from '../components/SortSelect';
import { usePlayerByName } from '../data/PlayersContext';
import { useTitle } from '../utils/useTitle';

const SEASONS = [
  {
    id: 1,
    year: '2021-2022',
    winner: 'Real Madrid',
    topScorer: { name: 'Karim Benzema', team: 'Real Madrid', goals: 15 },
    finalScore: '1-0',
    finalTeams: ['Real Madrid', 'Liverpool'],
    finalVenue: 'Stade de France, Paris',
    totalGoals: 380,
    matches: 125,
    teams: 32
  },
  {
    id: 2,
    year: '2020-2021',
    winner: 'Chelsea',
    topScorer: { name: 'Erling Haaland', team: 'Borussia Dortmund', goals: 10 },
    finalScore: '1-0',
    finalTeams: ['Chelsea', 'Manchester City'],
    finalVenue: 'Estádio do Dragão, Porto',
    totalGoals: 366,
    matches: 119,
    teams: 32
  },
  {
    id: 3,
    year: '2019-2020',
    winner: 'Bayern Munich',
    topScorer: { name: 'Robert Lewandowski', team: 'Bayern Munich', goals: 15 },
    finalScore: '1-0',
    finalTeams: ['Bayern Munich', 'Paris Saint-Germain'],
    finalVenue: 'Estádio da Luz, Lisboa',
    totalGoals: 386,
    matches: 119,
    teams: 32
  },
  {
    id: 4,
    year: '2018-2019',
    winner: 'Liverpool',
    topScorer: { name: 'Lionel Messi', team: 'Barcelona', goals: 12 },
    finalScore: '2-0',
    finalTeams: ['Liverpool', 'Tottenham Hotspur'],
    finalVenue: 'Wanda Metropolitano, Madrid',
    totalGoals: 366,
    matches: 119,
    teams: 32
  },
  {
    id: 5,
    year: '2017-2018',
    winner: 'Real Madrid',
    topScorer: { name: 'Cristiano Ronaldo', team: 'Real Madrid', goals: 15 },
    finalScore: '3-1',
    finalTeams: ['Real Madrid', 'Liverpool'],
    finalVenue: 'NSC Olimpiyskiy Stadium, Kiev',
    totalGoals: 401,
    matches: 125,
    teams: 32
  },
  {
    id: 6,
    year: '2016-2017',
    winner: 'Real Madrid',
    topScorer: { name: 'Cristiano Ronaldo', team: 'Real Madrid', goals: 12 },
    finalScore: '4-1',
    finalTeams: ['Real Madrid', 'Juventus'],
    finalVenue: 'Millennium Stadium, Cardiff',
    totalGoals: 380,
    matches: 125,
    teams: 32
  }
];

const startYear = (season) => parseInt(season.year.split('-')[0], 10);

const SORTS = {
  all: (seasons) => seasons,
  recent: (seasons) => [...seasons].sort((a, b) => startYear(b) - startYear(a)),
  oldest: (seasons) => [...seasons].sort((a, b) => startYear(a) - startYear(b)),
  mostGoals: (seasons) => [...seasons].sort((a, b) => b.totalGoals - a.totalGoals),
};

const SEASONS_PER_PAGE = 4;

const SORT_OPTIONS = [
  { id: 'all', label: 'Sin ordenar' },
  { id: 'recent', label: 'Más recientes' },
  { id: 'oldest', label: 'Más antiguas' },
  { id: 'mostGoals', label: 'Más goles' },
];

const Figure = ({ value, label }) => (
  <div>
    <p className="text-xl font-bold tabular-nums">{value}</p>
    <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
  </div>
);

const SeasonsPage = () => {
  useTitle('Temporadas históricas');
  const [sort, setSort] = useState('all');
  const [page, setPage] = useState(1);
  const findPlayer = usePlayerByName();
  const { items, pageCount } = paginate(SORTS[sort](SEASONS), page, SEASONS_PER_PAGE);

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Temporadas históricas"
        description="Cada edición de la competición: campeón, final, cifras y máximo goleador."
      >
        <SortSelect
          label="Ordenar por"
          value={sort}
          onChange={(value) => {
            setSort(value);
            setPage(1);
          }}
          options={SORT_OPTIONS}
        />
      </PageHeader>

      <section className="grid gap-6 md:grid-cols-2">
        {items.map((season) => {
          const scorer = findPlayer(season.topScorer.name);

          return (
            <Card key={season.id} className="overflow-hidden p-0">
              <div className="champions-hero flex items-end justify-between gap-4 p-6 text-white">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-white/70">Temporada</p>
                  <h2 className="text-2xl font-bold">{season.year}</h2>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium uppercase tracking-wide text-white/70">Campeón</p>
                  <p className="flex items-center justify-end gap-2 font-semibold text-champions-gold">
                    <ClubLogo name={season.winner} className="size-6 rounded-full bg-white p-0.5" />
                    {season.winner}
                  </p>
                </div>
              </div>

              <Card.Content className="gap-5 p-6">
                <div>
                  <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">Final · {season.finalVenue}</p>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex flex-1 items-center gap-2 font-medium">
                      <ClubLogo name={season.finalTeams[0]} className="size-7" />
                      {season.finalTeams[0]}
                    </span>
                    <Chip color="accent" size="lg" className="font-bold tabular-nums">
                      {season.finalScore}
                    </Chip>
                    <span className="flex flex-1 items-center justify-end gap-2 text-right font-medium">
                      {season.finalTeams[1]}
                      <ClubLogo name={season.finalTeams[1]} className="size-7" />
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 rounded-2xl bg-surface-secondary p-4">
                  <Figure value={season.totalGoals} label="Goles" />
                  <Figure value={season.matches} label="Partidos" />
                  <Figure value={season.teams} label="Equipos" />
                </div>

                <div>
                  <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">Máximo goleador</p>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <PlayerAvatar player={scorer || { name: season.topScorer.name }} className="size-10" />
                      <div className="min-w-0">
                        {scorer ? (
                          <Link href={`/jugadores/${scorer.id}`} className="block truncate font-medium text-foreground no-underline hover:text-accent">
                            {season.topScorer.name}
                          </Link>
                        ) : (
                          <p className="truncate font-medium">{season.topScorer.name}</p>
                        )}
                        <p className="flex items-center gap-1.5 truncate text-sm text-muted">
                          <ClubLogo name={season.topScorer.team} className="size-4" />
                          {season.topScorer.team}
                        </p>
                      </div>
                    </div>
                    <p className="shrink-0 text-2xl font-bold tabular-nums text-accent">{season.topScorer.goals}</p>
                  </div>
                </div>
              </Card.Content>
            </Card>
          );
        })}
      </section>

      <Pagination page={page} pageCount={pageCount} onChange={setPage} />
    </div>
  );
};

export default SeasonsPage;
