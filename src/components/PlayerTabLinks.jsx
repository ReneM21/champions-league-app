import React from 'react';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@heroui/react';

// Texto de enlace normal; al pasar el ratón aparece el fondo del botón activo del menú
const BUTTON = buttonVariants({ variant: 'ghost', size: 'sm', className: 'text-link hover:text-accent' });

// Botones "Equipos" y "Temporadas" de la columna "Ver" de los rankings.
// query se añade al enlace (por ejemplo "?ranking=asistencias").
const PlayerTabLinks = ({ playerId, query = '' }) => (
  <div className="flex justify-end gap-1">
    <Link to={`/jugadores/${playerId}/equipos${query}`} className={BUTTON}>
      Equipos
    </Link>
    <Link to={`/jugadores/${playerId}/temporadas${query}`} className={BUTTON}>
      Temporadas
    </Link>
  </div>
);

export default PlayerTabLinks;
