// Devuelve la URL de un archivo de /public.
// BASE_URL vale '/' en desarrollo y '/champions-league-app/' en el build de
// GitHub Pages (ver `base` en vite.config.mjs), así que las rutas nunca deben
// empezar por '/'.
export const asset = (path) => `${import.meta.env.BASE_URL}${path}`;

// Logo actual de la UEFA Champions League (azul sobre transparente). En fondos
// oscuros se pinta en blanco con las clases `brightness-0 invert`.
export const LOGO = asset('images/logos/ucl-logo.png');
// Solo el balón de estrellas, para los huecos pequeños donde el texto no se lee
export const STARBALL = asset('images/logos/ucl-starball.png');
