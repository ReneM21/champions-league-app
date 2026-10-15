import React from 'react';
import { asset, LOGO } from '../utils/asset';

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-champions-blue relative overflow-hidden">
    {/* Estrellas de fondo */}
    <div className="absolute inset-0 overflow-hidden">
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className={`star star-${i + 1}`}></div>
      ))}
    </div>

    <div className="text-center z-10 flex flex-col items-center">
      <div className="w-32 h-32 mx-auto mb-4 animate-fadeIn">
        <img
          src={LOGO}
          alt="Champions League Logo"
          className="w-full h-full object-contain rounded-lg"
          style={{ filter: 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.8))' }}
        />
      </div>

      <div className="w-40 h-40 mx-auto mb-6 overflow-hidden opacity-0 animate-fadeInDelay">
        <img src={asset('images/award.png')} alt="" className="w-full h-full object-contain" />
      </div>

      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-champions-gold mx-auto"></div>
      <p className="mt-4 text-lg text-white animate-pulse">
        <span className="champions-star">★</span> Cargando goleadores <span className="champions-star">★</span>
      </p>
    </div>
  </div>
);

export default LoadingScreen;
