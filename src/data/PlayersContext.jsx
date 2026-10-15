import React, { createContext, useContext, useEffect, useState } from 'react';
import { asset } from '../utils/asset';
import { buildPlayers } from './buildPlayers';

const EMPTY_ASSISTS = { updatedAt: null, source: null, players: [] };

const PlayersContext = createContext({ status: 'loading', players: [], assists: EMPTY_ASSISTS });

const fetchJson = (path) =>
  fetch(asset(path)).then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status} en ${path}`);
    return response.json();
  });

// Carga los rankings, fichas, fotos y tablas completas una sola vez, los une
// con buildPlayers y lo comparte con todas las páginas.
export function PlayersProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', players: [], assists: EMPTY_ASSISTS });

  useEffect(() => {
    let cancelled = false;

    // Los archivos opcionales no impiden cargar la app si faltan
    const optional = (path, fallback) =>
      fetchJson(path).catch((error) => {
        console.warn(`No se pudo cargar ${path}:`, error.message);
        return fallback;
      });

    Promise.all([
      fetchJson('data/ranking.json'),
      fetchJson('data/players.json'),
      optional('data/assists.json', EMPTY_ASSISTS),
      optional('data/photos.json', {}),
      optional('data/profiles.json', {}),
      optional('data/all-goals.json', []),
      optional('data/all-assists.json', []),
    ])
      .then(([ranking, details, assists, photos, profiles, allGoals, allAssists]) => {
        if (cancelled) return;
        const { scorers, assisters, byId } = buildPlayers({ ranking, assists, details, photos, profiles, allGoals, allAssists });
        setState({
          status: 'ready',
          players: scorers,
          byId,
          updatedAt: ranking.updatedAt,
          source: ranking.source,
          assists: { ...assists, players: assisters },
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

// Cualquier jugador con página (goleadores y asistidores)
export const usePlayer = (id) => {
  const { byId } = usePlayers();
  return byId ? byId.get(id) : undefined;
};

export const usePlayerByName = () => {
  const { byId } = usePlayers();
  const all = byId ? [...byId.values()] : [];
  return (name) => all.find((player) => player.name === name);
};
