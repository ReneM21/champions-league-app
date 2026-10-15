// Devuelve la URL de un archivo de /public.
// BASE_URL vale '/' en desarrollo y '/champions-league-app/' en el build de
// GitHub Pages (ver `base` en vite.config.mjs), así que las rutas nunca deben
// empezar por '/'.
export const asset = (path) => `${import.meta.env.BASE_URL}${path}`;

export const LOGO = asset('images/logos/cc.png');
