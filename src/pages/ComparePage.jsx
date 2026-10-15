import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Card, Link } from '@heroui/react';
import PageHeader from '../components/PageHeader';
import PlayerAvatar from '../components/PlayerAvatar';
import PlayerSearch from '../components/PlayerSearch';
import ShareButton from '../components/ShareButton';
import { usePlayer, usePlayers } from '../data/PlayersContext';
import { formatRatio, goalsPerMatch, summarizeSeasons } from '../utils/stats';
import { useTitle } from '../utils/useTitle';

// Filas del comparador: valor de cada jugador y si "más es mejor"
const ROWS = [
  { label: 'Goles', value: (p) => p.goals },
  { label: 'Asistencias', value: (p) => p.assists, note: 'La UEFA registra las asistencias desde 2001-02' },
  { label: 'Partidos', value: (p) => p.matches },
  { label: 'Goles por partido', value: (p) => goalsPerMatch(p.goals, p.matches), format: formatRatio },
  { label: 'Asistencias por partido', value: (p) => goalsPerMatch(p.assists, p.matches), format: formatRatio },
  { label: 'Títulos', value: (p) => p.titles },
  { label: 'Finales', value: (p) => p.finals },
  { label: 'Temporadas', value: (p) => (p.seasons.length ? new Set(p.seasons.map((s) => s.season)).size : null) },
  { label: 'Clubes', value: (p) => (p.teams.length ? p.teams.length : null) },
  {
    label: 'Mejor temporada (goles)',
    value: (p) => {
      const best = summarizeSeasons(p.seasons, 'goals').best;
      return best ? best.goals : null;
    },
    detail: (p) => {
      const best = summarizeSeasons(p.seasons, 'goals').best;
      return best ? `${best.season} · ${best.club}` : null;
    },
  },
];

const known = (value) => value !== null && value !== undefined && !Number.isNaN(value);

// Una fila: barras enfrentadas, la del jugador de la izquierda crece hacia la
// izquierda. El mayor valor va en negrita (el color no es la única pista).
const CompareRow = ({ row, left, right }) => {
  const a = row.value(left);
  const b = row.value(right);
  const max = Math.max(known(a) ? a : 0, known(b) ? b : 0) || 1;
  const format = row.format || ((v) => v);
  const cell = (value, player, side) => {
    const wins = known(value) && known(side === 'left' ? b : a) && value > (side === 'left' ? b : a);
    const detail = row.detail && row.detail(player);
    return (
      <div className={`flex min-w-0 flex-col ${side === 'left' ? 'items-end text-right' : 'items-start'}`}>
        <span className={`tabular-nums ${wins ? 'text-lg font-bold text-accent' : 'text-lg font-medium'}`}>{known(value) ? format(value) : '-'}</span>
        {detail && <span className="max-w-full truncate text-xs text-muted">{detail}</span>}
        <span className={`mt-1 flex h-1.5 w-full ${side === 'left' ? 'justify-end' : ''}`}>
          <span
            className={`h-full rounded-full ${wins ? 'bg-accent' : 'bg-default'}`}
            style={{ width: known(value) ? `${Math.max(3, (value / max) * 100)}%` : 0 }}
          />
        </span>
      </div>
    );
  };
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 border-b border-separator py-3 last:border-0 sm:gap-6">
      {cell(a, left, 'left')}
      <span className="w-20 text-center text-[0.65rem] font-medium uppercase tracking-wide text-muted sm:w-40 sm:text-xs" title={row.note}>
        {row.label}
      </span>
      {cell(b, right, 'right')}
    </div>
  );
};

const PlayerColumn = ({ player, side, onChange, exclude }) => (
  <div className={`flex min-w-0 flex-col gap-3 ${side === 'left' ? 'items-end text-right' : 'items-start'}`}>
    {player ? (
      <>
        <PlayerAvatar player={player} className="size-16 sm:size-20" />
        <div className="min-w-0 max-w-full">
          <Link href={`/jugadores/${player.id}`} className="block truncate text-base font-bold text-foreground no-underline hover:text-accent sm:text-xl">
            {player.name}
          </Link>
          <p className="truncate text-sm text-muted">{[player.nationality, player.years].filter(Boolean).join(' · ')}</p>
        </div>
      </>
    ) : (
      <div className="flex size-16 items-center justify-center rounded-full border-2 border-dashed border-separator text-2xl text-muted sm:size-20">?</div>
    )}
    <PlayerSearch
      className="w-full min-w-0 max-w-64"
      placeholder={player ? 'Cambiar…' : 'Elegir…'}
      label={side === 'left' ? 'Primer jugador' : 'Segundo jugador'}
      onSelect={onChange}
      exclude={exclude}
    />
  </div>
);

// Comparador de dos jugadores. Los ids van en la URL (?a=...&b=...) para poder compartirlo.
const ComparePage = () => {
  const [params, setParams] = useSearchParams();
  const { players } = usePlayers();
  const left = usePlayer(params.get('a') || (players[0] && players[0].id));
  const right = usePlayer(params.get('b') || (players[1] && players[1].id));
  useTitle(left && right ? `${left.name} vs ${right.name}` : 'Comparar jugadores');

  const set = (key) => (id) => {
    const next = new URLSearchParams(params);
    next.set(key, id);
    if (!next.get(key === 'a' ? 'b' : 'a')) next.set(key === 'a' ? 'b' : 'a', (key === 'a' ? right : left).id);
    setParams(next, { replace: true });
  };
  const swap = () => left && right && setParams({ a: right.id, b: left.id }, { replace: true });

  return (
    <div>
      <PageHeader title="Comparar jugadores" description="Elige dos jugadores de los rankings y compara sus cifras en la Champions League.">
        {left && right && (
          <div>
            <ShareButton title={`${left.name} vs ${right.name} · Champions Stats`} />
          </div>
        )}
      </PageHeader>

      <Card>
        <Card.Content className="gap-6 p-4 sm:p-8">
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2 sm:gap-6">
            <PlayerColumn player={left} side="left" onChange={set('a')} exclude={right ? [right.id] : []} />
            <div className="flex w-10 flex-col items-center gap-2 pt-6 sm:w-40">
              <span className="text-2xl font-bold text-muted">vs</span>
              <Button size="sm" variant="ghost" onPress={swap} aria-label="Intercambiar jugadores" className="hidden sm:inline-flex">
                ⇄
              </Button>
            </div>
            <PlayerColumn player={right} side="right" onChange={set('b')} exclude={left ? [left.id] : []} />
          </div>

          {left && right && (
            <div>
              {ROWS.map((row) => (
                <CompareRow key={row.label} row={row} left={left} right={right} />
              ))}
            </div>
          )}
          <p className="text-xs text-muted">
            En negrita, el mejor de cada fila. Las asistencias son las del ranking de Wikipedia y la UEFA solo las registra
            desde 2001-02, así que los jugadores anteriores salen perjudicados.
          </p>
        </Card.Content>
      </Card>
    </div>
  );
};

export default ComparePage;
