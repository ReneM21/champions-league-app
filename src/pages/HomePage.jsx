import React from 'react';
import { Link } from '@heroui/react';
import DataNote from '../components/DataNote';
import PageHeader from '../components/PageHeader';
import Podium from '../components/Podium';
import RankingTable from '../components/RankingTable';
import { usePlayers } from '../data/PlayersContext';
import { formatDate } from '../utils/stats';

const self = (player) => player;

const HomePage = () => {
  const { players, updatedAt, source } = usePlayers();
  const updatedLabel = formatDate(updatedAt);

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Máximos goleadores"
        description="Los jugadores con más goles en la historia de la UEFA Champions League."
      />

      <Podium players={players} stat="goals" statLabel="goles" profileOf={self} />

      <RankingTable
        ariaLabel="Máximos goleadores"
        players={players}
        stat="goals"
        statLabel="Goles"
        profileOf={self}
        actions={(player) => (
          <div className="flex justify-end gap-3 text-sm">
            <Link href={`/jugadores/${player.id}/equipos`}>Equipos</Link>
            <Link href={`/jugadores/${player.id}/temporadas`}>Temporadas</Link>
          </div>
        )}
      />

      <DataNote>
        <p>
          {updatedLabel ? (
            <>
              Ranking actualizado automáticamente el <strong>{updatedLabel}</strong> con datos de{' '}
              <Link href={source} target="_blank" rel="noopener noreferrer">
                Wikipedia
              </Link>{' '}
              (CC BY-SA). Las biografías y el desglose por temporada se mantienen a mano.
            </>
          ) : (
            'El ranking todavía no se ha actualizado automáticamente.'
          )}
        </p>
        <p>
          Las fotos de los jugadores sin ficha propia vienen de Wikimedia Commons; el autor y la licencia aparecen al
          pasar el ratón por encima. Los campos marcados con "-" no tienen datos disponibles.
        </p>
      </DataNote>
    </div>
  );
};

export default HomePage;
