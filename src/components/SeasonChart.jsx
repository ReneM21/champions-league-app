import React, { useState } from 'react';
import { Card } from '@heroui/react';
import { STAT_LABELS } from '../utils/stats';

// Agrupa por temporada (un jugador puede tener dos clubes en la misma)
export function seasonTotals(seasons, stat) {
  const bySeason = new Map();
  for (const season of [...seasons].sort((a, b) => a.season.localeCompare(b.season))) {
    const current = bySeason.get(season.season) || { season: season.season, clubs: [], matches: 0, value: null, title: false };
    current.clubs.push(season.club);
    current.matches += season.matches || 0;
    if (season[stat] !== undefined && season[stat] !== null) current.value = (current.value || 0) + season[stat];
    current.title = current.title || Boolean(season.title);
    bySeason.set(season.season, current);
  }
  return [...bySeason.values()];
}

// Gráfico de barras: goles (o asistencias) de cada temporada. Una sola serie
// en el color de acento; solo la mejor temporada lleva su cifra encima y el
// resto se lee al pasar el ratón o en la tabla de abajo.
const SeasonChart = ({ seasons, stat }) => {
  const labels = STAT_LABELS[stat];
  const data = seasonTotals(seasons, stat);
  const max = Math.max(1, ...data.map((d) => d.value || 0));
  const best = data.reduce((top, d) => ((d.value || 0) > (top ? top.value || 0 : -1) ? d : top), null);
  const [active, setActive] = useState(null);
  const describe = (d) =>
    `${d.season} · ${d.clubs.join(' / ')}: ${d.value === null ? 'sin datos' : `${d.value} ${d.value === 1 ? labels.one : labels.many}`} en ${d.matches} partidos${d.title ? ' · Campeón' : ''}`;

  return (
    <Card>
      <Card.Header>
        <Card.Title>{labels.title} por temporada</Card.Title>
        <Card.Description>
          Pasa el ratón (o el foco) por una barra para ver la temporada. Las temporadas sin datos registrados aparecen rayadas.
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <p className="mb-2 min-h-5 text-sm font-medium" aria-live="polite">
          {active ? describe(active) : best && best.value !== null ? `Mejor temporada: ${describe(best)}` : ''}
        </p>
        <div className="overflow-x-auto pb-1">
          <div
            className="flex h-56 min-w-max items-end gap-0.5 border-b border-separator pt-6 sm:min-w-0"
            role="list"
            aria-label={`${labels.title} por temporada`}
            onMouseLeave={() => setActive(null)}
          >
            {data.map((d) => {
              const missing = d.value === null;
              const height = missing ? 100 : Math.max(2, (d.value / max) * 100);
              return (
                <div
                  key={d.season}
                  role="listitem"
                  tabIndex={0}
                  aria-label={describe(d)}
                  onMouseEnter={() => setActive(d)}
                  onFocus={() => setActive(d)}
                  onBlur={() => setActive(null)}
                  className="group flex h-full w-5 shrink-0 cursor-default flex-col items-center justify-end rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-accent sm:w-auto sm:min-w-4 sm:max-w-14 sm:flex-1"
                >
                  {d === best && !missing && <span className="mb-1 text-xs font-semibold tabular-nums">{d.value}</span>}
                  <span
                    className={`w-full rounded-t ${missing ? 'season-bar-missing' : d.title ? 'bg-champions-gold' : 'bg-accent'} ${
                      active === d ? 'opacity-70' : ''
                    }`}
                    style={{ height: `${height}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-1 flex min-w-max gap-0.5 text-[0.6rem] text-muted sm:min-w-0" aria-hidden="true">
            {data.map((d, i) => (
              <span key={d.season} className="w-5 shrink-0 text-center sm:w-auto sm:min-w-4 sm:max-w-14 sm:flex-1">
                {i === 0 || i === data.length - 1 || d === best ? `'${d.season.slice(-2)}` : ''}
              </span>
            ))}
          </div>
        </div>
        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-champions-gold" /> Temporada en la que ganó la Champions
          </span>
          <span>Las etiquetas del eje son el año en que termina cada temporada.</span>
        </p>
      </Card.Content>
    </Card>
  );
};

export default SeasonChart;
