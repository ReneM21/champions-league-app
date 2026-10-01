// Devuelve la URL de un archivo de /public.
// PUBLIC_URL vale '' en desarrollo y '/champions-league-app' en el build de
// GitHub Pages, así que las rutas nunca deben empezar por '/'.
export const asset = (path) => `${process.env.PUBLIC_URL}/${path}`;

export const LOGO = asset('images/logos/cc.png');
