import React from 'react';

const ChampionsLeagueFooter = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-champions-blue text-white border-t border-champions-gold">
      <div className="flex flex-col md:flex-row justify-between items-center p-6">
        <div className="mb-4 md:mb-0 flex items-center">
          <div className="w-10 h-10 mr-4 overflow-hidden rounded-lg shadow-md border border-champions-gold/30 bg-champions-blue/80">
            <img 
              src="/images/logos/cc.png" 
              alt="Champions League Logo" 
              className="w-full h-full object-contain transform hover:scale-110 transition-transform duration-300"
            />
          </div>
          <div>
            <p className="text-sm">
              {currentYear} <span className="text-champions-gold">UEFA Champions League</span> - Máximos Goleadores
            </p>
            <p className="text-xs text-blue-300 mt-1">
              Última actualización: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-6">
          <a href="#" className="text-blue-300 hover:text-champions-gold transition-colors duration-300 text-sm flex items-center">
            <span className="champions-star text-xs mr-1">★</span>
            Política de Privacidad
          </a>
          <a href="#" className="text-blue-300 hover:text-champions-gold transition-colors duration-300 text-sm flex items-center">
            <span className="champions-star text-xs mr-1">★</span>
            Términos y Condiciones
          </a>
          <a href="#" className="text-blue-300 hover:text-champions-gold transition-colors duration-300 text-sm flex items-center">
            <span className="champions-star text-xs mr-1">★</span>
            Contacto
          </a>
        </div>
      </div>
      
      {/* Barra decorativa con estrellas */}
      <div className="px-6 py-2 bg-opacity-20 bg-black text-center border-t border-opacity-20 border-white">
        <div className="flex justify-center space-x-4">
          {Array(5).fill('').map((_, i) => (
            <span key={i} className="champions-star" style={{ animationDelay: `${i * 0.5}s` }}>★</span>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default ChampionsLeagueFooter;