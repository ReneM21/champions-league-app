import { paginate, visiblePages } from './Pagination';

describe('Pagination', () => {
  it('visiblePages muestra la primera, la última y las vecinas', () => {
    expect(visiblePages(1, 3)).toEqual([1, 2, 3]);
    expect(visiblePages(5, 9)).toEqual([1, '…', 4, 5, 6, '…', 9]);
    expect(visiblePages(1, 9)).toEqual([1, 2, '…', 9]);
    expect(visiblePages(9, 9)).toEqual([1, '…', 8, 9]);
  });

  it('paginate corta la lista', () => {
    expect(paginate([1, 2, 3, 4, 5], 2, 2)).toEqual({ items: [3, 4], pageCount: 3 });
  });
});
