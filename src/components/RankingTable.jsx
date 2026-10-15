import React from 'react';
import { Link, Table } from '@heroui/react';
import PlayerAvatar from './PlayerAvatar';
import { formatValue } from '../utils/stats';

// Tabla de ranking (goleadores o asistidores) con la Table de HeroUI.
// - stat / statLabel: columna principal ("goals" / "Goles").
// - profileOf(player): ficha a la que enlaza el jugador, o null si no tiene.
// - actions(player): enlaces opcionales de la última columna.
const RankingTable = ({ ariaLabel, players, stat, statLabel, profileOf, actions }) => (
  <div className="decorated-section">
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label={ariaLabel} className="min-w-[640px]">
          <Table.Header>
            <Table.Column className="w-24">Posición</Table.Column>
            <Table.Column isRowHeader>Jugador</Table.Column>
            <Table.Column>Nacionalidad</Table.Column>
            <Table.Column>{statLabel}</Table.Column>
            <Table.Column>Partidos</Table.Column>
            {actions && <Table.Column>Acciones</Table.Column>}
          </Table.Header>
          <Table.Body>
            {players.map((player) => {
              const profile = profileOf(player);
              const shown = profile || player;
              return (
                <Table.Row key={player.id} id={player.id}>
                  <Table.Cell className="font-semibold text-champions-blue">{player.position}</Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-4">
                      <PlayerAvatar player={shown} />
                      {profile ? (
                        <Link href={`/jugadores/${profile.id}`} className="font-medium text-foreground no-underline hover:text-champions-blue">
                          {shown.name}
                        </Link>
                      ) : (
                        <span className="font-medium">{shown.name}</span>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell className="text-muted">{player.nationality || '-'}</Table.Cell>
                  <Table.Cell className="text-base font-bold text-champions-gold">{player[stat]}</Table.Cell>
                  <Table.Cell className="text-muted">{formatValue(player.matches)}</Table.Cell>
                  {actions && <Table.Cell>{actions(player)}</Table.Cell>}
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  </div>
);

export default RankingTable;
