import { validateReceipt } from '../../src/lib/rules/receipt';

const VALID = {
  vendor: 'Pick n Pay',
  amount: '149.00',
  date: '2026-03-12',
  category: 'Food',
};

describe('T-BR1-1 validateReceipt', () => {
  it('accepts a valid receipt and returns no errors', () => {
    expect(validateReceipt(VALID)).toEqual({});
  });

  it('returns "Enter a vendor name." for empty vendor', () => {
    expect(validateReceipt({ ...VALID, vendor: '' })).toMatchObject({
      vendor: 'Enter a vendor name.',
    });
  });

  it('returns "Enter a vendor name." for whitespace-only vendor', () => {
    expect(validateReceipt({ ...VALID, vendor: '   ' })).toMatchObject({
      vendor: 'Enter a vendor name.',
    });
  });

  it('returns "Enter a rand amount, e.g. 89.99." for empty amount', () => {
    expect(validateReceipt({ ...VALID, amount: '' })).toMatchObject({
      amount: 'Enter a rand amount, e.g. 89.99.',
    });
  });

  it('returns "Enter a rand amount, e.g. 89.99." for a non-numeric amount', () => {
    expect(validateReceipt({ ...VALID, amount: 'abc' })).toMatchObject({
      amount: 'Enter a rand amount, e.g. 89.99.',
    });
  });

  it('returns "Enter a rand amount, e.g. 89.99." for a negative amount', () => {
    expect(validateReceipt({ ...VALID, amount: '-5' })).toMatchObject({
      amount: 'Enter a rand amount, e.g. 89.99.',
    });
  });

  it('returns "Enter a rand amount, e.g. 89.99." for zero amount', () => {
    expect(validateReceipt({ ...VALID, amount: '0' })).toMatchObject({
      amount: 'Enter a rand amount, e.g. 89.99.',
    });
  });

  it('returns "Enter a date that is not in the future." for a future date', () => {
    expect(validateReceipt({ ...VALID, date: '2099-12-31' })).toMatchObject({
      date: 'Enter a date that is not in the future.',
    });
  });

  it('returns "Enter a date that is not in the future." for empty date', () => {
    expect(validateReceipt({ ...VALID, date: '' })).toMatchObject({
      date: 'Enter a date that is not in the future.',
    });
  });

  it('returns "Select a category." for empty category', () => {
    expect(validateReceipt({ ...VALID, category: '' })).toMatchObject({
      category: 'Select a category.',
    });
  });

  it('returns "Select a category." for an invalid category', () => {
    expect(validateReceipt({ ...VALID, category: 'Travel' })).toMatchObject({
      category: 'Select a category.',
    });
  });

  it('can return errors for all four fields at once', () => {
    const errors = validateReceipt({ vendor: '', amount: '', date: '', category: '' });
    expect(Object.keys(errors)).toHaveLength(4);
  });
});
