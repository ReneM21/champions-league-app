import React, { useState } from 'react';
import { Card, Link, Table, Tabs } from '@heroui/react';
import ClubLogo from '../components/ClubLogo';
import DataNote from '../components/DataNote';
import PageHeader from '../components/PageHeader';
import PageSkeleton from '../components/PageSkeleton';
import PlayerAvatar from '../components/PlayerAvatar';
import { useCompetition, usePlayerByName } from '../data/PlayersContext';
import { formatDate } from '../utils/stats';
import { useTitle } from '../utils/useTitle';

// Nombre con foto y enlace a la ficha si el jugador está en los rankings de la app
const PersonCell = ({ name }) => {
  const player = usePlayerByName()(name);
  return (
    <div className="flex items-center gap-3">
      <PlayerAvatar player={player || { name }} className="size-9" />
      {player ? (
        <Link href={`/jugadores/${player.id}`} className="font-medium text-foreground no-underline hover:text-accent">
          {name}
        </Link>
      ) : (
        <span className="font-medium">{name}</span>
      )}
    </div>
  );
};

const ClubsCell = ({ clubs, suffix = '' }) => (
  <div className="flex flex-wrap gap-x-4 gap-y-1">
    {clubs.map(({ club, detail }) => (
      <span key={club} className="inline-flex items-center gap-1.5 text-sm text-muted">
        <ClubLogo name={club} className="size-4" />
        <span>
          {club}
          {detail && <span className="tabular-nums"> ({detail}{suffix})</span>}
        </span>
      </span>
    ))}
  </div>
);

// Tabla de un récord: columns = [{ label, cell(row), className, isRowHeader }]
const RecordTable = ({ label, rows, columns }) => (
  <Table>
    <Table.ScrollContainer>
      <Table.Content aria-label={label} className="min-w-[640px]">
        <Table.Header>
          {columns.map((column) => (
            <Table.Column key={column.label} isRowHeader={column.isRowHeader} className={column.className}>
              {column.label}
            </Table.Column>
          ))}
        </Table.Header>
        <Table.Body>
          {rows.map((row, index) => (
            <Table.Row key={index} id={String(index)}>
              {columns.map((column) => (
                <Table.Cell key={column.label} className={column.className}>
                  {column.cell(row)}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Content>
    </Table.ScrollContainer>
  </Table>
);

const number = (value, className = 'text-base font-bold tabular-nums text-accent') => <span className={className}>{value}</span>;
const rank = { label: '#', className: 'w-12 font-semibold tabular-nums text-muted', cell: (row) => row.rank };

const SECTIONS = [
  {
    id: 'titulos',
    tab: 'Más títulos',
    title: 'Jugadores con más Copas de Europa',
    description: 'Títulos ganados como jugador (cuenta haber formado parte de la plantilla campeona).',
    rows: (records) => records.mostTitles,
    columns: [
      { label: 'Jugador', isRowHeader: true, cell: (row) => <PersonCell name={row.player} /> },
      { label: 'Títulos', className: 'text-right', cell: (row) => number(row.titles) },
      { label: 'Clubes (años)', cell: (row) => <ClubsCell clubs={row.clubs} /> },
    ],
  },
  {
    id: 'partidos',
    tab: 'Más partidos',
    title: 'Jugadores con más partidos',
    description: 'Partidos jugados en la Copa de Europa y la Champions League, incluidas las rondas previas.',
    rows: (records) => records.appearances,
    columns: [
      rank,
      { label: 'Jugador', isRowHeader: true, cell: (row) => <PersonCell name={row.player} /> },
      { label: 'Partidos', className: 'text-right', cell: (row) => number(row.apps) },
      { label: 'Años', className: 'whitespace-nowrap tabular-nums text-muted', cell: (row) => row.years },
      { label: 'Clubes (partidos)', cell: (row) => <ClubsCell clubs={row.clubs} /> },
    ],
  },
  {
    id: 'goles-temporada',
    tab: 'Goles en una temporada',
    title: 'Más goles en una sola temporada',
    rows: (records) => records.seasonGoals,
    columns: [
      rank,
      { label: 'Jugador', isRowHeader: true, cell: (row) => <PersonCell name={row.player} /> },
      { label: 'Temporada', className: 'tabular-nums text-muted', cell: (row) => row.season },
      { label: 'Goles', className: 'text-right', cell: (row) => number(row.goals) },
    ],
  },
  {
    id: 'asistencias-temporada',
    tab: 'Asistencias en una temporada',
    title: 'Más asistencias en una sola temporada',
    description: 'Desde la temporada 1992-93.',
    rows: (records) => records.seasonAssists,
    columns: [
      rank,
      { label: 'Jugador', isRowHeader: true, cell: (row) => <PersonCell name={row.player} /> },
      { label: 'Temporada', className: 'tabular-nums text-muted', cell: (row) => row.season },
      { label: 'Asistencias', className: 'text-right', cell: (row) => number(row.assists) },
    ],
  },
  {
    id: 'entrenadores',
    tab: 'Entrenadores',
    title: 'Entrenadores con más partidos',
    rows: (records) => records.managers,
    columns: [
      rank,
      { label: 'Entrenador', isRowHeader: true, cell: (row) => <span className="font-medium">{row.manager}</span> },
      { label: 'Nación', className: 'text-muted', cell: (row) => row.nation },
      { label: 'Partidos', className: 'text-right', cell: (row) => number(row.matches) },
      { label: 'Años', className: 'whitespace-nowrap tabular-nums text-muted', cell: (row) => row.years },
      { label: 'Clubes (partidos)', cell: (row) => <ClubsCell clubs={row.clubs} /> },
    ],
  },
];

const RecordsPage = () => {
  useTitle('Récords');
  const { competition } = useCompetition();
  const [selected, setSelected] = useState(SECTIONS[0].id);
  if (!competition) return <PageSkeleton />;
  const section = SECTIONS.find((s) => s.id === selected) || SECTIONS[0];
  const { records } = competition;

  return (
    <div>
      <PageHeader title="Récords" description="Los récords individuales de la Copa de Europa y la Champions League: títulos, partidos, goles y asistencias en una temporada y entrenadores." />

      {!records ? (
        <Card>
          <Card.Content className="p-8 text-center text-muted">Los récords se cargarán en la próxima actualización automática de los datos.</Card.Content>
        </Card>
      ) : (
        <>
          {/* Solo la lista de pestañas va dentro de Tabs: sus paneles se pintan en
              una segunda pasada y la tabla aparecía un instante después (parpadeo) */}
          <Tabs selectedKey={selected} onSelectionChange={(key) => setSelected(String(key))}>
            <Tabs.ListContainer className="mb-6 overflow-x-auto">
              <Tabs.List aria-label="Récords">
                {SECTIONS.map((s) => (
                  <Tabs.Tab key={s.id} id={s.id} className="whitespace-nowrap">
                    {s.tab}
                    {/* Sin deslizamiento: al moverse tapaba el texto de las otras pestañas */}
                    <Tabs.Indicator className="transition-none" />
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs.ListContainer>
          </Tabs>
          <section aria-labelledby="record-title">
            <h2 id="record-title" className="text-xl font-bold tracking-tight">{section.title}</h2>
            {section.description && <p className="mb-4 mt-1 text-sm text-muted">{section.description}</p>}
            <div className={section.description ? '' : 'mt-4'}>
              <RecordTable key={section.id} label={section.title} rows={section.rows(records)} columns={section.columns} />
            </div>
          </section>
        </>
      )}

      <DataNote>
        <p>
          Récords de{' '}
          <Link href={competition.sources[1] || competition.sources[0]} target="_blank" rel="noopener noreferrer">
            Wikipedia
          </Link>{' '}
          (CC BY-SA), actualizados automáticamente el <strong>{formatDate(competition.updatedAt)}</strong>.
        </p>
      </DataNote>
    </div>
  );
};

export default RecordsPage;
