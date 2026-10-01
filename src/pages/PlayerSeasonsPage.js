import React from 'react';
import PlayerPage, { backToProfile } from '../components/PlayerPage';
import { formatRatio, formatValue, goalsPerMatch, sortSeasonsDesc, summarizeSeasons } from '../utils/stats';

const Figure = ({ value, label, color = 'text-champions-blue' }) => (
  <div className="text-center">
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
    <p className="text-sm uppercase">{label}</p>
  </div>
);

const SeasonLabel = ({ season }) => (
  <div>
    <p className="text-lg font-bold">{season.season}</p>
    <p className="text-sm text-gray-600">{season.club}</p>
    {season.title && <p className="text-xs mt-2 font-semibold">✓ Ganó el título</p>}
  </div>
);

const PlayerSeasonsPage = () => (
  <PlayerPage title="Temporadas de" backTo={backToProfile} backLabel="Volver al Perfil">
    {(player) => {
      const summary = summarizeSeasons(player.seasons);
      const { best, mostEfficient } = summary;

      if (summary.count === 0) {
        return <p className="p-8 text-center text-gray-500">No hay información disponible sobre las temporadas de este jugador.</p>;
      }

      return (
        <>
          {/* Resumen de carrera */}
          <div className="mb-8 bg-gradient-to-r from-white to-blue-50 p-5 rounded-lg shadow-lg glass-card glow-container">
            <h3 className="text-xl font-bold mb-3 text-champions-blue border-b border-gray-200 pb-2">Resumen de Carrera en Champions League</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm uppercase font-bold">Temporadas Disputadas</p>
                <p className="text-3xl font-bold text-green-600">{summary.count}</p>
                <p className="text-sm mt-1">Desde {summary.first.season} hasta {summary.last.season}</p>
              </div>
              <div>
                <p className="text-sm uppercase font-bold">Equipos Representados</p>
                <p className="text-3xl font-bold text-green-600">{summary.clubs.length}</p>
                <p className="text-sm mt-1">{summary.clubs.join(', ')}</p>
              </div>
              <div>
                <p className="text-sm uppercase font-bold">Títulos</p>
                <p className="text-3xl font-bold text-green-600">{formatValue(player.titles)}</p>
                <p className="text-sm mt-1">
                  {player.titles > 0
                    ? summary.titleSeasons.length > 0 && `Campeón en ${summary.titleSeasons.join(', ')}`
                    : 'Aún sin títulos'}
                </p>
              </div>
            </div>
          </div>

          {best && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-3 text-champions-blue">Mejor Temporada</h3>
              <div className="bg-gradient-to-r from-champions-gold to-amber-100 p-5 rounded-lg border-l-4 border-champions-gold shadow-md glow-container">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <SeasonLabel season={best} />
                  <Figure value={best.goals} label="Goles" color="text-green-700" />
                  <Figure value={formatValue(best.matches)} label="Partidos" />
                  <Figure value={formatValue(best.assists)} label="Asistencias" color="text-green-600" />
                  <Figure value={formatRatio(goalsPerMatch(best.goals, best.matches))} label="Goles/Partido" color="text-purple-600" />
                </div>
              </div>
            </div>
          )}

          {mostEfficient && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-3 text-champions-blue">Máxima Eficiencia Goleadora</h3>
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-5 rounded-lg border-l-4 border-green-500 shadow-md glow-container">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <SeasonLabel season={mostEfficient} />
                  <Figure value={formatRatio(goalsPerMatch(mostEfficient.goals, mostEfficient.matches))} label="Goles por Partido" color="text-green-600" />
                  <Figure value={mostEfficient.goals} label="Goles" color="text-green-600" />
                  <Figure value={mostEfficient.matches} label="Partidos" />
                </div>
              </div>
            </div>
          )}

          {/* Suma de las temporadas registradas */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3 text-champions-blue border-b border-blue-100 pb-2">Resumen de Rendimiento</h3>
            <div className="bg-blue-50 p-5 rounded-lg shadow-sm glass-card">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Figure value={summary.totalGoals} label="Goles" />
                <Figure value={formatValue(summary.totalMatches)} label="Partidos" />
                <Figure value={formatValue(summary.totalAssists)} label="Asistencias" />
                <Figure value={formatRatio(summary.goalsPerMatch)} label="Goles por Partido" color="text-green-600" />
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Suma de las temporadas de la tabla. El promedio solo tiene en cuenta las temporadas con partidos registrados.
              </p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-3 text-champions-blue">Todas las Temporadas</h3>
          <div className="overflow-x-auto">
            <table className="w-full champions-table">
              <thead>
                <tr>
                  <th>Temporada</th>
                  <th>Equipo</th>
                  <th className="text-center">Partidos</th>
                  <th className="text-center">Goles</th>
                  <th className="text-center">Promedio</th>
                </tr>
              </thead>
              <tbody>
                {sortSeasonsDesc(player.seasons).map((season) => (
                  <tr key={`${season.season}-${season.club}`} className={season.title ? 'bg-green-50' : ''}>
                    <td className="whitespace-nowrap text-sm font-medium text-gray-900">
                      {season.season} {season.title && <span title="Campeón">🏆</span>}
                    </td>
                    <td className="whitespace-nowrap text-sm text-gray-500">{season.club}</td>
                    <td className="whitespace-nowrap text-sm text-gray-500 text-center">{formatValue(season.matches)}</td>
                    <td className="whitespace-nowrap text-sm font-medium text-green-600 text-center">{season.goals}</td>
                    <td className="whitespace-nowrap text-sm font-medium text-green-500 text-center">
                      {formatRatio(goalsPerMatch(season.goals, season.matches))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      );
    }}
  </PlayerPage>
);

export default PlayerSeasonsPage;
