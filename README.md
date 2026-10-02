# Champions League Máximos Goleadores

Una aplicación web desarrollada con React y TailwindCSS que muestra información sobre los máximos goleadores históricos de la UEFA Champions League.

## Características

- Ranking de los máximos goleadores de la Champions League
- Ficha de cada jugador con su perfil, sus equipos y sus temporadas
- Páginas de equipos legendarios y de temporadas históricas
- Rutas propias para cada vista (`#/jugadores/cristiano-ronaldo/temporadas`): se pueden compartir y el botón "atrás" funciona
- Diseño responsive para dispositivos móviles y de escritorio

## Estructura del Proyecto

```
champions-league-app/
├── public/
│   ├── data/players.json        # Datos de los goleadores (un único formato)
│   ├── images/                  # Logos y fotos de jugadores
│   └── index.html
├── src/
│   ├── App.js                   # Layout y rutas
│   ├── index.js                 # Punto de entrada (HashRouter + PlayersProvider)
│   ├── index.css                # Estilos propios (efectos, tablas, animaciones)
│   ├── components/              # Cabecera, pie, avatar, paginación, marco de ficha...
│   ├── data/PlayersContext.js   # Carga players.json y lo comparte entre páginas
│   ├── pages/                   # Una página por ruta
│   └── utils/                   # Cálculos de estadísticas (con tests) y rutas de assets
├── package.json
├── tailwind.config.js           # Colores de marca: champions-blue y champions-gold
└── postcss.config.js
```

### Rutas

| Ruta | Página |
|---|---|
| `#/` | Ranking de goleadores |
| `#/jugadores/:id` | Perfil del jugador |
| `#/jugadores/:id/equipos` | Goles por equipo |
| `#/jugadores/:id/temporadas` | Estadísticas por temporada |
| `#/equipos` | Equipos legendarios |
| `#/temporadas` | Temporadas históricas |

### Formato de `public/data/players.json`

```json
{
  "id": "cristiano-ronaldo",
  "name": "Cristiano Ronaldo",
  "nationality": "Portugal",
  "birthdate": "05/02/1985",
  "image": "images/players/1.jpeg",
  "goals": 140, "matches": 183, "finals": 6, "titles": 5,
  "teams": [{ "name": "Real Madrid", "goals": 105 }],
  "biography": "...",
  "seasons": [{ "season": "2013-14", "club": "Real Madrid", "goals": 17, "matches": 11, "assists": 5, "title": true }]
}
```

- `id` se usa en la URL y debe ser único.
- `image` es relativa a `public/` (sin `/` inicial). Si falla, se muestra el logo.
- En `seasons`, `matches` y `assists` son opcionales: si faltan, la app muestra "-" y no los cuenta en los promedios.
- El orden del ranking se calcula a partir de `goals`; los empates comparten posición.

## Instalación

```bash
npm install
npm start      # servidor de desarrollo
npm test       # tests
npm run build  # build de producción
```

## Despliegue en GitHub Pages

La aplicación queda en https://renem21.github.io/champions-league-app.

### Automático (recomendado)

El workflow `.github/workflows/deploy.yml` ejecuta los tests, genera el build y publica la app cada vez que se sube algo a `master`. También se puede lanzar a mano desde la pestaña **Actions**.

Para que funcione, en **Settings > Pages > Source** tiene que estar seleccionado **GitHub Actions**.

### Manual

```bash
npm run deploy
```

Este comando genera el build y lo publica en la rama `gh-pages`. Solo tiene efecto si en **Settings > Pages > Source** está seleccionado **Deploy from a branch** con la rama `gh-pages`.

Notas:

- `node_modules/` y `build/` no se versionan (ver `.gitignore`).
- Todas las rutas a `public/` pasan por `asset()` (`src/utils/asset.js`), que añade `PUBLIC_URL`. Así funcionan tanto en local como bajo `/champions-league-app/`.
- La app usa `HashRouter` porque GitHub Pages no redirige las rutas al `index.html`.

## Tecnologías Utilizadas

- React 18 y React Router 7
- TailwindCSS
- Create React App
