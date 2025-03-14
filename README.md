# Champions League Máximos Goleadores

Una aplicación web desarrollada con React y TailwindCSS que muestra información sobre los máximos goleadores históricos de la UEFA Champions League.

## Características

- Visualización de los máximos goleadores de la Champions League
- Diseño responsive para dispositivos móviles y de escritorio
- Interfaz de usuario moderna con TailwindCSS
- Animaciones y transiciones para mejorar la experiencia de usuario

## Estructura del Proyecto

```
champions-league-scorers/
├── public/
│   └── index.html
├── files/
│   ├── ChampionsLeagueFooter.js
│   ├── ChampionsLeagueScorers.js
│   ├── PlayerRow.js
│   ├── index.js
│   └── index.css
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## Instalación

1. Clona el repositorio
2. Instala las dependencias:

```bash
npm install
```

3. Inicia el servidor de desarrollo:

```bash
npm start
```

## Tecnologías Utilizadas

- React.js
- TailwindCSS para estilos
- JavaScript ES6+

## Desarrollo

Este proyecto está optimizado para ser desplegado utilizando GitHub Pages.

## Despliegue en GitHub Pages

Para desplegar esta aplicación en GitHub Pages, sigue estos pasos:

1. Asegúrate de tener Git instalado en tu sistema:
   - Descarga Git desde [git-scm.com](https://git-scm.com/downloads)
   - Instala siguiendo las instrucciones para tu sistema operativo

2. Crea un repositorio en GitHub:
   - Ve a [github.com](https://github.com/) y crea una cuenta si aún no tienes una
   - Haz clic en "New repository" y nombra tu repositorio "champions-league-app"
   - No inicialices el repositorio con ningún archivo

3. Desde la terminal, en la raíz de tu proyecto:
   ```bash
   # Inicializar un repositorio git local
   git init
   
   # Añadir todos los archivos al staging
   git add .
   
   # Hacer commit de los cambios
   git commit -m "Primera versión de Champions League App"
   
   # Conectar con el repositorio remoto (reemplaza ESTUDIANTE con tu nombre de usuario)
   git remote add origin https://github.com/Noult888/champions-league-app.git
   
   # Subir los archivos al repositorio remoto
   git push -u origin master
   ```

4. Desplegar en GitHub Pages:
   ```bash
   # Ejecutar el script de despliegue
   npm run deploy
   ```

5. Activar GitHub Pages en la configuración del repositorio:
   - Ve a la página de tu repositorio en GitHub
   - Haz clic en "Settings" > "Pages"
   - En "Source", selecciona la rama "gh-pages"
   - Haz clic en "Save"

Tu aplicación estará disponible en: https://Noult888.github.io/champions-league-app

## Notas importantes

- La primera vez que despliega, puede tardar unos minutos en estar disponible
- Después de cada actualización, ejecuta `npm run deploy` para actualizar el sitio
- La aplicación utiliza HashRouter para garantizar que las rutas funcionen correctamente en GitHub Pages

Para contribuir al proyecto:

1. Crea una nueva rama (`git checkout -b feature/nueva-caracteristica`)
2. Realiza tus cambios
3. Haz commit de tus cambios (`git commit -m 'Añadir nueva característica'`)
4. Realiza un push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request
