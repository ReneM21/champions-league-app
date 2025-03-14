import React, { useState, useEffect } from 'react';
import PlayerRow from './PlayerRow';
import ChampionsLeagueFooter from './ChampionsLeagueFooter';
import ChampionsLeagueHeader from './ChampionsLeagueHeader';

// Componente ChampionsLeagueScorers
const ChampionsLeagueScorers = () => {
  const [champions, setChampions] = useState([]);
  const [detailPlayer, setDetailPlayer] = useState(null);
  const [activeView, setActiveView] = useState('home');
  const [loading, setLoading] = useState(true);
  const [jugadoresDetalle, setJugadoresDetalle] = useState([]);

  // Cargar datos de los máximos goleadores
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Añadir un retraso artificial para mostrar la animación de carga
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Cargar datos de goleadores desde top-champions-league-scorers.json
        const response = await fetch('/data/top-champions-league-scorers.json');
        const data = await response.json();

        // Cargar datos detallados de jugadores
        const responseDetalle = await fetch('/data/jugadores.json');
        const dataDetalle = await responseDetalle.json();
        setJugadoresDetalle(dataDetalle);

        // Si el archivo de goleadores está vacío, usar los datos detallados
        if (Array.isArray(data) && data.length === 0) {
          setChampions(dataDetalle);
        } else {
          // Mapear los datos del top-champions-league-scorers.json al formato esperado
          const mappedData = data.map(player => {
            // Buscar información adicional en jugadores.json para enriquecer los datos
            const jugadorDetallado = dataDetalle.find(j => 
              (j.player && player.nombre && j.player.toLowerCase() === player.nombre.toLowerCase()) || 
              (j.player && player.player && j.player.toLowerCase() === player.player.toLowerCase())
            );
            
            // Combinar datos, SOLO cuando tenemos información real
            return {
              position: player.position || "", 
              player: player.nombre || player.player || "",
              nationality: jugadorDetallado?.nationality || player.nacionalidad || player.nationality || "",
              birthdate: jugadorDetallado?.birthdate || player.fecha_nacimiento || player.birthdate || "",
              goals: jugadorDetallado?.goals || player.goles_totales || player.goals || null,
              matches: jugadorDetallado?.matches || player.partidos || player.matches || null,
              finals: jugadorDetallado?.finals || player.finales || player.finals || null,
              titles: jugadorDetallado?.titles || player.titulos || player.titles || null,
              teams: jugadorDetallado?.teams || (player.equipos ? player.equipos.map(e => e.equipo || e) : player.teams || []),
              biography: jugadorDetallado?.biography || player.biografia || player.biography || "",
              seasons: jugadorDetallado?.seasons || player.temporadas || player.seasons || []
            };
          });
          setChampions(mappedData);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Función para mostrar detalles del jugador
  const showPlayerDetails = (player) => {
    // Buscar el jugador completo en jugadoresDetalle usando el nombre como referencia
    let jugadorCompleto = null;
    
    if (jugadoresDetalle && jugadoresDetalle.length > 0) {
      // Primero intentamos encontrar una coincidencia exacta por nombre
      jugadorCompleto = jugadoresDetalle.find(j => 
        j.player === player.player || 
        j.nombre === player.player
      );
      
      // Si no hay coincidencia exacta, intentamos con una coincidencia parcial del nombre
      if (!jugadorCompleto) {
        jugadorCompleto = jugadoresDetalle.find(j => 
          (j.player && player.player && j.player.includes(player.player)) || 
          (j.player && player.nombre && j.player.includes(player.nombre)) ||
          (j.nombre && player.player && j.nombre.includes(player.player))
        );
      }
    }
    
    // Si encontramos datos detallados del jugador, los usamos, de lo contrario usamos los datos básicos
    setDetailPlayer(jugadorCompleto || player);
    setActiveView('player-detail');
  };

  // Función para mostrar equipos del jugador
  const showPlayerTeams = (player) => {
    // Buscar los datos completos del jugador si no es el jugador actualmente seleccionado
    if (!detailPlayer || (detailPlayer.player !== player.player && detailPlayer.nombre !== player.player)) {
      // Buscar el jugador completo en jugadoresDetalle
      let jugadorCompleto = null;
      
      if (jugadoresDetalle && jugadoresDetalle.length > 0) {
        // Intentar encontrar coincidencia exacta
        jugadorCompleto = jugadoresDetalle.find(j => 
          j.player === player.player || 
          j.nombre === player.player
        );
        
        // Si no hay coincidencia exacta, intentar con coincidencia parcial
        if (!jugadorCompleto) {
          jugadorCompleto = jugadoresDetalle.find(j => 
            (j.player && player.player && j.player.includes(player.player)) || 
            (j.player && player.nombre && j.player.includes(player.nombre)) ||
            (j.nombre && player.player && j.nombre.includes(player.player))
          );
        }
      }
      
      // Actualizar el jugador seleccionado
      if (jugadorCompleto) {
        setDetailPlayer({
          ...jugadorCompleto,
          // Asegurar que tenemos un valor para nombre (preferir el del jugador detallado)
          nombre: jugadorCompleto.nombre || jugadorCompleto.player || player.nombre || player.player
        });
      } else {
        // Si no encontramos datos detallados, usar los datos básicos
        setDetailPlayer({
          ...player,
          // Asegurar que tenemos un valor para nombre
          nombre: player.nombre || player.player
        });
      }
    }
    
    // Cambiar a la vista de equipos
    setActiveView('player-teams');
  };

  // Función para mostrar temporadas del jugador
  const showPlayerSeasons = (player) => {
    // Buscar los datos completos del jugador si no es el jugador actualmente seleccionado
    if (!detailPlayer || (detailPlayer.player !== player.player && detailPlayer.nombre !== player.player)) {
      // Buscar el jugador completo en jugadoresDetalle
      let jugadorCompleto = null;
      
      if (jugadoresDetalle && jugadoresDetalle.length > 0) {
        // Intentar encontrar coincidencia exacta
        jugadorCompleto = jugadoresDetalle.find(j => 
          j.player === player.player || 
          j.nombre === player.player
        );
        
        // Si no hay coincidencia exacta, intentar con coincidencia parcial
        if (!jugadorCompleto) {
          jugadorCompleto = jugadoresDetalle.find(j => 
            (j.player && player.player && j.player.includes(player.player)) || 
            (j.player && player.nombre && j.player.includes(player.nombre)) ||
            (j.nombre && player.player && j.nombre.includes(player.player))
          );
        }
      }
      
      // Actualizar el jugador seleccionado
      setDetailPlayer(jugadorCompleto || player);
    }
    
    setActiveView('player-seasons');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-champions-blue relative overflow-hidden">
        {/* Estrellas de fondo */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="star star-1"></div>
          <div className="star star-2"></div>
          <div className="star star-3"></div>
          <div className="star star-4"></div>
          <div className="star star-5"></div>
          <div className="star star-6"></div>
          <div className="star star-7"></div>
          <div className="star star-8"></div>
          <div className="star star-9"></div>
          <div className="star star-10"></div>
          <div className="star star-11"></div>
          <div className="star star-12"></div>
        </div>

        <div className="text-center z-10">
          <div className="flex flex-col items-center">
            {/* Logo Champions League con animación de aparición */}
            <div className="w-32 h-32 mx-auto mb-4 animate-fadeIn">
              <img 
                src="/images/logos/cc.png" 
                alt="Champions League Logo" 
                className="w-full h-full object-contain rounded-lg shadow-white cursor-pointer"
                data-component-name="ChampionsLeagueScorers"
                style={{ filter: 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.8))' }}
                onClick={() => setActiveView('home')}
              />
            </div>
            
            {/* Nueva imagen de premio con animación de aparición retrasada */}
            <div className="w-40 h-40 mx-auto mb-6 overflow-hidden opacity-0 animate-fadeInDelay">
              <img 
                src="/images/award.png" 
                alt="Award Trophy" 
                className="w-full h-full object-contain"
              />
            </div>
            
            {/* Spinner animado */}
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-champions-gold mx-auto"></div>
            <p className="mt-4 text-lg text-white animate-pulse">
              <span className="champions-star">★</span> Cargando goleadores <span className="champions-star">★</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Vista Principal - Lista de Goleadores
  const HomeView = () => {
    const getPlayerImagePath = (position) => {
      // Asegurarse de que position es un número
      const numPosition = Number(position) || 1;
      
      const imageFormats = {
        1: '.jpeg',
        2: '.jpg',
        3: '.avif',
        4: '.webp',
        5: '.webp',
        6: '.jpg',
        7: '.webp',
        8: '.webp',
        9: '.webp',
        10: '.webp'
      };

      const extension = imageFormats[numPosition] || '.jpg';
      return `/images/players/${numPosition}${extension}`;
    };

    return (
      <div className="p-4 md:p-8 animate-fadeIn">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-champions-blue mb-2 champions-title inline-block">
            Máximos Goleadores de la UEFA Champions League
          </h2>
          <p className="text-gray-600 mb-4">Descubre los mejores goleadores en la historia de la competición</p>
          <div className="w-24 h-1 bg-gradient-to-r from-champions-blue to-champions-gold mx-auto"></div>
        </div>
        
        <div className="overflow-hidden bg-white rounded-lg shadow-lg champions-card decorated-section">
          <div className="overflow-auto">
            <table className="min-w-full divide-y divide-gray-200 champions-table">
              <thead>
                <tr className="bg-champions-blue text-white">
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                    Posición
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                    Jugador
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                    Nacionalidad
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                    Goles
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {champions.map((player, index) => (
                  <tr 
                    key={index}
                    className="player-row hover:bg-blue-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 overflow-hidden rounded-full border-2 border-champions-blue" data-component-name="HomeView">
                          <img 
                            src={getPlayerImagePath(index + 1)}
                            alt={player.player || player.nombre}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.src = '/images/players/default.jpg'; 
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{player.player || player.nombre || "Desconocido"}</div>
                          <div className="text-sm text-gray-500">{player.nationality || player.nacionalidad || "Desconocida"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {player.nationality || player.nacionalidad || "Desconocida"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-champions-gold">
                      {player.goals || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => showPlayerDetails(player)}
                          className="text-champions-blue hover:text-blue-700 transition transform transition-transform duration-300 hover:scale-105 active:scale-95 pulse-on-click"
                        >
                          Perfil
                        </button>
                        <button 
                          onClick={() => showPlayerTeams(player)}
                          className="text-green-600 hover:text-green-800 transition transform transition-transform duration-300 hover:scale-105 active:scale-95 pulse-on-click"
                        >
                          Equipos
                        </button>
                        <button 
                          onClick={() => showPlayerSeasons(player)}
                          className="text-purple-600 hover:text-purple-800 transition transform transition-transform duration-300 hover:scale-105 active:scale-95 pulse-on-click"
                        >
                          Temporadas
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="mt-6 bg-blue-50 p-4 rounded-lg shadow border border-blue-100">
          <h3 className="text-lg font-semibold text-champions-blue mb-2">Nota sobre los datos</h3>
          <p className="text-sm text-gray-700">
            La información mostrada incluye los máximos goleadores históricos de la UEFA Champions League. 
            Para ver estadísticas detalladas de cada jugador, incluyendo temporadas, equipos y rendimiento,
            utilice los botones de acción en la tabla.
          </p>
          <p className="text-sm text-gray-700 mt-2">
            Los campos marcados con "-" indican que la información oficial no está disponible actualmente.
          </p>
        </div>
      </div>
    );
  };

  // Vista de Detalles del Jugador
  const PlayerDetailView = () => {
    if (!detailPlayer) return null;
    
    // Asegurarse de que todas las estadísticas estén correctamente mapeadas
    const playerStats = {
      nombre: detailPlayer.player || detailPlayer.nombre || "Jugador",
      goles: detailPlayer.goals || 0,
      partidos: detailPlayer.matches || 0,
      finales: detailPlayer.finals || 0,
      titulos: detailPlayer.titles || 0,
      equipos: detailPlayer.teams || [],
      nacionalidad: detailPlayer.nationality || "Desconocida",
      fechaNacimiento: detailPlayer.birthdate || "Desconocida",
      biografia: detailPlayer.biography || "Información no disponible"
    };
    
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden champions-card">
          <div className="champions-gradient-blue px-6 py-4">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <span className="mr-2">Perfil de</span><span className="bg-champions-gold text-champions-blue px-2 py-1 rounded shadow-md" data-component-name="PlayerDetailView">{playerStats.nombre}</span>
              </h3>
              <button 
                onClick={() => setActiveView('home')}
                className="bg-white text-champions-blue px-4 py-2 rounded font-bold hover:bg-gray-100 transform transition-transform duration-300 hover:scale-105 active:scale-95 pulse-on-click shadow-md"
              >
                Volver
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1">
                <div className="bg-gradient-to-br from-gray-50 to-gray-200 p-5 rounded-lg shadow-md border border-gray-100 glass-card">
                  <h4 className="text-xl font-semibold mb-4 text-champions-blue border-b border-gray-200 pb-2">Información Personal</h4>
                  <p className="text-gray-700 mb-3"><span className="font-semibold text-champions-blue">Nacionalidad:</span> {playerStats.nacionalidad}</p>
                  <p className="text-gray-700 mb-3"><span className="font-semibold text-champions-blue">Fecha de nacimiento:</span> {playerStats.fechaNacimiento}</p>
                  <p className="text-gray-700 mb-3"><span className="font-semibold text-champions-blue">Equipos:</span> {playerStats.equipos.join(', ')}</p>
                </div>
              </div>
              
              <div className="col-span-1 md:col-span-2">
                <div className="bg-gradient-to-br from-gray-50 to-gray-200 p-5 rounded-lg shadow-md border border-gray-100 h-full glass-card">
                  <h4 className="text-xl font-semibold mb-4 text-champions-blue border-b border-gray-200 pb-2">Biografía</h4>
                  <p className="text-gray-700 leading-relaxed">{playerStats.biografia}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h4 className="text-xl font-semibold mb-4 text-champions-blue pb-2 border-b border-gray-200 champions-title">Estadísticas en Champions League</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-champions-blue to-blue-900 p-5 rounded-lg text-center shadow-lg transform transition-transform hover:scale-105 duration-300" data-component-name="PlayerDetailView">
                  <p className="text-4xl font-bold mb-1 text-champions-gold">{playerStats.goles}</p>
                  <p className="text-sm uppercase tracking-wider font-semibold text-white bg-blue-800 py-1 px-2 rounded-md inline-block" data-component-name="PlayerDetailView">Goles</p>
                </div>
                <div className="bg-gradient-to-br from-champions-blue to-blue-900 p-5 rounded-lg text-center shadow-lg transform transition-transform hover:scale-105 duration-300" data-component-name="PlayerDetailView">
                  <p className="text-4xl font-bold mb-1 text-champions-gold">{playerStats.partidos}</p>
                  <p className="text-sm uppercase tracking-wider font-semibold text-white bg-blue-800 py-1 px-2 rounded-md inline-block" data-component-name="PlayerDetailView">Partidos</p>
                </div>
                <div className="bg-gradient-to-br from-champions-blue to-blue-900 p-5 rounded-lg text-center shadow-lg transform transition-transform hover:scale-105 duration-300" data-component-name="PlayerDetailView">
                  <p className="text-4xl font-bold mb-1 text-champions-gold">{playerStats.finales}</p>
                  <p className="text-sm uppercase tracking-wider font-semibold text-white bg-blue-800 py-1 px-2 rounded-md inline-block" data-component-name="PlayerDetailView">Finales</p>
                </div>
                <div className="bg-gradient-to-br from-champions-blue to-blue-900 p-5 rounded-lg text-center shadow-lg transform transition-transform hover:scale-105 duration-300" data-component-name="PlayerDetailView">
                  <p className="text-4xl font-bold mb-1 text-champions-gold">{playerStats.titulos}</p>
                  <p className="text-sm uppercase tracking-wider font-semibold text-white bg-blue-800 py-1 px-2 rounded-md inline-block" data-component-name="PlayerDetailView">Títulos</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex space-x-4">
              <button 
                onClick={() => showPlayerTeams(detailPlayer)}
                className="bg-champions-blue text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transform transition-transform duration-300 hover:scale-105 active:scale-95 pulse-on-click"
              >
                Ver Equipos
              </button>
              <button 
                onClick={() => showPlayerSeasons(detailPlayer)}
                className="bg-champions-blue text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transform transition-transform duration-300 hover:scale-105 active:scale-95 pulse-on-click"
              >
                Ver Temporadas
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Vista de Equipos del Jugador
  const PlayerTeamsView = () => {
    if (!detailPlayer) return null;
    
    // Obtener equipos de manera compatible con ambos formatos JSON
    let equipos = [];
    
    // Comprobar si los datos vienen en formato del top-champions-league-scorers.json
    if (detailPlayer.equipos && Array.isArray(detailPlayer.equipos)) {
      equipos = detailPlayer.equipos.map(equipo => ({
        equipo: equipo.equipo || "",
        goles: equipo.goles || 0,
        temporadas: equipo.temporadas || 0
      }));
    } 
    // Comprobar si los datos vienen en formato de jugadores.json
    else if (detailPlayer.teams && Array.isArray(detailPlayer.teams)) {
      // Si solo tenemos nombres de equipos, creamos objetos para cada uno
      equipos = detailPlayer.teams.map(team => {
        // Intentar encontrar estadísticas por equipo contando las temporadas
        let goles = 0;
        let temporadas = 0;
        
        if (detailPlayer.seasons && Array.isArray(detailPlayer.seasons)) {
          // Contar temporadas para este equipo
          const teamSeasons = detailPlayer.seasons.filter(s => s.club === team);
          temporadas = teamSeasons.length;
          
          // Sumar goles para este equipo
          goles = teamSeasons.reduce((sum, season) => sum + (season.goals || 0), 0);
        }
        
        return {
          equipo: team,
          goles: goles,
          temporadas: temporadas
        };
      });
    }

    // Asegurar que tenemos un nombre para mostrar
    const nombreJugador = detailPlayer.nombre || detailPlayer.player || "Jugador";
    
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden champions-card">
          <div className="bg-champions-blue px-6 py-4">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <span className="mr-2">Equipos de</span><span className="bg-champions-gold text-champions-blue px-2 py-1 rounded shadow-md" data-component-name="PlayerTeamsView">{nombreJugador}</span>
              </h3>
              <button 
                onClick={() => setActiveView('player-detail')}
                className="bg-white text-champions-blue px-4 py-2 rounded font-bold hover:bg-gray-100 transform transition-transform duration-300 hover:scale-105 active:scale-95 pulse-on-click shadow-md"
              >
                Volver al Perfil
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {equipos && equipos.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {equipos.map((equipo, index) => (
                    <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-200 p-5 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300 champions-card">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-bold text-champions-blue mb-2">{equipo.equipo}</h4>
                          <div className="grid grid-cols-2 gap-4 my-3">
                            <div>
                              <p className="text-sm text-gray-500 font-medium">Goles</p>
                              <p className="text-2xl font-bold text-green-600">{equipo.goles}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 font-medium">Temporadas</p>
                              <p className="text-2xl font-bold text-purple-600">{equipo.temporadas}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8">
                  <h4 className="text-xl font-semibold mb-3 text-champions-blue">Rendimiento por Equipo</h4>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="w-full h-16 bg-gray-200 rounded-full flex overflow-hidden">
                      {equipos.map((equipo, index) => {
                        const totalGoles = detailPlayer.goals || detailPlayer.goles_totales || 1;
                        const porcentaje = (equipo.goles / totalGoles) * 100;
                        const colores = ["bg-champions-gold", "bg-champions-blue", "bg-green-500", "bg-purple-500"];
                        return (
                          <div 
                            key={index}
                            className={`${colores[index % colores.length]} h-full`}
                            style={{ width: `${porcentaje}%` }}
                            title={`${equipo.equipo || "Equipo"}: ${equipo.goles || 0} goles (${porcentaje.toFixed(1)}%)`}
                          ></div>
                        );
                      })}
                    </div>
                    <div className="mt-2 flex flex-wrap">
                      {equipos.map((equipo, index) => {
                        const totalGoles = detailPlayer.goals || detailPlayer.goles_totales || 1;
                        const porcentaje = (equipo.goles / totalGoles) * 100;
                        const colores = ["bg-champions-gold", "bg-champions-blue", "bg-green-500", "bg-purple-500"];
                        return (
                          <div key={index} className="flex items-center mr-4 mb-2">
                            <div className={`w-3 h-3 ${colores[index % colores.length]} rounded-full mr-1`}></div>
                            <span className="text-sm text-gray-600">{equipo.equipo || "Equipo"} ({porcentaje.toFixed(1)}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500">No hay información disponible sobre los equipos de este jugador.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Vista de Temporadas del Jugador
  const PlayerSeasonsView = () => {
    if (!detailPlayer) return null;
    
    // Obtener temporadas de manera compatible con ambos formatos JSON
    let temporadas = [];
    
    // Comprobar si los datos vienen en formato del top-champions-league-scorers.json
    if (detailPlayer.temporadas && Array.isArray(detailPlayer.temporadas)) {
      temporadas = detailPlayer.temporadas;
    } 
    // Comprobar si los datos vienen en formato de jugadores.json
    else if (detailPlayer.seasons && Array.isArray(detailPlayer.seasons)) {
      temporadas = detailPlayer.seasons.map(season => ({
        temporada: season.season || "",
        equipo: season.club || "",
        goles: season.goals || 0,
        partidos: season.matches || 0,
        asistencias: season.assists || 0,
        titulo: season.title || false
      }));
    }
    
    // Ordenar temporadas cronológicamente (más recientes primero)
    temporadas.sort((a, b) => {
      const tempA = a.temporada || a.season || "";
      const tempB = b.temporada || b.season || "";
      return tempB.localeCompare(tempA);
    });
    
    // Encontrar la mejor temporada (más goles)
    const mejorTemporada = temporadas && temporadas.length > 0 ? 
      temporadas.reduce((mejor, actual) => 
        (mejor.goles || mejor.goals || 0) > (actual.goles || actual.goals || 0) ? mejor : actual, 
        { goles: 0, goals: 0 }
      ) : null;
      
    // Encontrar la temporada con mejor promedio de goles por partido
    const mejorPromedioTemporada = temporadas && temporadas.length > 0 ? 
      temporadas.reduce((mejor, actual) => {
        const promedioActual = (actual.goles || actual.goals || 0) / (actual.partidos || actual.matches || 1);
        const promedioMejor = (mejor.goles || mejor.goals || 0) / (mejor.partidos || mejor.matches || 1);
        return promedioActual > promedioMejor ? actual : mejor;
      }, { goles: 0, goals: 0, partidos: 1, matches: 1 }) : null;
      
    // Calcular la evolución a lo largo de las temporadas
    const primeraTemporada = temporadas && temporadas.length > 0 ? 
      temporadas.reduce((primera, actual) => {
        const tempPrimera = primera.temporada || primera.season || "";
        const tempActual = actual.temporada || actual.season || "";
        return tempPrimera < tempActual ? primera : actual;
      }, temporadas[0]) : null;
      
    const ultimaTemporada = temporadas && temporadas.length > 0 ? 
      temporadas.reduce((ultima, actual) => {
        const tempUltima = ultima.temporada || ultima.season || "";
        const tempActual = actual.temporada || actual.season || "";
        return tempUltima > tempActual ? ultima : actual;
      }, temporadas[0]) : null;
    
    // Calcular totales para estadísticas
    const totalGoles = temporadas.reduce((total, temp) => total + (parseInt(temp.goles || temp.goals || 0)), 0);
    const totalPartidos = temporadas.reduce((total, temp) => total + (parseInt(temp.partidos || temp.matches || 0)), 0);
    const totalAsistencias = temporadas.reduce((total, temp) => total + (parseInt(temp.asistencias || temp.assists || 0)), 0);
    const totalTitulos = temporadas.filter(temp => temp.titulo || temp.title).length;
    const promedioGolesPorPartido = totalPartidos > 0 ? (totalGoles / totalPartidos).toFixed(2) : "0.00";
    
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden champions-card">
          <div className="bg-champions-blue px-6 py-4">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <span className="mr-2">Temporadas de</span><span className="bg-champions-gold text-champions-blue px-2 py-1 rounded shadow-md">{detailPlayer.player || detailPlayer.nombre || "Jugador"}</span>
              </h3>
              <button 
                onClick={() => setActiveView('player-detail')}
                className="bg-white text-champions-blue px-4 py-2 rounded font-bold hover:bg-gray-100 transform transition-transform duration-300 hover:scale-105 active:scale-95 pulse-on-click shadow-md"
              >
                Volver al Perfil
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {/* Panel de Resumen de Carrera */}
            <div className="mb-8 bg-gradient-to-r from-white to-blue-50 p-5 rounded-lg shadow-lg glass-card glow-container" data-component-name="Estadísticas por Temporada">
              <h4 className="text-xl font-bold mb-3 text-champions-blue border-b border-gray-200 pb-2">Resumen de Carrera en Champions League</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm uppercase text-black font-bold">Temporadas Disputadas</p>
                  <p className="text-3xl font-bold text-green-600">{temporadas.length}</p>
                  <p className="text-sm mt-1 text-black">Desde {primeraTemporada ? (primeraTemporada.temporada || primeraTemporada.season) : "?"} hasta {ultimaTemporada ? (ultimaTemporada.temporada || ultimaTemporada.season) : "?"}</p>
                </div>
                <div>
                  <p className="text-sm uppercase text-black font-bold">Equipos Representados</p>
                  <p className="text-3xl font-bold text-green-600">{[...new Set(temporadas.map(t => t.equipo || t.club))].length}</p>
                  <p className="text-sm mt-1 text-black">{[...new Set(temporadas.map(t => t.equipo || t.club))].join(", ")}</p>
                </div>
                <div>
                  <p className="text-sm uppercase text-black font-bold">Títulos y Reconocimientos</p>
                  <p className="text-3xl font-bold text-green-600">{totalTitulos}</p>
                  <p className="text-sm mt-1 text-black">{totalTitulos > 0 ? `Campeón en ${temporadas.filter(t => t.titulo || t.title).map(t => t.temporada || t.season).join(", ")}` : "Aún sin títulos"}</p>
                </div>
              </div>
            </div>

            {mejorTemporada && mejorTemporada.goles > 0 && (
              <div className="mb-8">
                <h4 className="text-xl font-semibold mb-3 text-champions-blue">Mejor Temporada</h4>
                <div className="bg-gradient-to-r from-champions-gold to-amber-100 bg-opacity-30 p-5 rounded-lg border-l-4 border-champions-gold shadow-md glow-container">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="col-span-1">
                      <p className="text-lg font-bold">{mejorTemporada.temporada || mejorTemporada.season || "Desconocida"}</p>
                      <p className="text-sm text-gray-600">{mejorTemporada.equipo || mejorTemporada.club || "Desconocido"}</p>
                      <p className="text-xs mt-2 font-semibold">{(mejorTemporada.titulo || mejorTemporada.title) ? "✓ Ganó el título" : ""}</p>
                    </div>
                    <div className="col-span-1 text-center">
                      <p className="text-3xl font-bold text-green-600">{mejorTemporada.goles || mejorTemporada.goals || 0}</p>
                      <p className="text-sm uppercase">Goles</p>
                    </div>
                    <div className="col-span-1 text-center">
                      <p className="text-3xl font-bold text-champions-blue">{mejorTemporada.partidos || mejorTemporada.matches || 0}</p>
                      <p className="text-sm uppercase">Partidos</p>
                    </div>
                    <div className="col-span-1 text-center">
                      <p className="text-3xl font-bold text-green-500">{mejorTemporada.asistencias || mejorTemporada.assists || 0}</p>
                      <p className="text-sm uppercase">Asistencias</p>
                    </div>
                    <div className="col-span-1 text-center">
                      <p className="text-3xl font-bold text-purple-500">
                        {((mejorTemporada.goles || mejorTemporada.goals || 0) / (mejorTemporada.partidos || mejorTemporada.matches || 1)).toFixed(2)}
                      </p>
                      <p className="text-sm uppercase">Goles/Partido</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Panel de Eficiencia Goleadora */}
            {mejorPromedioTemporada && (
              <div className="mb-8">
                <h4 className="text-xl font-semibold mb-3 text-champions-blue">Máxima Eficiencia Goleadora</h4>
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-5 rounded-lg border-l-4 border-green-500 shadow-md glow-container">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="col-span-1">
                      <p className="text-lg font-bold">{mejorPromedioTemporada.temporada || mejorPromedioTemporada.season || "Desconocida"}</p>
                      <p className="text-sm text-gray-600">{mejorPromedioTemporada.equipo || mejorPromedioTemporada.club || "Desconocido"}</p>
                    </div>
                    <div className="col-span-1 text-center">
                      <p className="text-3xl font-bold text-green-600">
                        {((mejorPromedioTemporada.goles || mejorPromedioTemporada.goals || 0) / 
                          (mejorPromedioTemporada.partidos || mejorPromedioTemporada.matches || 1)).toFixed(2)}
                      </p>
                      <p className="text-sm uppercase">Goles por Partido</p>
                    </div>
                    <div className="col-span-1 text-center">
                      <p className="text-3xl font-bold text-green-600">{mejorPromedioTemporada.goles || mejorPromedioTemporada.goals || 0}</p>
                      <p className="text-sm uppercase">Goles</p>
                    </div>
                    <div className="col-span-1 text-center">
                      <p className="text-3xl font-bold text-champions-blue">{mejorPromedioTemporada.partidos || mejorPromedioTemporada.matches || 0}</p>
                      <p className="text-sm uppercase">Partidos</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Resumen de Rendimiento General */}
            {temporadas && temporadas.length > 0 && (
              <div className="mb-8">
                <h4 className="text-xl font-semibold mb-3 text-champions-blue border-b border-blue-100 pb-2">Resumen de Rendimiento</h4>
                <div className="bg-blue-50 p-5 rounded-lg shadow-sm glass-card" data-component-name="PlayerSeasonsView">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="col-span-1 text-center">
                      <p className="text-3xl font-bold text-champions-blue">
                        {totalGoles}
                      </p>
                      <p className="text-sm uppercase">Goles Totales</p>
                    </div>
                    <div className="col-span-1 text-center">
                      <p className="text-3xl font-bold text-champions-blue">
                        {totalPartidos}
                      </p>
                      <p className="text-sm uppercase">Partidos Totales</p>
                    </div>
                    <div className="col-span-1 text-center">
                      <p className="text-3xl font-bold text-champions-blue">
                        {totalAsistencias}
                      </p>
                      <p className="text-sm uppercase">Asistencias Totales</p>
                    </div>
                    <div className="col-span-1 text-center">
                      <p className="text-3xl font-bold text-green-600">
                        {totalTitulos}
                      </p>
                      <p className="text-sm uppercase">Títulos Ganados</p>
                    </div>
                    <div className="col-span-1 text-center">
                      <p className="text-3xl font-bold text-green-500">
                        {promedioGolesPorPartido}
                      </p>
                      <p className="text-sm uppercase">Goles por Partido</p>
                    </div>
                  </div>
                  
                  {totalTitulos > 0 && (
                    <div className="mt-4 p-3 bg-champions-gold bg-opacity-10 rounded-lg">
                      <h5 className="text-lg font-semibold text-champions-gold mb-2">Éxitos en Champions League</h5>
                      <p className="text-gray-700">
                        {detailPlayer.player || detailPlayer.nombre || "El jugador"} ha ganado la Champions League 
                        {totalTitulos > 1 ? 
                          ` en ${totalTitulos} ocasiones` : 
                          " una vez"}.
                        Las temporadas ganadoras fueron: {temporadas
                          .filter(temp => temp.titulo || temp.title)
                          .map(temp => temp.temporada || temp.season)
                          .join(", ")}.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {temporadas && temporadas.length > 0 ? (
              <div>
                <h4 className="text-xl font-semibold mb-3 text-champions-blue">Todas las Temporadas</h4>
                <div className="overflow-x-auto">
                  <table className="w-full mt-6 champions-table">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left">Temporada</th>
                        <th className="px-4 py-2 text-center">Equipo</th>
                        <th className="px-4 py-2 text-center">Partidos</th>
                        <th className="px-4 py-2 text-center">Goles</th>
                        <th className="px-4 py-2 text-center">Promedio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {temporadas.map((temp, index) => (
                        <tr key={index} className={temp.titulo || temp.title ? "bg-green-50" : ""}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {temp.temporada || temp.season || "Desconocida"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {temp.equipo || temp.club || "Desconocido"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {temp.partidos || temp.matches || 0}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                            {temp.goles || temp.goals || 0}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-500">
                            {((temp.goles || temp.goals || 0) / (temp.partidos || temp.matches || 1)).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500">No hay información disponible sobre las temporadas de este jugador.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  let activeComponent;
  switch (activeView) {
    case 'home':
      activeComponent = <HomeView />;
      break;
    case 'player-detail':
      activeComponent = <PlayerDetailView />;
      break;
    case 'player-teams':
      activeComponent = <PlayerTeamsView />;
      break;
    case 'player-seasons':
      activeComponent = <PlayerSeasonsView />;
      break;
    default:
      activeComponent = <HomeView />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-champions-blue text-white py-4 shadow-md">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center" data-component-name="ChampionsLeagueScorers">
          <div className="flex items-center">
            <img 
              src="/images/logos/cc.png" 
              alt="Champions League Logo" 
              className="w-10 h-10 mr-3 rounded-lg cursor-pointer transform transition-transform duration-300 hover:scale-105 active:scale-95"
              data-component-name="ChampionsLeagueScorers"
              style={{ filter: 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.8))' }}
              onClick={() => {
                setActiveView('home');
                document.querySelector('[data-component-name="ChampionsLeagueScorers"]').classList.add('button-click-animation');
                setTimeout(() => {
                  document.querySelector('[data-component-name="ChampionsLeagueScorers"]')?.classList.remove('button-click-animation');
                }, 300);
              }}
            />
            <h1 className="text-xl font-bold">UEFA Champions League - Máximos Goleadores</h1>
          </div>
        </div>
      </header>
      
      {activeComponent}
      
      <footer className="bg-gray-800 text-white py-4 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} UEFA Champions League - Estadísticas Históricas</p>
        </div>
      </footer>
      <div className="fixed bottom-4 right-4 z-50">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-champions-blue text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-110"
          aria-label="Volver arriba"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChampionsLeagueScorers;