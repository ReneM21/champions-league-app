import React, { createContext, useContext, useEffect, useState } from 'react';
import { asset } from '../utils/asset';
import { rankPlayers } from '../utils/stats';
import { mergePlayers } from './mergePlayers';

const EMPTY_ASSISTS = { updatedAt: null, source: null, players: [] };

const PlayersContext = createContext({ status: 'loading', players: [], assists: EMPTY_ASSISTS });

const fetchJson = (path) =>
  fetch(asset(path)).then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status} en ${path}`);
    return response.json();
  });

// Carga el ranking (actualizado automáticamente) y las fichas de jugador
// una sola vez y lo comparte con todas las páginas.
export function PlayersProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', players: [], assists: EMPTY_ASSISTS });

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetchJson('data/ranking.json'),
      fetchJson('data/players.json'),
      // Si falla, la app funciona igual y la página de asistencias sale vacía
      fetchJson('data/assists.json').catch((error) => {
        console.error('Error cargando las asistencias:', error);
        return EMPTY_ASSISTS;
      }),
    ])
      .then(([ranking, details, assists]) => {
        if (cancelled) return;
        setState({
          status: 'ready',
          players: mergePlayers(ranking, details),
          updatedAt: ranking.updatedAt,
          source: ranking.source,
          assists: {
            ...assists,
            players: rankPlayers([...assists.players].sort((a, b) => b.assists - a.assists), 'assists'),
          },
        });
      })
      .catch((error) => {
        console.error('Error cargando los datos de jugadores:', error);
        if (!cancelled) setState({ status: 'error', players: [], assists: EMPTY_ASSISTS });
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
