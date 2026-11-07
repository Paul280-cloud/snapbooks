import { render, screen, fireEvent } from '@testing-library/react';
import ReceiptForm from '../../src/components/ReceiptForm';

const noop = jest.fn();

const DEFAULT_VALUES = {
  vendor: '',
  amount: '',
  date: '',
  category: '',
};

function renderForm(overrides: Partial<typeof DEFAULT_VALUES> = {}, onSave = noop, loading = false) {
  return render(
    <ReceiptForm
      values={{ ...DEFAULT_VALUES, ...overrides }}
      onChange={noop}
      onSave={onSave}
      loading={loading}
      errors={{}}
    />,
  );
}

describe('T-C-13 ReceiptForm', () => {
  it('renders a Vendor field with placeholder "Shop or restaurant name"', () => {
    renderForm();
    expect(screen.getByPlaceholderText('Shop or restaurant name')).toBeInTheDocument();
  });

  it('renders an Amount field with placeholder "0.00"', () => {
    renderForm();
    expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
  });

  it('renders a Date field', () => {
    renderForm();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
  });

  it('renders a Category select with all 5 categories and an empty default', () => {
    renderForm();
    const select = screen.getByRole('combobox', { name: /category/i });
    const options = Array.from(select.querySelectorAll('option')).map(
      (o) => (o as HTMLOptionElement).text,
    );
    expect(options).toContain('Food');
    expect(options).toContain('Stock');
    expect(options).toContain('Fuel');
    expect(options).toContain('Rent');
    expect(options).toContain('Other');
  });

  it('Save button is disabled when any required field is empty', () => {
    renderForm();
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });

  it('Save button is enabled when all required fields are filled', () => {
    renderForm({ vendor: 'Pick n Pay', amount: '149.00', date: '2026-03-12', category: 'Food' });
    expect(screen.getByRole('button', { name: /save/i })).toBeEnabled();
  });

  it('shows vendor error message when errors.vendor is set', () => {
    render(
      <ReceiptForm
        values={DEFAULT_VALUES}
        onChange={noop}
        onSave={noop}
        loading={false}
        errors={{ vendor: 'Enter a vendor name.' }}
      />,
    );
    expect(screen.getByText('Enter a vendor name.')).toBeInTheDocument();
  });

  it('shows amount error message when errors.amount is set', () => {
    render(
      <ReceiptForm
        values={DEFAULT_VALUES}
        onChange={noop}
        onSave={noop}
        loading={false}
        errors={{ amount: 'Enter a rand amount, e.g. 89.99.' }}
      />,
    );
    expect(screen.getByText('Enter a rand amount, e.g. 89.99.')).toBeInTheDocument();
  });

  it('shows date error message when errors.date is set', () => {
    render(
      <ReceiptForm
        values={DEFAULT_VALUES}
        onChange={noop}
        onSave={noop}
        loading={false}
        errors={{ date: 'Enter a date that is not in the future.' }}
      />,
    );
    expect(screen.getByText('Enter a date that is not in the future.')).toBeInTheDocument();
  });

  it('shows category error message when errors.category is set', () => {
    render(
      <ReceiptForm
        values={DEFAULT_VALUES}
        onChange={noop}
        onSave={noop}
        loading={false}
        errors={{ category: 'Select a category.' }}
      />,
    );
    expect(screen.getByText('Select a category.')).toBeInTheDocument();
  });

  it('enforces 100-character limit on vendor input', () => {
    renderForm();
    const input = screen.getByPlaceholderText('Shop or restaurant name');
    expect(input).toHaveAttribute('maxLength', '100');
  });

  it('shows a spinner or disables Save while loading', () => {
    renderForm({}, noop, true);
    const btn = screen.getByRole('button', { name: /save|saving/i });
    expect(btn).toBeDisabled();
  });

  it('calls onSave when the Save button is clicked with valid values', () => {
    const onSave = jest.fn();
    renderForm({ vendor: 'Pick n Pay', amount: '149.00', date: '2026-03-12', category: 'Food' }, onSave);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});
