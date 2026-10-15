// Valida public/data/players.json, que se rellena a mano. Si algo está mal
// escrito, los tests fallan y el despliegue se detiene antes de publicar.
import players from '../../public/data/players.json';

const isCount = (value) => Number.isInteger(value) && value >= 0;
const isOptionalCount = (value) => value === undefined || value === null || isCount(value);

// "2013-14": dos años seguidos
const isSeason = (season) => {
  const match = /^(\d{4})-(\d{2})$/.exec(season);
  return Boolean(match) && (Number(match[1]) + 1) % 100 === Number(match[2]);
};

function problemsOf(player) {
  const problems = [];
  const add = (message) => problems.push(`${player.id || '(sin id)'}: ${message}`);

  if (!/^[a-z0-9-]+$/.test(player.id || '')) add('"id" debe ir en minúsculas, sin tildes y con guiones (ej. "harry-kane")');
  if (typeof player.name !== 'string' || !player.name.trim()) add('falta "name"');
  if (!isOptionalCount(player.titles)) add('"titles" debe ser un número entero o null');
  if (!isOptionalCount(player.finals)) add('"finals" debe ser un número entero o null');
  if (isCount(player.titles) && isCount(player.finals) && player.finals < player.titles) {
    add(`"finals" (${player.finals}) no puede ser menor que "titles" (${player.titles})`);
  }

  if (player.teams !== undefined) {
    if (!Array.isArray(player.teams)) add('"teams" debe ser una lista');
    else
      player.teams.forEach((team, i) => {
        if (typeof team.name !== 'string' || !team.name) add(`teams[${i}]: falta "name"`);
        if (!isCount(team.goals)) add(`teams[${i}] (${team.name}): "goals" debe ser un número entero`);
      });
  }

  if (player.seasons !== undefined) {
    if (!Array.isArray(player.seasons)) add('"seasons" debe ser una lista');
    else {
      player.seasons.forEach((s, i) => {
        const where = `seasons[${i}] (${s.season || 'sin temporada'})`;
        if (!isSeason(s.season)) add(`${where}: "season" debe tener el formato "2013-14"`);
        if (typeof s.club !== 'string' || !s.club) add(`${where}: falta "club"`);
        if (!isCount(s.goals)) add(`${where}: "goals" debe ser un número entero`);
        if (!isOptionalCount(s.matches)) add(`${where}: "matches" debe ser un número entero`);
        if (!isOptionalCount(s.assists)) add(`${where}: "assists" debe ser un número entero`);
        if (s.title !== undefined && typeof s.title !== 'boolean') add(`${where}: "title" debe ser true o false`);
      });
      const titleSeasons = player.seasons.filter((s) => s.title === true).length;
      if (isCount(player.titles) && titleSeasons > player.titles) {
        add(`hay ${titleSeasons} temporadas con "title": true pero "titles" es ${player.titles}`);
      }
    }
  }
  return problems;
}

describe('public/data/players.json', () => {
  it('es una lista de jugadores', () => {
    expect(Array.isArray(players)).toBe(true);
  });

  it('no repite ningún id', () => {
    const ids = players.map((p) => p.id);
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
  });

  it('cada ficha tiene el formato correcto', () => {
    expect(players.flatMap(problemsOf)).toEqual([]);
  });
});

describe('validación de fichas', () => {
  it('detecta los errores típicos al rellenar a mano', () => {
    const wrong = {
      id: 'Harry Kane',
      name: 'Harry Kane',
      titles: '1',
      finals: 0,
      seasons: [{ season: '2023/24', club: 'Bayern', goals: '8', title: 'sí' }],
    };
    const problems = problemsOf(wrong);
    expect(problems).toHaveLength(5);
    expect(problems.join('\n')).toMatch(/"id" debe ir en minúsculas/);
    expect(problems.join('\n')).toMatch(/"season" debe tener el formato "2013-14"/);
  });

  it('acepta una ficha rellenada correctamente', () => {
    const ok = {
      id: 'harry-kane',
      name: 'Harry Kane',
      titles: 0,
      finals: 1,
      teams: [{ name: 'Tottenham Hotspur', goals: 21 }],
      seasons: [{ season: '2018-19', club: 'Tottenham Hotspur', goals: 5, matches: 9, assists: 1 }],
    };
    expect(problemsOf(ok)).toEqual([]);
  });
});
