import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, useHref, useNavigate } from 'react-router-dom';
import { RouterProvider } from '@heroui/react';
import './index.css';
import App from './App';
import { PlayersProvider } from './data/PlayersContext';

// Los enlaces y botones de HeroUI (React Aria) navegan con React Router en
// lugar de recargar la página. useHref añade el "#" del HashRouter.
const HeroUIRouter = ({ children }) => {
  const navigate = useNavigate();
  return (
    <RouterProvider navigate={navigate} useHref={useHref}>
      {children}
    </RouterProvider>
  );
};

// HashRouter: GitHub Pages no reescribe rutas, así que /#/jugadores/... funciona
// al recargar o al abrir un enlace directo.
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>
      <HeroUIRouter>
        <PlayersProvider>
          <App />
        </PlayersProvider>
      </HeroUIRouter>
    </HashRouter>
  </React.StrictMode>
);
