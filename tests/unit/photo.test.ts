import { validatePhoto } from '../../src/lib/rules/photo';

const UNDER_10MB = 10_485_759;  // 10 MB − 1 byte → accepted
const EXACTLY_10MB = 10_485_760; // exactly 10 MB → rejected

function makeFile(size: number, type: string, name: string): File {
  const content = new Uint8Array(size);
  return new File([content], name, { type });
}

describe('T-BR3-1 validatePhoto', () => {
  it('accepts a JPG file under 10 MB', () => {
    expect(validatePhoto(makeFile(UNDER_10MB, 'image/jpeg', 'receipt.jpg'))).toBe(true);
  });

  it('accepts a PNG file under 10 MB', () => {
    expect(validatePhoto(makeFile(UNDER_10MB, 'image/png', 'receipt.png'))).toBe(true);
  });

  it('accepts a WebP file under 10 MB', () => {
    expect(validatePhoto(makeFile(UNDER_10MB, 'image/webp', 'receipt.webp'))).toBe(true);
  });

  it('accepts 10 485 759 bytes (one byte under 10 MB)', () => {
    expect(validatePhoto(makeFile(10_485_759, 'image/jpeg', 'receipt.jpg'))).toBe(true);
  });

  it('rejects a file of exactly 10 MB (10 485 760 bytes)', () => {
    expect(validatePhoto(makeFile(EXACTLY_10MB, 'image/jpeg', 'receipt.jpg'))).toBe(false);
  });

  it('rejects a GIF', () => {
    expect(validatePhoto(makeFile(1000, 'image/gif', 'receipt.gif'))).toBe(false);
  });

  it('rejects a PDF', () => {
    expect(validatePhoto(makeFile(1000, 'application/pdf', 'receipt.pdf'))).toBe(false);
  });

  it('rejects a text file', () => {
    expect(validatePhoto(makeFile(1000, 'text/plain', 'receipt.txt'))).toBe(false);
  });

  it('rejects a file with JPEG MIME but .gif extension', () => {
    expect(validatePhoto(makeFile(1000, 'image/jpeg', 'receipt.gif'))).toBe(false);
  });

  it('rejects a file with GIF MIME but .jpg extension', () => {
    expect(validatePhoto(makeFile(1000, 'image/gif', 'receipt.jpg'))).toBe(false);
  });
});
