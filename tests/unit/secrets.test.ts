// T-NFR-6: SERVICE_ROLE never appears in src/; no raw key patterns in src/
import * as fs from 'fs';
import * as path from 'path';

function scanDir(dir: string, pattern: RegExp): string[] {
  const hits: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      hits.push(...scanDir(full, pattern));
    } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      const content = fs.readFileSync(full, 'utf-8');
      if (pattern.test(content)) {
        hits.push(path.relative(path.join(__dirname, '../../src'), full));
      }
    }
  }
  return hits;
}

const SRC = path.join(__dirname, '../../src');

describe('T-NFR-6 secrets', () => {
  it('SERVICE_ROLE never appears in src/', () => {
    const hits = scanDir(SRC, /SERVICE_ROLE/);
    expect(hits).toEqual([]);
  });

  it('SUPABASE_SERVICE_ROLE_KEY never appears in src/', () => {
    const hits = scanDir(SRC, /SUPABASE_SERVICE_ROLE_KEY/);
    expect(hits).toEqual([]);
  });

  it('no hardcoded JWT or bearer token patterns in src/', () => {
    // Matches ey...  (base64-encoded JWTs start with "eyJ")
    const hits = scanDir(SRC, /['"`]eyJ[A-Za-z0-9_-]{20,}/);
    expect(hits).toEqual([]);
  });
});
