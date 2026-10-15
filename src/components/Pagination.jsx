import React from 'react';
import { Pagination as HeroPagination } from '@heroui/react';

// Páginas a mostrar: la primera, la última y las vecinas de la actual, con
// "…" en los huecos (1 … 4 5 6 … 9), para que quepa en el móvil
export function visiblePages(page, pageCount) {
  const pages = [];
  for (let p = 1; p <= pageCount; p++) {
    if (p === 1 || p === pageCount || Math.abs(p - page) <= 1) pages.push(p);
    else if (pages[pages.length - 1] !== '…') pages.push('…');
  }
  return pages;
}

// Paginación de HeroUI. No se muestra si solo hay una página.
const Pagination = ({ page, pageCount, onChange }) => {
  if (pageCount <= 1) return null;

  return (
    <HeroPagination className="mt-10 justify-center">
      <HeroPagination.Content>
        <HeroPagination.Item>
          <HeroPagination.Previous isDisabled={page === 1} onPress={() => onChange(page - 1)}>
            <HeroPagination.PreviousIcon />
            <span className="hidden sm:inline">Anterior</span>
          </HeroPagination.Previous>
        </HeroPagination.Item>
        {visiblePages(page, pageCount).map((p, idx) =>
          p === '…' ? (
            <HeroPagination.Item key={`gap-${idx}`}>
              <HeroPagination.Ellipsis />
            </HeroPagination.Item>
          ) : (
            <HeroPagination.Item key={p}>
              <HeroPagination.Link isActive={page === p} onPress={() => onChange(p)}>
                {p}
              </HeroPagination.Link>
            </HeroPagination.Item>
          )
        )}
        <HeroPagination.Item>
          <HeroPagination.Next isDisabled={page === pageCount} onPress={() => onChange(page + 1)}>
            <span className="hidden sm:inline">Siguiente</span>
            <HeroPagination.NextIcon />
          </HeroPagination.Next>
        </HeroPagination.Item>
      </HeroPagination.Content>
    </HeroPagination>
  );
};

export const paginate = (items, page, perPage) => ({
  items: items.slice((page - 1) * perPage, page * perPage),
  pageCount: Math.ceil(items.length / perPage),
});

export default Pagination;
