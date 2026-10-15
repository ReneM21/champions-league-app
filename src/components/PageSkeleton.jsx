import React from 'react';
import { Skeleton } from '@heroui/react';

// Esqueleto que se muestra mientras cargan los datos: misma forma que la
// portada (título, podio y tabla) para que la página no "salte" al llegar.
const PageSkeleton = () => (
  <div role="status" aria-label="Cargando datos">
    <Skeleton className="mb-3 h-5 w-40 rounded-full" />
    <Skeleton className="mb-3 h-10 w-72 max-w-full rounded-xl" />
    <Skeleton className="mb-8 h-5 w-96 max-w-full rounded-lg" />

    <div className="mb-8 grid gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-3xl bg-surface p-6 shadow-sm">
          <Skeleton className="size-16 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4 rounded-lg" />
            <Skeleton className="h-3 w-1/2 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-12 rounded-lg" />
        </div>
      ))}
    </div>

    <div className="space-y-3 rounded-3xl bg-surface p-4 shadow-sm">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <Skeleton className="h-4 flex-1 rounded-lg" />
          <Skeleton className="h-4 w-12 rounded-lg" />
        </div>
      ))}
    </div>
  </div>
);

export default PageSkeleton;
