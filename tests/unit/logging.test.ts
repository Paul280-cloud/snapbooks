// T-NFR-7: No production code in src/ logs passwords, tokens, emails or receipt contents.
import * as fs from 'fs';
import * as path from 'path';

function readAllSrc(dir: string): Array<{ file: string; content: string }> {
  const results: Array<{ file: string; content: string }> = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...readAllSrc(full));
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      results.push({
        file: path.relative(path.join(__dirname, '../../src'), full),
        content: fs.readFileSync(full, 'utf-8'),
      });
    }
  }
  return results;
}

const SRC = path.join(__dirname, '../../src');
const files = readAllSrc(SRC);

describe('T-NFR-7 no sensitive logging', () => {
  it('no console.log calls in src/', () => {
    const hits = files
      .filter(f => /console\.log\s*\(/.test(f.content))
      .map(f => f.file);
    expect(hits).toEqual([]);
  });

  it('no console.error calls that might expose raw errors to the user in src/', () => {
    const hits = files
      .filter(f => /console\.error\s*\(/.test(f.content))
      .map(f => f.file);
    expect(hits).toEqual([]);
  });

  it('no console.warn calls in src/', () => {
    const hits = files
      .filter(f => /console\.warn\s*\(/.test(f.content))
      .map(f => f.file);
    expect(hits).toEqual([]);
  });
});
