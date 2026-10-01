import React from 'react';
import { Link } from 'react-router-dom';
import PlayerAvatar from '../components/PlayerAvatar';
import { usePlayers } from '../data/PlayersContext';

const actionClass = 'transform transition-transform duration-300 hover:scale-105 active:scale-95';

const HomePage = () => {
  const { players } = usePlayers();

  return (
    <div className="p-4 md:p-8 animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-champions-blue mb-2 champions-title inline-block">
          Máximos Goleadores de la UEFA Champions League
        </h2>
        <p className="text-gray-600 mb-4">Descubre los mejores goleadores en la historia de la competición</p>
        <div className="w-24 h-1 bg-gradient-to-r from-champions-blue to-champions-gold mx-auto"></div>
      </div>

      <div className="overflow-hidden bg-white rounded-lg shadow-lg champions-card decorated-section">
        <div className="overflow-auto">
          <table className="min-w-full champions-table">
            <thead>
              <tr>
                <th scope="col" className="text-xs uppercase tracking-wider">Posición</th>
                <th scope="col" className="text-xs uppercase tracking-wider">Jugador</th>
                <th scope="col" className="text-xs uppercase tracking-wider">Nacionalidad</th>
                <th scope="col" className="text-xs uppercase tracking-wider">Goles</th>
                <th scope="col" className="text-xs uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => (
                <tr key={player.id}>
                  <td className="whitespace-nowrap text-sm font-medium text-gray-900">{player.position}</td>
                  <td className="whitespace-nowrap">
                    <Link to={`/jugadores/${player.id}`} className="flex items-center group">
                      <PlayerAvatar player={player} />
                      <span className="ml-4 text-sm font-medium text-gray-900 group-hover:text-champions-blue">
                        {player.name}
                      </span>
                    </Link>
                  </td>
                  <td className="whitespace-nowrap text-sm text-gray-500">{player.nationality || '-'}</td>
                  <td className="whitespace-nowrap text-sm font-bold text-champions-gold">{player.goals}</td>
                  <td className="whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <Link to={`/jugadores/${player.id}`} className={`text-champions-blue hover:text-blue-700 ${actionClass}`}>
                        Perfil
                      </Link>
                      <Link to={`/jugadores/${player.id}/equipos`} className={`text-green-600 hover:text-green-800 ${actionClass}`}>
                        Equipos
                      </Link>
                      <Link to={`/jugadores/${player.id}/temporadas`} className={`text-purple-600 hover:text-purple-800 ${actionClass}`}>
                        Temporadas
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 p-4 rounded-lg shadow border border-blue-100">
        <h3 className="text-lg font-semibold text-champions-blue mb-2">Nota sobre los datos</h3>
        <p className="text-sm text-gray-700">
          La información mostrada incluye los máximos goleadores históricos de la UEFA Champions League.
          Para ver estadísticas detalladas de cada jugador, incluyendo temporadas, equipos y rendimiento,
          utilice los enlaces de la tabla.
        </p>
        <p className="text-sm text-gray-700 mt-2">
          Los campos marcados con "-" indican que la información no está disponible actualmente.
        </p>
      </div>
    </div>
  );
};

export default HomePage;
