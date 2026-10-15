import React from 'react';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@heroui/react';

// Mismo estilo que la sección activa del menú de la cabecera
const BUTTON = buttonVariants({ variant: 'secondary', size: 'sm', className: 'text-accent font-semibold' });

// Botones "Equipos" y "Temporadas" de la columna "Ver" de los rankings.
// query se añade al enlace (por ejemplo "?ranking=asistencias").
const PlayerTabLinks = ({ playerId, query = '' }) => (
  <div className="flex justify-end gap-2">
    <Link to={`/jugadores/${playerId}/equipos${query}`} className={BUTTON}>
      Equipos
    </Link>
    <Link to={`/jugadores/${playerId}/temporadas${query}`} className={BUTTON}>
      Temporadas
    </Link>
  </div>
);

export default PlayerTabLinks;
