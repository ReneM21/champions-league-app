import React from 'react';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@heroui/react';

const NotFoundPage = ({ title = 'Página no encontrada', message = 'La dirección que buscas no existe.' }) => (
  <div className="mx-auto max-w-xl py-16 text-center">
    <p className="text-6xl font-bold text-accent">404</p>
    <h1 className="mt-4 text-3xl font-bold tracking-tight">{title}</h1>
    <p className="mt-2 mb-8 text-muted">{message}</p>
    <Link to="/" className={buttonVariants({ size: 'lg' })}>
      Volver a los goleadores
    </Link>
  </div>
);

export default NotFoundPage;
