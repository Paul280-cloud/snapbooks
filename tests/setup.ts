import { TextEncoder, TextDecoder } from 'util';

Object.assign(global, { TextEncoder, TextDecoder });

// React Router v7 calls `new Request(url, init)` on every navigation.
// jest-environment-jsdom runs in a separate JS realm from Node.js,
// so the Node 18+ built-in Request cannot be used as a constructor there.
// Define a minimal same-realm class that satisfies React Router's needs.
class _Request {
  url: string;
  method: string;
  signal: AbortSignal | null;
  headers: Map<string, string>;
  constructor(input: string | URL | _Request, init?: RequestInit) {
    this.url = input instanceof _Request ? input.url : input.toString();
    this.method = (init?.method ?? 'GET').toUpperCase();
    this.signal = (init?.signal as AbortSignal | null | undefined) ?? null;
    this.headers = new Map();
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).Request = _Request;

import '@testing-library/jest-dom';
