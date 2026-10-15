import React from 'react';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@heroui/react';

const NotFoundPage = ({ title = 'Página no encontrada', message = 'La dirección que buscas no existe.' }) => (
  <div className="max-w-xl mx-auto px-4 py-16 text-center">
    <h2 className="text-3xl font-bold text-champions-blue mb-4">{title}</h2>
    <p className="text-gray-600 mb-8">{message}</p>
    <Link to="/" className={buttonVariants({ size: 'lg' })}>
      Volver a los goleadores
    </Link>
  </div>
);

export default NotFoundPage;
