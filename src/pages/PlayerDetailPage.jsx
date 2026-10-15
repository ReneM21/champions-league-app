import React from 'react';
import { Card, Link } from '@heroui/react';
import PlayerPage from '../components/PlayerPage';
import StatCard from '../components/StatCard';
import { formatValue } from '../utils/stats';

const InfoRow = ({ label, children }) => (
  <div className="flex justify-between gap-4 border-b border-separator py-3 last:border-0">
    <dt className="text-muted">{label}</dt>
    <dd className="text-right font-medium">{children}</dd>
  </div>
);

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

const PlayerDetailPage = () => (
  <PlayerPage>
    {(player) => (
      <div className="grid gap-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <StatCard label="Goles" value={player.goals} note={player.goalsPosition ? `${player.goalsPosition}º del ranking` : null} highlight />
          <StatCard label="Asistencias" value={player.assists} note={player.assistsPosition ? `${player.assistsPosition}º del ranking` : null} />
          <StatCard label="Partidos" value={player.matches} />
          <StatCard label="Finales" value={player.finals} />
          <StatCard label="Títulos" value={player.titles} />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <Card.Header>
              <Card.Title>Información personal</Card.Title>
            </Card.Header>
            <Card.Content>
              <dl className="text-sm">
                <InfoRow label="Nacionalidad">{formatValue(player.nationality)}</InfoRow>
                <InfoRow label="Posición">{formatValue(player.role ? capitalize(player.role) : null)}</InfoRow>
                <InfoRow label="Nacimiento">{formatValue(player.birthdate)}</InfoRow>
                <InfoRow label="Años">{formatValue(player.years || null)}</InfoRow>
                <InfoRow label="Equipos">{(player.clubs || player.teams.map((t) => t.name)).join(', ') || '-'}</InfoRow>
              </dl>
              {player.photoCredit && (
                <Link
                  href={player.photoCredit.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block text-xs text-muted no-underline hover:text-accent"
                >
                  Foto: {player.photoCredit.author} · {player.photoCredit.license}
                </Link>
              )}
            </Card.Content>
          </Card>

          <Card className="md:col-span-2">
            <Card.Header>
              <Card.Title>Biografía</Card.Title>
            </Card.Header>
            <Card.Content>
              <p className="leading-relaxed text-muted">{player.biography || 'Todavía no hay biografía para este jugador.'}</p>
              {player.biographySource && (
                <Link href={player.biographySource} target="_blank" rel="noopener noreferrer" className="mt-4 text-sm">
                  Leer más en Wikipedia
                </Link>
              )}
            </Card.Content>
          </Card>
        </div>
      </div>
    )}
  </PlayerPage>
);

export default PlayerDetailPage;
