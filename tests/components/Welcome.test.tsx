import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Welcome from '../../src/pages/Welcome';

describe('T-S1-1 Welcome screen (S1)', () => {
  const renderWelcome = () =>
    render(
      <MemoryRouter>
        <Welcome />
      </MemoryRouter>,
    );

  it('shows the SnapBooks wordmark', () => {
    renderWelcome();
    expect(screen.getByText('SnapBooks')).toBeInTheDocument();
  });

  it('shows a camera icon', () => {
    renderWelcome();
    expect(screen.getByTestId('camera-icon')).toBeInTheDocument();
  });

  it('shows the tagline "Snap receipts. Survive tax season."', () => {
    renderWelcome();
    expect(
      screen.getByText('Snap receipts. Survive tax season.'),
    ).toBeInTheDocument();
  });

  it('shows the "Create account" button linking to /sign-up', () => {
    renderWelcome();
    const btn = screen.getByRole('link', { name: 'Create account' });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('href', '/sign-up');
  });

  it('shows the "Log in" link to /log-in', () => {
    renderWelcome();
    const link = screen.getByRole('link', { name: 'Log in' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/log-in');
  });
});
