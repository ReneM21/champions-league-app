import React from 'react';
import { Card, Link } from '@heroui/react';
import DataNote from '../components/DataNote';
import PageHeader from '../components/PageHeader';
import PlayerTabLinks from '../components/PlayerTabLinks';
import Podium from '../components/Podium';
import RankingTable from '../components/RankingTable';
import { usePlayers } from '../data/PlayersContext';
import { formatDate } from '../utils/stats';
import { useTitle } from '../utils/useTitle';

// Las fichas abiertas desde aquí destacan las asistencias
const QUERY = '?ranking=asistencias';

const AssistsPage = () => {
  const { assists } = usePlayers();
  const { players, updatedAt, source } = assists;
  const updatedLabel = formatDate(updatedAt);
  useTitle('Máximos asistidores');

  // Todos los asistidores tienen ficha (manual o automática)
  const profileOf = (player) => player;

  return (
    <div>
      <PageHeader
        title="Máximos asistidores"
        description="Los jugadores que más goles han dado a sus compañeros en la historia de la competición."
      />

      {players.length === 0 ? (
        <Card>
          <Card.Content className="p-8 text-center text-muted">
            El ranking de asistencias todavía no está disponible. Se cargará en la próxima actualización automática de los datos.
          </Card.Content>
        </Card>
      ) : (
        <>
          <Podium players={players} stat="assists" statLabel="asistencias" profileOf={profileOf} linkQuery={QUERY} />
          <RankingTable
            ariaLabel="Máximos asistidores"
            players={players}
            stat="assists"
            statLabel="Asistencias"
            profileOf={profileOf}
            linkQuery={QUERY}
            actions={(player) => <PlayerTabLinks playerId={player.id} query={QUERY} />}
          />
        </>
      )}

      <DataNote>
        <p>
          {updatedLabel ? (
            <>
              Ranking actualizado automáticamente el <strong>{updatedLabel}</strong> con datos de{' '}
              <Link href={source} target="_blank" rel="noopener noreferrer">
                Wikipedia
              </Link>{' '}
              (CC BY-SA).
            </>
          ) : (
            'El ranking de asistencias todavía no se ha actualizado automáticamente.'
          )}
        </p>
        <p>
          Las asistencias por equipo y por temporada son datos oficiales de la UEFA, que las registra desde la temporada
          2001-02: en las anteriores aparecen como "-", por eso su suma puede ser menor que el total del ranking.
        </p>
        <p>
          Las fichas de los jugadores sin ficha propia se crean automáticamente con su biografía de la Wikipedia en
          español y sus datos de Wikidata.
        </p>
      </DataNote>
    </div>
  );
};

export default AssistsPage;
