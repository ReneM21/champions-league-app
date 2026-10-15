import React from 'react';
import { Card } from '@heroui/react';
import PlayerPage, { backToProfile } from '../components/PlayerPage';
import { teamBreakdown } from '../utils/stats';

const COLORS = ['bg-champions-gold', 'bg-champions-blue', 'bg-green-500', 'bg-purple-500'];

const PlayerTeamsPage = () => (
  <PlayerPage title="Equipos de" backTo={backToProfile} backLabel="Volver al Perfil">
    {(player) => {
      const teams = teamBreakdown(player);

      if (teams.length === 0) {
        return <p className="p-8 text-center text-gray-500">No hay información disponible sobre los equipos de este jugador.</p>;
      }

      return (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teams.map((team) => (
              <Card key={team.name} variant="secondary" className="champions-card">
                <Card.Header>
                  <Card.Title className="text-lg font-bold text-champions-blue">{team.name}</Card.Title>
                </Card.Header>
                <Card.Content className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Goles</p>
                    <p className="text-2xl font-bold text-green-600">{team.goals}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Temporadas</p>
                    <p className="text-2xl font-bold text-purple-600">{team.seasons || '-'}</p>
                  </div>
                </Card.Content>
              </Card>
            ))}
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-3 text-champions-blue">Rendimiento por Equipo</h3>
            <Card variant="secondary" className="p-4">
              <div className="w-full h-16 bg-gray-200 rounded-full flex overflow-hidden">
                {teams.map((team, index) => (
                  <div
                    key={team.name}
                    className={`${COLORS[index % COLORS.length]} h-full`}
                    style={{ width: `${team.share}%` }}
                    title={`${team.name}: ${team.goals} goles (${team.share.toFixed(1)}%)`}
                  ></div>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap">
                {teams.map((team, index) => (
                  <div key={team.name} className="flex items-center mr-4 mb-2">
                    <div className={`w-3 h-3 ${COLORS[index % COLORS.length]} rounded-full mr-1`}></div>
                    <span className="text-sm text-gray-600">{team.name} ({team.share.toFixed(1)}%)</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">Porcentaje sobre los {player.goals} goles totales del jugador en la competición.</p>
            </Card>
          </div>
        </>
      );
    }}
  </PlayerPage>
);

export default PlayerTeamsPage;
