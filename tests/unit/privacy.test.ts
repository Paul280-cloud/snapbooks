import { readFileSync } from 'fs';
import { join } from 'path';

const html = (() => {
  try {
    return readFileSync(join(__dirname, '../../public/privacy.html'), 'utf-8');
  } catch {
    return '';
  }
})();

describe('T-S2-2 Privacy Notice (public/privacy.html)', () => {
  it('the file exists', () => {
    expect(html).not.toBe('');
  });

  it('states what data is collected', () => {
    expect(html).toMatch(/collect/i);
  });

  it('states the purpose / why data is used', () => {
    expect(html).toMatch(/purpose|why|in order to|so that/i);
  });

  it('states how long data is kept', () => {
    expect(html).toMatch(/retain|kept|storage period|how long/i);
  });

  it('states that deleting the account removes data', () => {
    expect(html).toMatch(/delet/i);
  });

  it('states the EU West region', () => {
    expect(html).toMatch(/eu west|west europe/i);
  });
});
