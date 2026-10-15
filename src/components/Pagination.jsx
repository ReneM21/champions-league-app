import React from 'react';

const Pagination = ({ page, pageCount, onChange }) => {
  if (pageCount <= 1) return null;

  const buttonClass = (active) =>
    `w-10 h-10 rounded-full flex items-center justify-center ${
      active ? 'bg-champions-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`;

  return (
    <div className="flex justify-center mt-10 space-x-2">
      {Array.from({ length: pageCount }, (_, idx) => (
        <button key={idx} className={buttonClass(page === idx + 1)} onClick={() => onChange(idx + 1)}>
          {idx + 1}
        </button>
      ))}
      {page < pageCount && (
        <button className={buttonClass(false)} onClick={() => onChange(page + 1)} aria-label="Página siguiente">
          →
        </button>
      )}
    </div>
  );
};

export const paginate = (items, page, perPage) => ({
  items: items.slice((page - 1) * perPage, page * perPage),
  pageCount: Math.ceil(items.length / perPage),
});

export default Pagination;
