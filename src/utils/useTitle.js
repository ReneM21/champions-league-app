import { useEffect } from 'react';

const SITE = 'Champions Stats';

// Título de la pestaña del navegador para cada página
export function useTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE}` : SITE;
  }, [title]);
}
