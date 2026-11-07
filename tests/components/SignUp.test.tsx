import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import SignUp from '../../src/pages/SignUp';

jest.mock('../../src/lib/api/auth', () => ({
  signUp: jest.fn(),
}));

import { signUp as mockSignUpFn } from '../../src/lib/api/auth';
const mockSignUp = mockSignUpFn as jest.Mock;

function makeRouter() {
  return createMemoryRouter(
    [
      { path: '/sign-up', element: <SignUp /> },
      { path: '/log-in', element: <div data-testid="log-in-page" /> },
    ],
    { initialEntries: ['/sign-up'] },
  );
}

function fillValidForm() {
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'new@example.com' },
  });
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: 'password1' },
  });
  fireEvent.click(screen.getByLabelText('I am 18 or older'));
  fireEvent.click(screen.getByLabelText(/i agree to the privacy notice/i));
}

describe('SignUp (S2)', () => {
  beforeEach(() => mockSignUp.mockReset());

  it('T-US1-1 navigates to /log-in after a successful sign up', async () => {
    mockSignUp.mockResolvedValueOnce({ error: null });
    render(<RouterProvider router={makeRouter()} />);
    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    await waitFor(() =>
      expect(screen.getByTestId('log-in-page')).toBeInTheDocument(),
    );
  });

  it('T-US1-2 shows already-registered error with a Log in link', async () => {
    mockSignUp.mockResolvedValueOnce({ error: 'already_registered' });
    render(<RouterProvider router={makeRouter()} />);
    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    await waitFor(() =>
      expect(
        screen.getByText(/this email already has an account/i),
      ).toBeInTheDocument(),
    );
    const logInLinks = screen.getAllByRole('link', { name: /log in/i });
    expect(logInLinks.length).toBeGreaterThan(0);
  });

  it('T-US1-3 sign up button is disabled when checkboxes are unticked', () => {
    render(<RouterProvider router={makeRouter()} />);
    expect(screen.getByRole('button', { name: /sign up/i })).toBeDisabled();
  });

  it('T-US1-3 sign up button is disabled when password has no digit', () => {
    render(<RouterProvider router={makeRouter()} />);
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'a@b.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'abcdefgh' },
    });
    fireEvent.click(screen.getByLabelText('I am 18 or older'));
    fireEvent.click(screen.getByLabelText(/i agree to the privacy notice/i));
    expect(screen.getByRole('button', { name: /sign up/i })).toBeDisabled();
  });

  it('T-S2-1 password error shows on blur when password is weak', () => {
    render(<RouterProvider router={makeRouter()} />);
    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(passwordInput, { target: { value: 'abc1' } });
    fireEvent.blur(passwordInput);
    expect(
      screen.getByText(/at least 8 characters, including a number/i),
    ).toBeInTheDocument();
  });

  it('T-S2-1 loading state shows a spinner on the button', async () => {
    let resolve!: (v: { error: null }) => void;
    mockSignUp.mockReturnValueOnce(
      new Promise<{ error: null }>((r) => (resolve = r)),
    );
    render(<RouterProvider router={makeRouter()} />);
    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(await screen.findByTestId('button-spinner')).toBeInTheDocument();
    resolve({ error: null });
  });

  it('T-S2-1 bottom "Log in" link goes to /log-in', () => {
    render(<RouterProvider router={makeRouter()} />);
    const links = screen.getAllByRole('link', { name: /log in/i });
    expect(links.some((l) => l.getAttribute('href') === '/log-in')).toBe(true);
  });
});
