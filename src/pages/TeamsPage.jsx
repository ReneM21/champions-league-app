import React, { useState } from 'react';
import { Card, Chip, Link } from '@heroui/react';
import ClubLogo from '../components/ClubLogo';
import Pagination, { paginate } from '../components/Pagination';
import PlayerAvatar from '../components/PlayerAvatar';
import PageHeader from '../components/PageHeader';
import SortSelect from '../components/SortSelect';
import { usePlayerByName } from '../data/PlayersContext';
import { useTitle } from '../utils/useTitle';

const TEAMS = [
  {
    id: 1,
    name: 'Real Madrid',
    titles: 14,
    matches: 480,
    goals: 1053,
    goalsPerMatch: 2.19,
    topScorers: [
      { name: 'Cristiano Ronaldo', goals: 105 },
      { name: 'Karim Benzema', goals: 78 },
      { name: 'Raúl González', goals: 66 }
    ],
    titleYears: ['1956', '1957', '1958', '1959', '1960', '1966', '1998', '2000', '2002', '2014', '2016', '2017', '2018', '2022']
  },
  {
    id: 2,
    name: 'AC Milan',
    titles: 7,
    matches: 362,
    goals: 768,
    goalsPerMatch: 2.12,
    topScorers: [
      { name: 'Andriy Shevchenko', goals: 48 },
      { name: 'Filippo Inzaghi', goals: 41 },
      { name: 'Kaká', goals: 30 }
    ],
    titleYears: ['1963', '1969', '1989', '1990', '1994', '2003', '2007']
  },
  {
    id: 3,
    name: 'Bayern Munich',
    titles: 6,
    matches: 394,
    goals: 842,
    goalsPerMatch: 2.14,
    topScorers: [
      { name: 'Robert Lewandowski', goals: 69 },
      { name: 'Thomas Müller', goals: 52 },
      { name: 'Gerd Müller', goals: 34 }
    ],
    titleYears: ['1974', '1975', '1976', '2001', '2013', '2020']
  },
  {
    id: 4,
    name: 'Liverpool',
    titles: 6,
    matches: 310,
    goals: 650,
    goalsPerMatch: 2.10,
    topScorers: [
      { name: 'Mohamed Salah', goals: 42 },
      { name: 'Steven Gerrard', goals: 30 },
      { name: 'Sadio Mané', goals: 26 }
    ],
    titleYears: ['1977', '1978', '1981', '1984', '2005', '2019']
  },
  {
    id: 5,
    name: 'FC Barcelona',
    titles: 5,
    matches: 358,
    goals: 780,
    goalsPerMatch: 2.18,
    topScorers: [
      { name: 'Lionel Messi', goals: 120 },
      { name: 'Luis Suárez', goals: 20 },
      { name: 'Rivaldo', goals: 16 }
    ],
    titleYears: ['1992', '2006', '2009', '2011', '2015']
  },
  {
    id: 6,
    name: 'Ajax',
    titles: 4,
    matches: 248,
    goals: 520,
    goalsPerMatch: 2.10,
    topScorers: [
      { name: 'Jari Litmanen', goals: 24 },
      { name: 'Sören Lerby', goals: 15 },
      { name: 'Johan Cruyff', goals: 14 }
    ],
    titleYears: ['1971', '1972', '1973', '1995']
  }
];

const SORTS = {
  all: (teams) => teams,
  titles: (teams) => [...teams].sort((a, b) => b.titles - a.titles),
  goals: (teams) => [...teams].sort((a, b) => b.goals - a.goals),
};

const TEAMS_PER_PAGE = 4;

const SORT_OPTIONS = [
  { id: 'all', label: 'Todos los equipos' },
  { id: 'titles', label: 'Más títulos' },
  { id: 'goals', label: 'Más goles' },
];

// Los goleadores que están en la lista principal enlazan a su ficha
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

const Figure = ({ value, label }) => (
  <div>
    <p className="text-xl font-bold tabular-nums">{value}</p>
    <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
  </div>
);

const TeamsPage = () => {
  useTitle('Equipos legendarios');
  const [sort, setSort] = useState('all');
  const [page, setPage] = useState(1);
  const { items, pageCount } = paginate(SORTS[sort](TEAMS), page, TEAMS_PER_PAGE);

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Equipos legendarios"
        description="Los clubes más exitosos de la competición: estadísticas, máximos goleadores y títulos."
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
        {items.map((team) => (
          <Card key={team.id}>
            <Card.Header className="flex-row items-center gap-4">
              <ClubLogo name={team.name} className="size-12" />
              <div className="min-w-0 flex-1">
                <Card.Title className="text-lg">{team.name}</Card.Title>
              </div>
              <Chip color="warning" variant="soft" className="font-bold">
                🏆 {team.titles}
              </Chip>
            </Card.Header>

            <Card.Content className="gap-5">
              <div className="grid grid-cols-3 gap-4 rounded-2xl bg-surface-secondary p-4">
                <Figure value={team.matches} label="Partidos" />
                <Figure value={team.goals} label="Goles" />
                <Figure value={team.goalsPerMatch.toFixed(2)} label="Goles/partido" />
              </div>

              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">Máximos goleadores</p>
                <ul className="space-y-3">
                  {team.topScorers.map((scorer) => (
                    <Scorer key={scorer.name} scorer={scorer} />
                  ))}
                </ul>
              </div>

              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">Títulos</p>
                <div className="flex flex-wrap gap-2">
                  {team.titleYears.map((year) => (
                    <Chip key={year} size="sm" variant="secondary">
                      {year}
                    </Chip>
                  ))}
                </div>
              </div>
            </Card.Content>
          </Card>
        ))}
      </section>

      <Pagination page={page} pageCount={pageCount} onChange={setPage} />
    </div>
  );
};

export default TeamsPage;
