import React from 'react';

const ChampionsLeagueHeader = ({ activeView, onNavigate }) => {
  return (
    <header className="sticky top-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button 
              onClick={() => onNavigate('home')}
              className="flex items-center cursor-pointer focus:outline-none"
            >
              <div className="h-12 w-12 overflow-hidden mr-3 rounded-full shadow-lg border-2 border-champions-blue transform transition-transform duration-300 hover:scale-110 bg-gradient-to-br from-white to-blue-100">
                <img 
                  src="/images/logos/cc.png" 
                  alt="UEFA Champions League" 
                  className="h-full w-full object-contain p-1 rounded-full"
                  data-component-name="ChampionsLeagueScorers"
                />
              </div>
              <h1 className="text-champions-blue font-bold text-xl">
                Champions League
              </h1>
            </button>
          </div>
          
          <nav className="flex items-center space-x-4">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeView === 'home' 
                  ? 'bg-champions-blue text-white' 
                  : 'text-champions-blue hover:bg-blue-50 hover:text-blue-800'
              }`}
            >
              Goleadores
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default ChampionsLeagueHeader;
