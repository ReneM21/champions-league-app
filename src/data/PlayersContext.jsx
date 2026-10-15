import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
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
      optional('data/uefa-seasons.json', { players: {} }),
      optional('data/clubs.json', {}),
      optional('data/competition.json', null),
    ])
      .then(([ranking, details, assists, photos, profiles, allGoals, allAssists, uefaSeasons, clubs, competition]) => {
        if (cancelled) return;
        const { scorers, assisters, byId } = buildPlayers({
          ranking,
          assists,
          details,
          photos,
          profiles,
          allGoals,
          allAssists,
          uefa: uefaSeasons.players,
          finals: (competition && competition.finals) || [],
        });
        setState({
          status: 'ready',
          players: scorers,
          byId,
          updatedAt: ranking.updatedAt,
          source: ranking.source,
          assists: { ...assists, players: assisters },
          uefaUpdatedAt: uefaSeasons.updatedAt || null,
          uefaSource: uefaSeasons.source || null,
          clubs,
          competition,
          seasonLeaders: uefaSeasons.leaders || {},
          currentSeason: uefaSeasons.current || null,
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

// Escudo de un club por su nombre (public/data/clubs.json)
const CLUB_ALIASES = { 'Bayern Munich': 'Bayern München', 'FC Barcelona': 'Barcelona', 'Inter Milan': 'Inter de Milán' };
export const useClubLogo = (name) => {
  const { clubs } = usePlayers();
  const club = clubs && (clubs[name] || clubs[CLUB_ALIASES[name]]);
  return club ? club.logo : null;
};

// Datos de la competición (finales, títulos por club...) de public/data/competition.json
export const useCompetition = () => {
  const { competition, seasonLeaders, clubs, currentSeason } = usePlayers();
  return { competition, seasonLeaders: seasonLeaders || {}, clubs: clubs || {}, currentSeason };
};

const normalizeName = (name) =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

// Busca un jugador con página por su nombre en cualquiera de las fuentes
export const usePlayerByName = () => {
  const { byId } = usePlayers();
  const index = useMemo(() => {
    const map = new Map();
    for (const player of byId ? byId.values() : []) {
      for (const alias of player.aliases || [player.name]) map.set(normalizeName(alias), player);
    }
    return map;
  }, [byId]);
  return (name) => index.get(normalizeName(name || ''));
};
