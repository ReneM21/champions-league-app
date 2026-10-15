import React from 'react';
import { Card, Link } from '@heroui/react';
import DataNote from '../components/DataNote';
import RankingTable from '../components/RankingTable';
import { usePlayers } from '../data/PlayersContext';
import { formatDate } from '../utils/stats';

const AssistsPage = () => {
  const { players: scorers, assists } = usePlayers();
  const { players, updatedAt, source } = assists;
  const updatedLabel = formatDate(updatedAt);

  return (
    <div className="p-4 md:p-8 animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-champions-blue mb-2 champions-title inline-block">
          Máximos Asistidores de la UEFA Champions League
        </h2>
        <p className="text-gray-600 mb-4">Los jugadores que más goles han dado a sus compañeros en la historia de la competición</p>
        <div className="w-24 h-1 bg-linear-to-r from-champions-blue to-champions-gold mx-auto"></div>
      </div>

      {players.length === 0 ? (
        <Card className="max-w-xl mx-auto text-center">
          <Card.Content className="p-6 text-gray-700">
            El ranking de asistencias todavía no está disponible. Se cargará en la próxima actualización automática de los datos.
          </Card.Content>
        </Card>
      ) : (
        <RankingTable
          ariaLabel="Máximos asistidores"
          players={players}
          stat="assists"
          statLabel="Asistencias"
          // Si también está entre los goleadores, se usa su foto y se enlaza a su ficha
          profileOf={(player) => scorers.find((scorer) => scorer.id === player.id) || null}
        />
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
          Los jugadores que también están entre los máximos goleadores enlazan a su ficha. Las fotos de Wikimedia Commons
          muestran su autor y licencia al pasar el ratón por encima.
        </p>
      </DataNote>
    </div>
  );
};

export default AssistsPage;
