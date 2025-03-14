import React from 'react';

const PlayerRow = ({ position, name, team, goals, fullData, onPlayerInfoClick }) => {
  const isTopThree = position <= 3;
  
  // Determinar la extensión del archivo de imagen basada en la posición
  const getImageExtension = (pos) => {
    switch(pos) {
      case 1: return 'jpeg';
      case 2: return 'jpg';
      case 3: return 'avif';
      case 4: 
      case 5:
      case 7:
      case 8:
      case 9:
      case 10: return 'webp';
      case 6: return 'jpg';
      default: return 'jpg';
    }
  };
  
  const imageUrl = `/images/players/${position}.${getImageExtension(position)}`;
  
  return (
    <tr className={`border-b border-gray-200 hover:bg-gray-100 transition-all duration-300 ${isTopThree ? 'bg-gray-50' : ''}`}>
      <td className="py-3 px-4 text-center">
        {isTopThree ? (
          <div className={`inline-flex items-center justify-center w-7 h-7 rounded-full 
            ${position === 1 ? 'bg-champions-blue text-champions-gold border-champions-gold border-2' : 
              position === 2 ? 'bg-gray-100 text-champions-blue border border-champions-blue' : 
                'bg-[#cd7f32] text-white'}`}>
            {position}
          </div>
        ) : (
          position
        )}
      </td>
      
      <td 
        className="py-3 px-4 cursor-pointer hover:bg-blue-50" 
        onClick={onPlayerInfoClick}
        title="Ver información del jugador"
      >
        <div className="font-medium flex items-center">
          <div className={`w-12 h-12 rounded-full overflow-hidden mr-3 flex-shrink-0 shadow-md
            ${isTopThree 
              ? `border-2 ${position === 1 
                ? 'border-champions-gold shadow-champions-gold/20' 
                : position === 2 
                  ? 'border-gray-300 shadow-gray-300/20' 
                  : 'border-[#cd7f32] shadow-[#cd7f32]/20'}`
              : 'border border-champions-blue/30'}`}>
            <img 
              src={imageUrl}
              alt={`${name}`}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/players/default.jpg';
              }}
            />
          </div>
          <div>
            {isTopThree && <span className="champions-star mr-2">★</span>}
            <span className="font-medium">{name}</span>
            {position === 1 && <div className="text-xs text-champions-gold font-bold mt-1">• Máximo Goleador</div>}
          </div>
        </div>
      </td>
      
      <td className="py-3 px-4 text-gray-700">
        {team.split('/').map((club, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-gray-400 mx-1">/</span>}
            <span className="hover-gold">{club.trim()}</span>
          </React.Fragment>
        ))}
      </td>
      
      <td className="py-3 px-4 text-center">
        <span className={`font-bold ${isTopThree ? 'text-champions-blue' : ''}`}>
          {goals}
        </span>
        {position === 1 && (
          <div className="mt-1 text-xs text-champions-gold flex justify-center items-center">
            <span className="trophy-icon">🏆</span> Récord
          </div>
        )}
      </td>
    </tr>
  );
};

export default PlayerRow;