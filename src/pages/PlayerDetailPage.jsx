import React from 'react';
import { Card, Chip, Link } from '@heroui/react';
import ClubLogo from '../components/ClubLogo';
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
      <div className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <StatCard label="Goles" value={player.goals} note={player.goalsPosition ? `${player.goalsPosition}º del ranking` : null} highlight />
          <StatCard label="Asistencias" value={player.assists} note={player.assistsPosition ? `${player.assistsPosition}º del ranking` : null} />
          <StatCard label="Partidos" value={player.matches} />
          <StatCard label="Finales" value={player.finals} />
          <StatCard label="Títulos" value={player.titles} />
        </div>

        {player.finalsList && player.finalsList.length > 0 && (
          <Card>
            <Card.Header>
              <Card.Title>Finales</Card.Title>
              <Card.Description>
                {player.finalsList.length === 1 ? 'La final' : `Las ${player.finalsList.length} finales`} de la Champions League que
                alcanzó con su equipo.
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <ul className="divide-y divide-separator">
                {player.finalsList.map((final) => (
                  <li key={final.season} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3">
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="w-16 shrink-0 font-semibold tabular-nums">{final.season}</span>
                      <ClubLogo name={final.club} className="size-6" />
                      <span className="truncate">
                        {final.club} <span className="text-muted">vs</span> {final.opponent}
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="tabular-nums text-muted">
                        {final.score}
                        {final.penalties ? ' (pen.)' : final.extraTime ? ' (prór.)' : ''}
                      </span>
                      <Chip size="sm" color={final.won ? 'success' : 'default'} variant="soft">
                        {final.won ? 'Campeón' : 'Subcampeón'}
                      </Chip>
                    </span>
                  </li>
                ))}
              </ul>
            </Card.Content>
          </Card>
        )}

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
