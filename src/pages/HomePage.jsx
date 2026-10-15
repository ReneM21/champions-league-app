import React from 'react';
import { Link } from '@heroui/react';
import DataNote from '../components/DataNote';
import RankingTable from '../components/RankingTable';
import { usePlayers } from '../data/PlayersContext';
import { formatDate } from '../utils/stats';

const HomePage = () => {
  const { players, updatedAt, source } = usePlayers();
  const updatedLabel = formatDate(updatedAt);

  return (
    <div className="p-4 md:p-8 animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-champions-blue mb-2 champions-title inline-block">
          Máximos Goleadores de la UEFA Champions League
        </h2>
        <p className="text-gray-600 mb-4">Descubre los mejores goleadores en la historia de la competición</p>
        <div className="w-24 h-1 bg-linear-to-r from-champions-blue to-champions-gold mx-auto"></div>
      </div>

      <RankingTable
        ariaLabel="Máximos goleadores"
        players={players}
        stat="goals"
        statLabel="Goles"
        profileOf={(player) => player}
        actions={(player) => (
          <div className="flex gap-3">
            <Link href={`/jugadores/${player.id}`} className="text-champions-blue">Perfil</Link>
            <Link href={`/jugadores/${player.id}/equipos`} className="text-green-700">Equipos</Link>
            <Link href={`/jugadores/${player.id}/temporadas`} className="text-purple-700">Temporadas</Link>
          </div>
        )}
      />

      <DataNote>
        <p>
          La información mostrada incluye los máximos goleadores históricos de la UEFA Champions League.
          Para ver estadísticas detalladas de cada jugador, incluyendo temporadas, equipos y rendimiento,
          utilice los enlaces de la tabla.
        </p>
        <p>
          {updatedLabel ? (
            <>
              Ranking actualizado automáticamente el <strong>{updatedLabel}</strong> con datos de{' '}
              <Link href={source} target="_blank" rel="noopener noreferrer">
                Wikipedia
              </Link>{' '}
              (CC BY-SA). Las biografías y el desglose por temporada se mantienen a mano. Las fotos de los jugadores sin
              ficha propia vienen de Wikimedia Commons; el autor y la licencia aparecen al pasar el ratón por encima.
            </>
          ) : (
            'El ranking todavía no se ha actualizado automáticamente.'
          )}
        </p>
        <p>
          Los campos marcados con "-" indican que la información no está disponible actualmente.
        </p>
      </DataNote>
    </div>
  );
};

export default HomePage;
