# Champions League Máximos Goleadores

Una aplicación web desarrollada con React y TailwindCSS que muestra información sobre los máximos goleadores históricos de la UEFA Champions League.

## Características

- Ranking de los máximos goleadores de la Champions League, actualizado automáticamente cada día desde Wikipedia
- Ranking de los máximos asistidores, actualizado de la misma forma
- Fotos de Wikimedia Commons para los jugadores sin foto propia, con su autor y licencia
- Ficha de cada jugador con su perfil, sus equipos y sus temporadas
- Páginas de equipos legendarios y de temporadas históricas
- Rutas propias para cada vista (`#/jugadores/cristiano-ronaldo/temporadas`): se pueden compartir y el botón "atrás" funciona
- Diseño responsive para dispositivos móviles y de escritorio

## Estructura del Proyecto

```
champions-league-app/
├── public/
│   ├── data/ranking.json        # Ranking de goleadores (generado automáticamente, no editar)
│   ├── data/assists.json        # Ranking de asistidores (generado automáticamente, no editar)
│   ├── data/photos.json         # Fotos descargadas de Commons y su crédito (generado automáticamente)
│   ├── data/players.json        # Fichas de jugador (se editan a mano)
│   ├── images/                  # Logos y fotos de jugadores
│   └── index.html
├── src/
│   ├── App.js                   # Layout y rutas
│   ├── index.js                 # Punto de entrada (HashRouter + PlayersProvider)
│   ├── index.css                # Estilos propios (efectos, tablas, animaciones)
│   ├── components/              # Cabecera, pie, avatar, paginación, marco de ficha...
│   ├── data/                    # Carga los JSON y une ranking.json con players.json
│   ├── pages/                   # Una página por ruta
│   └── utils/                   # Cálculos de estadísticas (con tests) y rutas de assets
├── scripts/                     # Actualización del ranking desde Wikipedia (con tests)
├── .github/workflows/           # Publicación y actualización automáticas
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
| `#/asistencias` | Ranking de asistidores |
| `#/equipos` | Equipos legendarios |
| `#/temporadas` | Temporadas históricas |

### Datos

Los datos se reparten en dos archivos que la app une por `id`:

| Archivo | Contenido | Quién lo mantiene |
|---|---|---|
| `public/data/ranking.json` | Top 10 histórico: goles, partidos, años, clubes y nación | El workflow **Actualizar datos**. No se edita a mano |
| `public/data/assists.json` | Top 10 histórico de asistencias y partidos | El workflow **Actualizar datos**. No se edita a mano |
| `public/data/photos.json` | Fotos de Wikimedia Commons de los jugadores sin foto en su ficha, con autor y licencia | El workflow **Actualizar datos**. No se edita a mano |
| `public/data/players.json` | Biografía, foto, fecha de nacimiento, finales, títulos, goles por equipo y temporadas | A mano |

El ranking decide qué jugadores aparecen y en qué orden. Si entra al top 10 un jugador sin ficha en `players.json`, aparece con los datos del ranking y el logo como foto. Para completarlo, añade su ficha con el mismo `id` (su nombre en minúsculas, sin tildes y con guiones; por ejemplo `kylian-mbappe`).

#### Formato de `public/data/players.json`

```json
{
  "id": "cristiano-ronaldo",
  "name": "Cristiano Ronaldo",
  "nationality": "Portugal",
  "birthdate": "05/02/1985",
  "image": "images/players/1.jpeg",
  "finals": 6, "titles": 5,
  "teams": [{ "name": "Real Madrid", "goals": 105 }],
  "biography": "...",
  "seasons": [{ "season": "2013-14", "club": "Real Madrid", "goals": 17, "matches": 11, "assists": 5, "title": true }]
}
```

- `id` se usa en la URL y debe ser único.
- `image` es relativa a `public/` (sin `/` inicial). Si falla, se muestra el logo.
- En `seasons`, `matches` y `assists` son opcionales: si faltan, la app muestra "-" y no los cuenta en los promedios.
- El orden del ranking se calcula a partir de los goles de `ranking.json`; los empates comparten posición.

## Instalación

```bash
npm install
npm start      # servidor de desarrollo
npm test       # tests de la app
npm run test:scripts  # tests del analizador de Wikipedia
npm run update-data     # descarga el ranking de goleadores
npm run update-assists  # descarga el ranking de asistidores
npm run update-photos   # descarga las fotos que faltan
npm run build  # build de producción
```

## Actualización automática de los datos

El workflow `.github/workflows/update-data.yml` se ejecuta todos los días a las 06:00 UTC:

1. `npm run update-data` descarga la tabla histórica de [List of UEFA Champions League top scorers](https://en.wikipedia.org/wiki/List_of_UEFA_Champions_League_top_scorers) y genera `public/data/ranking.json`.
2. `npm run update-assists` descarga la tabla de más asistencias de [UEFA Champions League records and statistics](https://en.wikipedia.org/wiki/UEFA_Champions_League_records_and_statistics) y genera `public/data/assists.json`. Como esa página tiene varias tablas con columna de asistencias, se usa la que tiene más filas.
3. `npm run update-photos` busca, para cada jugador de los rankings sin foto propia, la imagen principal de su artículo de Wikipedia. Si es un archivo de Wikimedia Commons (licencia libre), la descarga a `public/images/players/` y guarda autor y licencia en `public/data/photos.json`. Las imágenes que no son de Commons (por ejemplo, "fair use") se ignoran y el jugador sigue con el logo.
4. Si algo cambió, lo commitea en `master` y vuelve a publicar la app.

Para usar otra foto para un jugador, ponla en `public/images/players/` y añade `"image"` a su ficha en `players.json`: la foto de la ficha siempre tiene prioridad.

Los dos rankings son independientes: si uno falla, el otro se actualiza igualmente.

Para lanzarlo a mano: **Actions → Actualizar datos → Run workflow**.

Antes de guardar, el script comprueba los datos: al menos 10 jugadores, valores ordenados, un líder con al menos 30, ningún jugador que pierda más de 2 respecto al ranking anterior y, en goles, Cristiano Ronaldo presente. Si algo falla (por ejemplo, porque Wikipedia cambió el formato de la tabla), el workflow termina con error sin tocar los datos, y GitHub te avisa por email. El analizador está en `scripts/ranking-parser.js`.

Los datos de Wikipedia tienen licencia CC BY-SA, por eso la página cita la fuente. Las fotos de Commons muestran su autor y licencia en la ficha del jugador y al pasar el ratón por encima.

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
