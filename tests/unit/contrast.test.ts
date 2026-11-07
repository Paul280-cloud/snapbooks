// T-NFR-4: Every text/background colour pair used in the app passes WCAG 4.5:1
// Colors from src/theme/tokens.ts and Tailwind classes used throughout the app.

function linearize(val: number): number {
  const v = val / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const r = linearize(parseInt(hex.slice(1, 3), 16));
  const g = linearize(parseInt(hex.slice(3, 5), 16));
  const b = linearize(parseInt(hex.slice(5, 7), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(hex1: string, hex2: string): number {
  const l1 = Math.max(luminance(hex1), luminance(hex2));
  const l2 = Math.min(luminance(hex1), luminance(hex2));
  return (l1 + 0.05) / (l2 + 0.05);
}

const THRESHOLD = 4.5;

// App colour tokens
const PRIMARY   = '#1B7F4F'; // primary brand green
const ERROR     = '#DC2626'; // red — form errors and danger buttons
const TEXT      = '#111827'; // primary text, toast background
const TEXT_2ND  = '#6B7280'; // secondary/muted text
const BG_PAGE   = '#F9FAFB'; // page background
const BG_WHITE  = '#FFFFFF'; // card / modal background
const WHITE     = '#FFFFFF';

describe('T-NFR-4 WCAG contrast ≥ 4.5:1', () => {
  it('primary text (#111827) on page background (#F9FAFB)', () => {
    expect(contrast(TEXT, BG_PAGE)).toBeGreaterThanOrEqual(THRESHOLD);
  });

  it('primary text (#111827) on white card background', () => {
    expect(contrast(TEXT, BG_WHITE)).toBeGreaterThanOrEqual(THRESHOLD);
  });

  it('secondary text (#6B7280) on page background', () => {
    expect(contrast(TEXT_2ND, BG_PAGE)).toBeGreaterThanOrEqual(THRESHOLD);
  });

  it('secondary text (#6B7280) on white card background', () => {
    expect(contrast(TEXT_2ND, BG_WHITE)).toBeGreaterThanOrEqual(THRESHOLD);
  });

  it('white on primary (#1B7F4F) — primary buttons', () => {
    expect(contrast(WHITE, PRIMARY)).toBeGreaterThanOrEqual(THRESHOLD);
  });

  it('white on error (#DC2626) — danger buttons', () => {
    expect(contrast(WHITE, ERROR)).toBeGreaterThanOrEqual(THRESHOLD);
  });

  it('error text (#DC2626) on white card background — inline errors', () => {
    expect(contrast(ERROR, BG_WHITE)).toBeGreaterThanOrEqual(THRESHOLD);
  });

  it('white on toast background (#111827)', () => {
    expect(contrast(WHITE, TEXT)).toBeGreaterThanOrEqual(THRESHOLD);
  });
});
