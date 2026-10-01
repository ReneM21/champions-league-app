import React from 'react';
import { Link } from 'react-router-dom';
import PlayerAvatar from '../components/PlayerAvatar';
import PlayerPage from '../components/PlayerPage';
import { formatValue } from '../utils/stats';

const StatTile = ({ value, label }) => (
  <div className="bg-gradient-to-br from-champions-blue to-blue-900 p-5 rounded-lg text-center shadow-lg transform transition-transform hover:scale-105 duration-300">
    <p className="text-4xl font-bold mb-1 text-champions-gold">{formatValue(value)}</p>
    <p className="text-sm uppercase tracking-wider font-semibold text-white bg-blue-800 py-1 px-2 rounded-md inline-block">{label}</p>
  </div>
);

const buttonClass =
  'bg-champions-blue text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transform transition-transform duration-300 hover:scale-105 active:scale-95';

const PlayerDetailPage = () => (
  <PlayerPage title="Perfil de" backTo={() => '/'} backLabel="Volver">
    {(player) => (
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-5">
            <div className="flex justify-center mb-4">
              <PlayerAvatar player={player} className="h-32 w-32" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-champions-blue border-b border-gray-200 pb-2">Información Personal</h3>
            <p className="text-gray-700 mb-3"><span className="font-semibold text-champions-blue">Posición en el ranking:</span> {player.position}º</p>
            <p className="text-gray-700 mb-3"><span className="font-semibold text-champions-blue">Nacionalidad:</span> {formatValue(player.nationality)}</p>
            <p className="text-gray-700 mb-3"><span className="font-semibold text-champions-blue">Fecha de nacimiento:</span> {formatValue(player.birthdate)}</p>
            <p className="text-gray-700"><span className="font-semibold text-champions-blue">Equipos:</span> {player.teams.map((t) => t.name).join(', ') || '-'}</p>
          </div>

          <div className="md:col-span-2 glass-card p-5">
            <h3 className="text-xl font-semibold mb-4 text-champions-blue border-b border-gray-200 pb-2">Biografía</h3>
            <p className="text-gray-700 leading-relaxed">{player.biography || 'Información no disponible'}</p>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-champions-blue pb-2 champions-title">Estadísticas en Champions League</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatTile value={player.goals} label="Goles" />
            <StatTile value={player.matches} label="Partidos" />
            <StatTile value={player.finals} label="Finales" />
            <StatTile value={player.titles} label="Títulos" />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link to={`/jugadores/${player.id}/equipos`} className={buttonClass}>Ver Equipos</Link>
          <Link to={`/jugadores/${player.id}/temporadas`} className={buttonClass}>Ver Temporadas</Link>
        </div>
      </>
    )}
  </PlayerPage>
);

export default PlayerDetailPage;
