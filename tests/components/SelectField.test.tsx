import { render, screen } from '@testing-library/react';
import SelectField from '../../src/components/SelectField';

const CATEGORIES = ['Food', 'Stock', 'Fuel', 'Rent', 'Other'];

describe('T-C-3 SelectField component', () => {
  it('shows its options', () => {
    render(
      <SelectField
        label="Category"
        name="category"
        options={CATEGORIES}
        value=""
        onChange={() => undefined}
      />,
    );
    CATEGORIES.forEach((cat) => {
      expect(screen.getByRole('option', { name: cat })).toBeInTheDocument();
    });
  });

  it('shows the chosen value', () => {
    render(
      <SelectField
        label="Category"
        name="category"
        options={CATEGORIES}
        value="Fuel"
        onChange={() => undefined}
      />,
    );
    expect(screen.getByDisplayValue('Fuel')).toBeInTheDocument();
  });

  it('shows an error message', () => {
    render(
      <SelectField
        label="Category"
        name="category"
        options={CATEGORIES}
        value=""
        onChange={() => undefined}
        error="Select a category."
      />,
    );
    expect(screen.getByText('Select a category.')).toBeInTheDocument();
  });
});
