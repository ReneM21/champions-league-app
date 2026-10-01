import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { PlayersProvider } from './data/PlayersContext';

// HashRouter: GitHub Pages no reescribe rutas, así que /#/jugadores/... funciona
// al recargar o al abrir un enlace directo.
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>
      <PlayersProvider>
        <App />
      </PlayersProvider>
    </HashRouter>
  </React.StrictMode>
);
