import React from 'react';
import { Link } from '@heroui/react';
import DataNote from '../components/DataNote';
import PageHeader from '../components/PageHeader';
import QuickFacts from '../components/QuickFacts';
import Podium from '../components/Podium';
import RankingTable from '../components/RankingTable';
import { usePlayers } from '../data/PlayersContext';
import { formatDate } from '../utils/stats';
import { useTitle } from '../utils/useTitle';

const self = (player) => player;

const HomePage = () => {
  const { players, updatedAt, source } = usePlayers();
  const updatedLabel = formatDate(updatedAt);
  useTitle('Máximos goleadores');

  return (
    <div>
      <PageHeader
        title="Máximos goleadores"
        description="Los jugadores con más goles en la historia de la UEFA Champions League."
      />

      <QuickFacts />

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
              (CC BY-SA). El desglose por equipo y por temporada son datos oficiales de la UEFA.
            </>
          ) : (
            'El ranking todavía no se ha actualizado automáticamente.'
          )}
        </p>
        <p>
          Las fotos de los jugadores sin ficha propia vienen de Wikimedia Commons; el autor y la licencia aparecen al
          pasar el ratón por encima. Los campos marcados con "-" no tienen datos disponibles. "En activo" señala a los
          jugadores que han jugado la Champions esta temporada.
        </p>
      </DataNote>
    </div>
  );
};

export default HomePage;
