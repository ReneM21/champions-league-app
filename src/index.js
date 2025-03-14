import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './index.css';
import ChampionsLeagueScorers from './ChampionsLeagueScorers';

// Utilizamos HashRouter para que funcione correctamente con GitHub Pages
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>
      <ChampionsLeagueScorers />
    </HashRouter>
  </React.StrictMode>
);
