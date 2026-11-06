import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TextField from '../../src/components/TextField';

describe('T-C-2 TextField component', () => {
  it('shows an error message and red border when error is set', () => {
    render(
      <TextField
        label="Email"
        name="email"
        type="email"
        error="Enter a valid email address."
      />,
    );
    expect(
      screen.getByText('Enter a valid email address.'),
    ).toBeInTheDocument();
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-error');
  });

  it('keeps the typed text when there is an error', async () => {
    render(
      <TextField
        label="Email"
        name="email"
        type="email"
        error="Enter a valid email address."
      />,
    );
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'bad@');
    expect(input).toHaveValue('bad@');
  });

  it('password eye icon toggles visibility', async () => {
    render(<TextField label="Password" name="password" type="password" />);
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');

    const toggle = screen.getByRole('button', { name: /show password/i });
    await userEvent.click(toggle);
    expect(input).toHaveAttribute('type', 'text');

    await userEvent.click(toggle);
    expect(input).toHaveAttribute('type', 'password');
  });

  it('password toggle has an accessible label', () => {
    render(<TextField label="Password" name="password" type="password" />);
    expect(
      screen.getByRole('button', { name: /show password|hide password/i }),
    ).toBeInTheDocument();
  });
});
