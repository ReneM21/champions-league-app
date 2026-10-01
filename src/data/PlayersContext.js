import React, { createContext, useContext, useEffect, useState } from 'react';
import { asset } from '../utils/asset';
import { rankPlayers } from '../utils/stats';

const PlayersContext = createContext({ status: 'loading', players: [] });

// Carga public/data/players.json una sola vez y lo comparte con todas las páginas.
export function PlayersProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', players: [] });

  useEffect(() => {
    let cancelled = false;

    fetch(asset('data/players.json'))
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((players) => {
        const sorted = [...players].sort((a, b) => b.goals - a.goals);
        if (!cancelled) setState({ status: 'ready', players: rankPlayers(sorted) });
      })
      .catch((error) => {
        console.error('Error cargando los datos de jugadores:', error);
        if (!cancelled) setState({ status: 'error', players: [] });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return <PlayersContext.Provider value={state}>{children}</PlayersContext.Provider>;
}

export const usePlayers = () => useContext(PlayersContext);

export const usePlayer = (id) => usePlayers().players.find((player) => player.id === id);

export const usePlayerByName = () => {
  const { players } = usePlayers();
  return (name) => players.find((player) => player.name === name);
};
