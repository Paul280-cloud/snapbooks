import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../../src/components/Button';

describe('T-C-1 Button component', () => {
  it('renders a primary button', () => {
    render(<Button variant="primary">Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('renders a secondary button', () => {
    render(<Button variant="secondary">Cancel</Button>);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('renders a danger button', () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('a disabled button cannot be pressed', async () => {
    const handleClick = jest.fn();
    render(
      <Button variant="primary" disabled onClick={handleClick}>
        Save
      </Button>,
    );
    const btn = screen.getByRole('button', { name: 'Save' });
    expect(btn).toBeDisabled();
    await userEvent.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('loading state shows a spinner and blocks presses', async () => {
    const handleClick = jest.fn();
    render(
      <Button variant="primary" loading onClick={handleClick}>
        Save
      </Button>,
    );
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('button-spinner')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('button height is 48px', () => {
    render(<Button variant="primary">Save</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveStyle({ height: '48px' });
  });

  it('shows a focus ring on keyboard focus', async () => {
    render(
      <div>
        <Button variant="primary">Save</Button>
      </div>,
    );
    const btn = screen.getByRole('button');
    await userEvent.tab();
    expect(btn).toHaveFocus();
    expect(btn.className).toMatch(/focus/);
  });
});
