import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Card, Link, buttonVariants } from '@heroui/react';
import PlayerAvatar from '../components/PlayerAvatar';
import PlayerPage from '../components/PlayerPage';
import { formatValue } from '../utils/stats';

const StatTile = ({ value, label }) => (
  <Card className="bg-linear-to-br from-champions-blue to-blue-900 text-center shadow-lg transform transition-transform hover:scale-105 duration-300">
    <Card.Content className="items-center p-5">
      <p className="text-4xl font-bold mb-1 text-champions-gold">{formatValue(value)}</p>
      <p className="text-sm uppercase tracking-wider font-semibold text-white bg-blue-800 py-1 px-2 rounded-md inline-block">{label}</p>
    </Card.Content>
  </Card>
);

const InfoRow = ({ label, children }) => (
  <p className="text-gray-700">
    <span className="font-semibold text-champions-blue">{label}:</span> {children}
  </p>
);

const PlayerDetailPage = () => (
  <PlayerPage title="Perfil de" backTo={() => '/'} backLabel="Volver">
    {(player) => (
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="secondary">
            <Card.Content className="gap-3 p-5">
              <div className="flex flex-col items-center mb-2">
                <PlayerAvatar player={player} className="size-32" />
                {player.photoCredit && (
                  <Link
                    href={player.photoCredit.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-xs text-gray-500 text-center no-underline hover:text-champions-blue"
                  >
                    Foto: {player.photoCredit.author} · {player.photoCredit.license}
                  </Link>
                )}
              </div>
              <h3 className="text-xl font-semibold text-champions-blue border-b border-gray-200 pb-2">Información Personal</h3>
              <InfoRow label="Posición en el ranking">{player.position}º</InfoRow>
              <InfoRow label="Nacionalidad">{formatValue(player.nationality)}</InfoRow>
              <InfoRow label="Fecha de nacimiento">{formatValue(player.birthdate)}</InfoRow>
              <InfoRow label="Años en la competición">{formatValue(player.years || null)}</InfoRow>
              <InfoRow label="Equipos">{(player.clubs || player.teams.map((t) => t.name)).join(', ') || '-'}</InfoRow>
            </Card.Content>
          </Card>

          <Card variant="secondary" className="md:col-span-2">
            <Card.Header>
              <Card.Title className="text-xl font-semibold text-champions-blue border-b border-gray-200 pb-2">Biografía</Card.Title>
            </Card.Header>
            <Card.Content>
              <p className="text-gray-700 leading-relaxed">{player.biography || 'Información no disponible'}</p>
            </Card.Content>
          </Card>
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
          <RouterLink to={`/jugadores/${player.id}/equipos`} className={buttonVariants({ size: 'lg' })}>
            Ver Equipos
          </RouterLink>
          <RouterLink to={`/jugadores/${player.id}/temporadas`} className={buttonVariants({ size: 'lg' })}>
            Ver Temporadas
          </RouterLink>
        </div>
      </>
    )}
  </PlayerPage>
);

export default PlayerDetailPage;
