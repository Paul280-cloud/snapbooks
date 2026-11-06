import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Checkbox from '../../src/components/Checkbox';

describe('T-C-4 Checkbox component', () => {
  it('is unticked by default', () => {
    render(
      <Checkbox name="age" checked={false} onChange={() => undefined}>
        I am 18 or older
      </Checkbox>,
    );
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('toggles on click', async () => {
    let checked = false;
    const { rerender } = render(
      <Checkbox
        name="age"
        checked={checked}
        onChange={() => {
          checked = !checked;
        }}
      >
        I am 18 or older
      </Checkbox>,
    );
    await userEvent.click(screen.getByRole('checkbox'));
    rerender(
      <Checkbox name="age" checked={true} onChange={() => undefined}>
        I am 18 or older
      </Checkbox>,
    );
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('a link inside the label opens without toggling the checkbox', async () => {
    const handleChange = jest.fn();
    render(
      <Checkbox name="privacy" checked={false} onChange={handleChange}>
        I agree to the{' '}
        <a href="/privacy" target="_blank" rel="noreferrer">
          Privacy Notice
        </a>
      </Checkbox>,
    );
    const link = screen.getByRole('link', { name: 'Privacy Notice' });
    await userEvent.click(link);
    expect(handleChange).not.toHaveBeenCalled();
  });
});
