import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ComboBox, Input, ListBox } from '@heroui/react';
import PlayerAvatar from './PlayerAvatar';
import { usePlayers } from '../data/PlayersContext';

// "Raúl" también se encuentra escribiendo "raul"
const normalize = (text) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const contains = (text, input) => normalize(text).includes(normalize(input));

// Buscador de jugadores (goleadores y asistidores): al elegir uno, abre su ficha
const PlayerSearch = ({ className = '' }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const { byId } = usePlayers();
  const players = useMemo(() => (byId ? [...byId.values()].sort((a, b) => a.name.localeCompare(b.name)) : []), [byId]);

  return (
    <ComboBox
      aria-label="Buscar jugador"
      menuTrigger="input"
      defaultFilter={contains}
      allowsEmptyCollection
      selectedKey={null}
      inputValue={query}
      onInputChange={setQuery}
      onSelectionChange={(id) => {
        if (!id) return;
        setQuery('');
        navigate(`/jugadores/${id}`);
      }}
      className={className}
    >
      <ComboBox.InputGroup>
        <Input placeholder="Buscar jugador…" />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox items={players} renderEmptyState={() => <p className="p-3 text-sm text-muted">Ningún jugador coincide.</p>}>
          {(player) => (
            <ListBox.Item id={player.id} textValue={player.name}>
              <span className="flex items-center gap-2">
                <PlayerAvatar player={player} className="size-7" />
                <span className="truncate">{player.name}</span>
              </span>
            </ListBox.Item>
          )}
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
};

export default PlayerSearch;
