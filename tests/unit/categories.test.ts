import { CATEGORIES } from '../../src/lib/rules/categories';

describe('T-BR2-1 category list', () => {
  it('is exactly Food, Stock, Fuel, Rent, Other in that order', () => {
    expect(CATEGORIES).toStrictEqual(['Food', 'Stock', 'Fuel', 'Rent', 'Other']);
  });

  it('has exactly 5 categories', () => {
    expect(CATEGORIES).toHaveLength(5);
  });
});
