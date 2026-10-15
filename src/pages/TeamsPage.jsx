import React, { useState } from 'react';
import { Card, Chip, Link } from '@heroui/react';
import Pagination, { paginate } from '../components/Pagination';
import PlayerAvatar from '../components/PlayerAvatar';
import SortSelect from '../components/SortSelect';
import { usePlayerByName } from '../data/PlayersContext';

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

const initials = (name) =>
  name
    .split(' ')
    .filter((word) => word.length > 2)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const SORT_OPTIONS = [
  { id: 'all', label: 'Todos los equipos' },
  { id: 'titles', label: 'Más títulos' },
  { id: 'goals', label: 'Más goles' },
];

// Los goleadores que están en la lista principal enlazan a su ficha
const Scorer = ({ scorer }) => {
  const player = usePlayerByName()(scorer.name);
  return (
    <li className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <PlayerAvatar player={player || { name: scorer.name }} className="size-10" />
        {player ? (
          <Link href={`/jugadores/${player.id}`} className="font-medium text-foreground no-underline hover:text-champions-blue">
            {scorer.name}
          </Link>
        ) : (
          <span className="font-medium">{scorer.name}</span>
        )}
      </div>
      <span className="text-champions-blue font-bold">{scorer.goals} goles</span>
    </li>
  );
};

const TeamsPage = () => {
  const [sort, setSort] = useState('all');
  const [page, setPage] = useState(1);
  const { items, pageCount } = paginate(SORTS[sort](TEAMS), page, TEAMS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      <section className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-champions-blue mb-4">Equipos Legendarios de la Champions</h2>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Descubre los equipos más exitosos en la historia de la UEFA Champions League, sus estadísticas, goleadores y títulos.
        </p>
      </section>

      <section className="mb-8">
        <SortSelect
          label="Ordenar por"
          value={sort}
          onChange={(value) => {
            setSort(value);
            setPage(1);
          }}
          options={SORT_OPTIONS}
        />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {items.map((team) => (
          <Card key={team.id} className="p-0 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <Card.Header className="bg-champions-blue text-white p-4 flex-row items-center">
              <div className="bg-white text-champions-blue rounded-full h-16 w-16 flex items-center justify-center mr-4 text-xl font-bold">
                {initials(team.name)}
              </div>
              <h3 className="text-xl font-bold">{team.name}</h3>
              <div className="ml-auto flex flex-col items-center">
                <span className="text-3xl font-bold">{team.titles}</span>
                <span className="text-sm text-blue-200">Títulos</span>
              </div>
            </Card.Header>

            <div className="grid grid-cols-3 p-4 text-center border-b border-gray-200">
              <div className="p-2">
                <span className="block text-xl font-bold text-champions-blue">{team.matches}</span>
                <span className="block text-sm text-gray-500">Partidos</span>
              </div>
              <div className="p-2 border-l border-r border-gray-200">
                <span className="block text-xl font-bold text-champions-blue">{team.goals}</span>
                <span className="block text-sm text-gray-500">Goles</span>
              </div>
              <div className="p-2">
                <span className="block text-xl font-bold text-champions-blue">{team.goalsPerMatch.toFixed(2)}</span>
                <span className="block text-sm text-gray-500">Goles/partido</span>
              </div>
            </div>

            <div className="p-4 border-b border-gray-200">
              <h4 className="font-bold text-champions-blue mb-2">Máximos Goleadores</h4>
              <ul className="space-y-3">
                {team.topScorers.map((scorer) => (
                  <Scorer key={scorer.name} scorer={scorer} />
                ))}
              </ul>
            </div>

            <div className="p-4">
              <h4 className="font-bold text-champions-blue mb-2">Títulos de Champions League</h4>
              <div className="flex flex-wrap gap-2">
                {team.titleYears.map((year) => (
                  <Chip key={year} color="accent" variant="soft">
                    {year}
                  </Chip>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </section>

      <Pagination page={page} pageCount={pageCount} onChange={setPage} />
    </div>
  );
};

export default TeamsPage;
