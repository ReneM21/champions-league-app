import React from 'react';
import { Link } from 'react-router-dom';
import PlayerAvatar from '../components/PlayerAvatar';
import { usePlayers } from '../data/PlayersContext';
import { formatDate, formatValue } from '../utils/stats';

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
        <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center champions-card">
          <p className="text-gray-700">
            El ranking de asistencias todavía no está disponible. Se cargará en la próxima actualización automática de los datos.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden bg-white rounded-lg shadow-lg champions-card decorated-section">
          <div className="overflow-auto">
            <table className="min-w-full champions-table">
              <thead>
                <tr>
                  <th scope="col" className="text-xs uppercase tracking-wider">Posición</th>
                  <th scope="col" className="text-xs uppercase tracking-wider">Jugador</th>
                  <th scope="col" className="text-xs uppercase tracking-wider">Nacionalidad</th>
                  <th scope="col" className="text-xs uppercase tracking-wider">Asistencias</th>
                  <th scope="col" className="text-xs uppercase tracking-wider">Partidos</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => {
                  // Si también está entre los goleadores, se usa su foto y se enlaza a su ficha
                  const profile = scorers.find((scorer) => scorer.id === player.id);
                  const content = (
                    <>
                      <PlayerAvatar player={profile || player} />
                      <span className={`ml-4 text-sm font-medium text-gray-900 ${profile ? 'group-hover:text-champions-blue' : ''}`}>
                        {profile ? profile.name : player.name}
                      </span>
                    </>
                  );

                  return (
                    <tr key={player.id}>
                      <td className="whitespace-nowrap text-sm font-medium text-gray-900">{player.position}</td>
                      <td className="whitespace-nowrap">
                        {profile ? (
                          <Link to={`/jugadores/${profile.id}`} className="flex items-center group">{content}</Link>
                        ) : (
                          <div className="flex items-center">{content}</div>
                        )}
                      </td>
                      <td className="whitespace-nowrap text-sm text-gray-500">{player.nationality || '-'}</td>
                      <td className="whitespace-nowrap text-sm font-bold text-champions-gold">{player.assists}</td>
                      <td className="whitespace-nowrap text-sm text-gray-500">{formatValue(player.matches)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6 bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-100">
        <h3 className="text-lg font-semibold text-champions-blue mb-2">Nota sobre los datos</h3>
        <p className="text-sm text-gray-700">
          {updatedLabel ? (
            <>
              Ranking actualizado automáticamente el <strong>{updatedLabel}</strong> con datos de{' '}
              <a href={source} target="_blank" rel="noopener noreferrer" className="text-champions-blue underline">
                Wikipedia
              </a>{' '}
              (CC BY-SA).
            </>
          ) : (
            'El ranking de asistencias todavía no se ha actualizado automáticamente.'
          )}
        </p>
        <p className="text-sm text-gray-700 mt-2">
          Los jugadores que también están entre los máximos goleadores enlazan a su ficha. Las fotos de Wikimedia Commons
          muestran su autor y licencia al pasar el ratón por encima.
        </p>
      </div>
    </div>
  );
};

export default AssistsPage;
