import React from 'react';
import { Chip } from '@heroui/react';

// Encabezado de las páginas de listado: etiqueta, título y descripción
const PageHeader = ({ eyebrow = 'UEFA Champions League', title, description, children }) => (
  <header className="mb-8 flex flex-col gap-3">
    <Chip color="accent" variant="soft" size="sm" className="w-fit">
      {eyebrow}
    </Chip>
    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
    {description && <p className="max-w-2xl text-muted">{description}</p>}
    {children}
  </header>
);

export default PageHeader;
