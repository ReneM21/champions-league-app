import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { usePlayer } from '../data/PlayersContext';
import NotFoundPage from '../pages/NotFoundPage';

// Marco común de las fichas de jugador: busca el jugador de la URL y pinta
// la cabecera con el título y el enlace de vuelta.
const PlayerPage = ({ title, backTo, backLabel, children }) => {
  const { id } = useParams();
  const player = usePlayer(id);

  if (!player) {
    return <NotFoundPage title="Jugador no encontrado" message="El jugador que buscas no está en la lista de goleadores." />;
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 animate-fadeIn">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden champions-card">
        <div className="champions-gradient-blue px-6 py-4">
          <div className="flex flex-wrap gap-3 justify-between items-center">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <span className="mr-2">{title}</span>
              <span className="bg-champions-gold text-champions-blue px-2 py-1 rounded shadow-md">{player.name}</span>
            </h2>
            <Link
              to={backTo(player)}
              className="bg-white text-champions-blue px-4 py-2 rounded font-bold hover:bg-gray-100 transform transition-transform duration-300 hover:scale-105 active:scale-95 shadow-md"
            >
              {backLabel}
            </Link>
          </div>
        </div>

        <div className="p-6">{children(player)}</div>
      </div>
    </div>
  );
};

export const backToProfile = (player) => `/jugadores/${player.id}`;

export default PlayerPage;
