import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = ({ title = 'Página no encontrada', message = 'La dirección que buscas no existe.' }) => (
  <div className="max-w-xl mx-auto px-4 py-16 text-center">
    <h2 className="text-3xl font-bold text-champions-blue mb-4">{title}</h2>
    <p className="text-gray-600 mb-8">{message}</p>
    <Link to="/" className="bg-champions-blue text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700">
      Volver a los goleadores
    </Link>
  </div>
);

export default NotFoundPage;
