import fs from 'fs';
import path from 'path';
import tokens from '../../src/theme/tokens';

const css = fs.readFileSync(
  path.resolve(__dirname, '../../src/index.css'),
  'utf-8',
);

describe('T-SETUP-1 tokens.ts matches Section 7.1 and index.css has the same values', () => {
  it('color.primary is #1B7F4F and appears in index.css', () => {
    expect(tokens.color.primary).toBe('#1B7F4F');
    expect(css).toContain('#1B7F4F');
  });

  it('color.onPrimary is #FFFFFF and appears in index.css', () => {
    expect(tokens.color.onPrimary).toBe('#FFFFFF');
    expect(css).toContain('#FFFFFF');
  });

  it('color.accent is #F59E0B and appears in index.css', () => {
    expect(tokens.color.accent).toBe('#F59E0B');
    expect(css).toContain('#F59E0B');
  });

  it('color.background is #F9FAFB and appears in index.css', () => {
    expect(tokens.color.background).toBe('#F9FAFB');
    expect(css).toContain('#F9FAFB');
  });

  it('color.text is #111827 and appears in index.css', () => {
    expect(tokens.color.text).toBe('#111827');
    expect(css).toContain('#111827');
  });

  it('color.textSecondary is #6B7280 and appears in index.css', () => {
    expect(tokens.color.textSecondary).toBe('#6B7280');
    expect(css).toContain('#6B7280');
  });

  it('color.error is #DC2626 and appears in index.css', () => {
    expect(tokens.color.error).toBe('#DC2626');
    expect(css).toContain('#DC2626');
  });

  it('color.success is #16A34A and appears in index.css', () => {
    expect(tokens.color.success).toBe('#16A34A');
    expect(css).toContain('#16A34A');
  });

  it('color.warning is #D97706 and appears in index.css', () => {
    expect(tokens.color.warning).toBe('#D97706');
    expect(css).toContain('#D97706');
  });

  it('color.toastBackground equals color.text (#111827)', () => {
    expect(tokens.color.toastBackground).toBe(tokens.color.text);
    expect(tokens.color.toastBackground).toBe('#111827');
  });

  it('color.category.fuel is #F59E0B', () => {
    expect(tokens.color.category.fuel).toBe('#F59E0B');
  });

  it('font.title size is 24px and weight is 700', () => {
    expect(tokens.font.title.size).toBe('24px');
    expect(tokens.font.title.weight).toBe('700');
    expect(css).toContain('24px');
  });

  it('font.heading size is 18px and weight is 600', () => {
    expect(tokens.font.heading.size).toBe('18px');
    expect(tokens.font.heading.weight).toBe('600');
    expect(css).toContain('18px');
  });

  it('font.body size is 16px', () => {
    expect(tokens.font.body.size).toBe('16px');
    expect(css).toContain('16px');
  });

  it('font.small size is 13px', () => {
    expect(tokens.font.small.size).toBe('13px');
    expect(css).toContain('13px');
  });

  it('spacing tokens are correct', () => {
    expect(tokens.space[1]).toBe('4px');
    expect(tokens.space[2]).toBe('8px');
    expect(tokens.space[3]).toBe('16px');
    expect(tokens.space[4]).toBe('24px');
    expect(tokens.space[5]).toBe('32px');
  });

  it('screen margin tokens are correct', () => {
    expect(tokens.space.screen.mobile).toBe('16px');
    expect(tokens.space.screen.tablet).toBe('32px');
    expect(tokens.space.screen.desktop).toBe('24px');
  });

  it('radius tokens are correct', () => {
    expect(tokens.radius.card).toBe('8px');
    expect(tokens.radius.input).toBe('6px');
    expect(tokens.radius.button).toBe('6px');
  });

  it('shadow.card is correct', () => {
    expect(tokens.shadow.card).toBe('0 1px 3px rgba(0,0,0,0.1)');
  });

  it('size.button is 48px', () => {
    expect(tokens.size.button).toBe('48px');
    expect(css).toContain('48px');
  });

  it('size.touchMin is 44px', () => {
    expect(tokens.size.touchMin).toBe('44px');
    expect(css).toContain('44px');
  });

  it('size.contentMax is 1200px', () => {
    expect(tokens.size.contentMax).toBe('1200px');
    expect(css).toContain('1200px');
  });

  it('breakpoints are correct', () => {
    expect(tokens.bp.mobile).toBe('640px');
    expect(tokens.bp.desktop).toBe('1024px');
  });

  it('focus.ring references color.primary', () => {
    expect(tokens.focus.ring).toContain('#1B7F4F');
  });
});
