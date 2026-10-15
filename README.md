# Champions League Máximos Goleadores

Una aplicación web desarrollada con React, [HeroUI](https://heroui.com) y Tailwind CSS que muestra información sobre los máximos goleadores históricos de la UEFA Champions League.

## Características

- Ranking de los máximos goleadores de la Champions League, actualizado automáticamente cada día desde Wikipedia
- Ranking de los máximos asistidores, actualizado de la misma forma
- Fotos de Wikimedia Commons para los jugadores sin foto propia, con su autor y licencia
- Ficha de cada jugador con su perfil, sus equipos y sus temporadas
- Páginas de equipos legendarios y de temporadas históricas
- Rutas propias para cada vista (`#/jugadores/cristiano-ronaldo/temporadas`): se pueden compartir y el botón "atrás" funciona
- Diseño responsive para dispositivos móviles y de escritorio, con modo claro y oscuro

## Estructura del Proyecto

```
champions-league-app/
├── public/
│   ├── data/ranking.json        # Ranking de goleadores (generado automáticamente, no editar)
│   ├── data/assists.json        # Ranking de asistidores (generado automáticamente, no editar)
│   ├── data/photos.json         # Fotos descargadas de Commons y su crédito (generado automáticamente)
│   ├── data/profiles.json       # Fichas automáticas: biografía, nacimiento y posición (generado)
│   ├── data/all-goals.json      # Tabla completa de goleadores (generado)
│   ├── data/all-assists.json    # Tabla completa de asistidores (generado)
│   ├── data/players.json        # Fichas de jugador (se editan a mano)
│   ├── images/                  # Logos y fotos de jugadores
│   └── index.html
├── src/
│   ├── App.jsx                  # Layout y rutas
│   ├── main.jsx                 # Punto de entrada (HashRouter + RouterProvider de HeroUI + PlayersProvider)
│   ├── index.css                # Tailwind, estilos de HeroUI, tema y efectos propios
│   ├── components/              # Cabecera, pie, avatar, tabla de ranking, selector, paginación...
│   ├── data/                    # Carga los JSON y une ranking.json con players.json
│   ├── pages/                   # Una página por ruta
│   └── utils/                   # Cálculos de estadísticas (con tests) y rutas de assets
├── scripts/                     # Actualización del ranking desde Wikipedia (con tests)
├── .github/workflows/           # Publicación y actualización automáticas
├── package.json
├── index.html                   # Página de entrada de Vite
└── vite.config.mjs              # Vite: base de GitHub Pages, build en build/ y Vitest
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
| `public/data/profiles.json` | Ficha automática de cada jugador de los rankings: biografía (Wikipedia en español), nacimiento y posición (Wikidata) | El workflow **Actualizar datos**. No se edita a mano |
| `public/data/all-goals.json`, `all-assists.json` | Tablas completas de Wikipedia, para conocer los goles de un asistidor y viceversa | El workflow **Actualizar datos** |
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

#### Cómo rellenar títulos y temporadas

Los jugadores que entraron en los rankings de forma automática tienen en `players.json` una plantilla vacía, por ejemplo:

```json
{
  "id": "ryan-giggs",
  "name": "Ryan Giggs",
  "titles": null,
  "finals": null,
  "teams": [],
  "seasons": []
}
```

Rellena solo lo que sepas: lo que se quede en `null` o vacío se muestra como "-" en la ficha. Biografía, fecha de nacimiento, posición y foto ya llegan solas (fichas automáticas y fotos de Commons); si las escribes aquí, lo tuyo tiene prioridad.

| Campo | Qué poner | Ejemplo |
|---|---|---|
| `titles` | Champions League ganadas (número, sin comillas) | `2` |
| `finals` | Finales disputadas (no puede ser menor que `titles`) | `4` |
| `teams` | Goles en la Champions por club; activa la pestaña Equipos con porcentajes | `[{ "name": "Manchester United", "goals": 29 }]` |
| `seasons` | Una línea por temporada; activa la pestaña Temporadas | ver abajo |

Cada temporada (las cifras de los ejemplos de esta sección son inventadas, solo muestran el formato):

```json
{ "season": "2007-08", "club": "Manchester United", "goals": 1, "matches": 9, "assists": 3, "title": true }
```

- `season` con el formato `2007-08` (año de inicio, guion, dos cifras del año siguiente).
- `goals` es obligatorio; `matches` y `assists` son opcionales (si no los sabes, no los pongas).
- `"title": true` solo en las temporadas en que ganó la Champions. El número de temporadas con `title` no puede superar `titles`.
- Los números van sin comillas y no puede quedar una coma después del último elemento de una lista.

**Para editarlo desde GitHub sin instalar nada:** abre `public/data/players.json` en el repositorio, pulsa el lápiz (*Edit this file*), cambia los datos y pulsa *Commit changes* en `master`. Al guardar se ejecutan los tests: si algo está mal escrito, el despliegue se detiene y en la pestaña **Actions** el error dice exactamente qué jugador y qué temporada revisar (por ejemplo, `ryan-giggs: seasons[3] (2007/08): "season" debe tener el formato "2013-14"`). Si todo está bien, la web se actualiza en un par de minutos.

## Instalación

```bash
npm install
npm run dev    # servidor de desarrollo (Vite)
npm test       # tests de la app
npm run test:scripts  # tests del analizador de Wikipedia
npm run update-data     # descarga el ranking de goleadores
npm run update-assists  # descarga el ranking de asistidores
npm run update-photos   # descarga las fotos que faltan
npm run update-profiles # crea las fichas automáticas que faltan
npm run build  # build de producción
```

## Actualización automática de los datos

El workflow `.github/workflows/update-data.yml` se ejecuta todos los días a las 06:00 UTC:

1. `npm run update-data` descarga la tabla histórica de [List of UEFA Champions League top scorers](https://en.wikipedia.org/wiki/List_of_UEFA_Champions_League_top_scorers) y genera `public/data/ranking.json`.
2. `npm run update-assists` descarga la tabla de más asistencias de [UEFA Champions League records and statistics](https://en.wikipedia.org/wiki/UEFA_Champions_League_records_and_statistics) y genera `public/data/assists.json`. Como esa página tiene varias tablas con columna de asistencias, se usa la que tiene más filas.
3. `npm run update-photos` busca, para cada jugador de los rankings sin foto propia, la imagen principal de su artículo de Wikipedia. Si es un archivo de Wikimedia Commons (licencia libre), la descarga a `public/images/players/` y guarda autor y licencia en `public/data/photos.json`. Las imágenes que no son de Commons (por ejemplo, "fair use") se ignoran y el jugador sigue con el logo.
4. `npm run update-profiles` crea la ficha automática de cada jugador de los rankings que no la tenga: la introducción de su artículo en la Wikipedia en español como biografía, y su fecha de nacimiento y posición de Wikidata. Todos los jugadores de los dos rankings tienen así su página. Lo escrito a mano en `players.json` siempre tiene prioridad.
5. Si algo cambió, lo commitea en `master` y vuelve a publicar la app.

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

- React 19 y React Router 7
- [HeroUI v3](https://heroui.com) (sobre React Aria): Table, Card, Avatar, Select, Pagination, Chip, Alert, ProgressBar, Button, Link, Spinner y useTheme
- Tailwind CSS 4
- Vite y Vitest

### Estilos, tema y modo oscuro

- La interfaz usa los colores semánticos de HeroUI (`bg-background`, `bg-surface`, `text-foreground`, `text-muted`, `text-accent`…), así que cada componente cambia solo entre modo claro y oscuro. No uses colores fijos como `text-gray-500` o `bg-white`.
- El color de acento de HeroUI (`--accent`) es el azul Champions en claro y un azul más luminoso en oscuro; está en `src/index.css`. El dorado (`champions-gold`) y el fondo de portada (`.champions-hero`) son iguales en los dos temas.
- El botón de la cabecera (`ThemeToggle`) usa `useTheme` de HeroUI: por defecto sigue el tema del sistema y guarda la elección en `localStorage` (`heroui-theme`). Un script en `index.html` aplica el tema antes de pintar para que no parpadee.
- `@import "@heroui/styles"` tiene que ir siempre después de `@import "tailwindcss"`.
- Los enlaces de navegación que no son componentes de HeroUI usan su aspecto con `buttonVariants` (cabecera y pestañas de la ficha).
