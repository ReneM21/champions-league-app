import React, { createContext, useContext, useEffect, useState } from 'react';
import { asset } from '../utils/asset';
import { mergePlayers } from './mergePlayers';

const PlayersContext = createContext({ status: 'loading', players: [] });

const fetchJson = (path) =>
  fetch(asset(path)).then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status} en ${path}`);
    return response.json();
  });

// Carga el ranking (actualizado automáticamente) y las fichas de jugador
// una sola vez y lo comparte con todas las páginas.
export function PlayersProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', players: [] });

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchJson('data/ranking.json'), fetchJson('data/players.json')])
      .then(([ranking, details]) => {
        if (cancelled) return;
        setState({
          status: 'ready',
          players: mergePlayers(ranking, details),
          updatedAt: ranking.updatedAt,
          source: ranking.source,
        });
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
