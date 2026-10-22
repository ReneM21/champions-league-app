import { useEffect, useState } from 'react';
import { asset } from '../utils/asset';

// public/data/current-season.json (lo genera scripts/update-current-season.js).
// Se carga solo cuando hace falta y se guarda en memoria: la segunda vez que
// se abre la página los datos ya están y no se ve el esqueleto.
let cache = null;
let request = null;

export const loadCurrentSeason = () => {
  if (!request) {
    request = fetch(asset('data/current-season.json'))
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((data) => {
        cache = data;
        return data;
      })
      .catch((error) => {
        request = null;
        throw error;
      });
  }
  return request;
};

// { status: 'loading' | 'ready' | 'error', data }
export const useCurrentSeason = () => {
  const [state, setState] = useState(() => (cache ? { status: 'ready', data: cache } : { status: 'loading', data: null }));
  useEffect(() => {
    if (cache) return undefined;
    let cancelled = false;
    loadCurrentSeason()
      .then((data) => !cancelled && setState({ status: 'ready', data }))
      .catch(() => !cancelled && setState({ status: 'error', data: null }));
    return () => {
      cancelled = true;
    };
  }, []);
  return state;
};

// Zonas de la fase de liga: 1-8 a octavos, 9-24 al play-off, 25-36 fuera
export const ZONES = [
  { id: 'r16', label: 'Octavos de final', from: 1, to: 8, className: 'bg-success' },
  { id: 'playoff', label: 'Play-off de octavos', from: 9, to: 24, className: 'bg-warning' },
  { id: 'out', label: 'Eliminado', from: 25, to: 36, className: 'bg-danger' },
];
export const zoneOf = (rank) => ZONES.find((zone) => rank >= zone.from && rank <= zone.to) || null;

export const isLive = (match) => match.status === 'LIVE';
export const isPlayed = (match) => match.status === 'FINISHED' || isLive(match);

// Clave de jornada dentro de una ronda ("2002239-3")
export const matchdayKey = (match) => `${match.round}-${match.matchday || 0}`;

// Jornadas de una ronda, en orden: [{ key, name, matches }]
export const matchdaysOf = (matches, roundId) => {
  const days = new Map();
  for (const match of matches.filter((m) => m.round === roundId)) {
    const key = matchdayKey(match);
    if (!days.has(key)) days.set(key, { key, name: match.matchdayName || `Jornada ${match.matchday}`, number: match.matchday || 0, matches: [] });
    days.get(key).matches.push(match);
  }
  return [...days.values()].sort((a, b) => a.number - b.number);
};

// Jornada que se muestra al entrar: la que está en juego, si no la próxima
// por jugar y, si ya acabó todo, la última
export const defaultMatchday = (matches, now = new Date()) => {
  const live = matches.find(isLive);
  if (live) return { round: live.round, key: matchdayKey(live) };
  const next = matches.find((m) => m.status !== 'FINISHED' && m.date && new Date(m.date) >= new Date(now.getTime() - 3 * 3600 * 1000));
  const pick = next || matches[matches.length - 1];
  return pick ? { round: pick.round, key: matchdayKey(pick) } : null;
};

// Partidos agrupados por día (en hora de Colombia)
export const byDay = (matches) => {
  const days = new Map();
  for (const match of matches) {
    const key = match.date ? new Date(match.date).toLocaleDateString('sv-SE', { timeZone: TIME_ZONE }) : 'sin-fecha';
    if (!days.has(key)) days.set(key, { key, date: match.date, matches: [] });
    days.get(key).matches.push(match);
  }
  return [...days.values()];
};

// Resultado para un equipo: 'G', 'E', 'P' o null si no se ha jugado
export const resultFor = (match, teamId) => {
  if (match.status !== 'FINISHED' || !match.score) return null;
  const own = match.home === teamId ? match.score.home : match.score.away;
  const other = match.home === teamId ? match.score.away : match.score.home;
  if (own !== other) return own > other ? 'G' : 'P';
  // Empate tras la prórroga: decide la tanda de penaltis
  if (match.penalties) {
    const ownPens = match.home === teamId ? match.penalties.home : match.penalties.away;
    const otherPens = match.home === teamId ? match.penalties.away : match.penalties.home;
    return ownPens > otherPens ? 'G' : 'P';
  }
  return 'E';
};

export const teamMatches = (matches, teamId) => matches.filter((m) => m.home === teamId || m.away === teamId);

// Fechas y horas siempre en hora de Colombia (UTC-5, sin horario de verano),
// sea cual sea la zona horaria del dispositivo
export const TIME_ZONE = 'America/Bogota';
export const TIME_ZONE_LABEL = 'hora de Colombia';

const DAY = { weekday: 'long', day: 'numeric', month: 'long', timeZone: TIME_ZONE };
export const formatDay = (iso) => (iso ? new Date(iso).toLocaleDateString('es-ES', DAY) : 'Fecha por confirmar');
export const formatShortDay = (iso) =>
  iso ? new Date(iso).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', timeZone: TIME_ZONE }) : 'Por confirmar';
export const formatTime = (iso) => (iso ? new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: TIME_ZONE }) : '');
