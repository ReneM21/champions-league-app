import React from 'react';
import { Pagination as HeroPagination } from '@heroui/react';

// Paginación de HeroUI. No se muestra si solo hay una página.
const Pagination = ({ page, pageCount, onChange }) => {
  if (pageCount <= 1) return null;

  return (
    <HeroPagination className="mt-10 justify-center">
      <HeroPagination.Content>
        <HeroPagination.Item>
          <HeroPagination.Previous isDisabled={page === 1} onPress={() => onChange(page - 1)}>
            <HeroPagination.PreviousIcon />
            <span>Anterior</span>
          </HeroPagination.Previous>
        </HeroPagination.Item>
        {Array.from({ length: pageCount }, (_, idx) => (
          <HeroPagination.Item key={idx}>
            <HeroPagination.Link isActive={page === idx + 1} onPress={() => onChange(idx + 1)}>
              {idx + 1}
            </HeroPagination.Link>
          </HeroPagination.Item>
        ))}
        <HeroPagination.Item>
          <HeroPagination.Next isDisabled={page === pageCount} onPress={() => onChange(page + 1)}>
            <span>Siguiente</span>
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
