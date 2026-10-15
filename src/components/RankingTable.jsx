import React from 'react';
import { Chip, Link, Table } from '@heroui/react';
import PlayerAvatar from './PlayerAvatar';
import { formatValue } from '../utils/stats';

// Tabla de ranking (goleadores o asistidores) con la Table de HeroUI.
// - stat / statLabel: columna principal ("goals" / "Goles").
// - profileOf(player): ficha a la que enlaza el jugador, o null si no tiene.
// - actions(player): enlaces opcionales de la última columna.
// - linkQuery: se añade al enlace de la ficha (p. ej. "?ranking=asistencias").
const RankingTable = ({ ariaLabel, players, stat, statLabel, profileOf, actions, linkQuery = '' }) => (
  <Table>
    <Table.ScrollContainer>
      <Table.Content aria-label={ariaLabel} className="min-w-[640px]">
        <Table.Header>
          <Table.Column className="w-16">#</Table.Column>
          <Table.Column isRowHeader>Jugador</Table.Column>
          <Table.Column>Nacionalidad</Table.Column>
          <Table.Column className="text-right">{statLabel}</Table.Column>
          <Table.Column className="text-right">Partidos</Table.Column>
          {actions && <Table.Column className="text-right">Ver</Table.Column>}
        </Table.Header>
        <Table.Body>
          {players.map((player) => {
            const profile = profileOf(player);
            const shown = profile || player;
            return (
              <Table.Row key={player.id} id={player.id}>
                <Table.Cell className="font-semibold tabular-nums text-muted">{player.position}</Table.Cell>
                <Table.Cell>
                  <div className="flex items-center gap-3">
                    <PlayerAvatar player={shown} className="size-10" />
                    {profile ? (
                      <Link href={`/jugadores/${profile.id}${linkQuery}`} className="font-medium text-foreground no-underline hover:text-accent">
                        {shown.name}
                      </Link>
                    ) : (
                      <span className="font-medium">{shown.name}</span>
                    )}
                    {shown.active && (
                      <Chip size="sm" color="success" variant="soft" title="Ha jugado la Champions League esta temporada">
                        En activo
                      </Chip>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell className="text-muted">{player.nationality || '-'}</Table.Cell>
                <Table.Cell className="text-right text-base font-bold tabular-nums text-accent">{player[stat]}</Table.Cell>
                <Table.Cell className="text-right tabular-nums text-muted">{formatValue(player.matches)}</Table.Cell>
                {actions && <Table.Cell className="text-right">{actions(player)}</Table.Cell>}
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Content>
    </Table.ScrollContainer>
  </Table>
);

export default RankingTable;
