// Jest mock for `next/headers`'s cookies() — route handlers call this via
// lib/auth.ts to read/write the incoming request's session cookie, but that
// only works inside Next's own request-scoped AsyncLocalStorage. Outside of a
// real server (i.e. under Jest), we back it with a plain in-memory map that
// tests can seed/clear directly to simulate "the browser sent this cookie".
const store = new Map<string, string>();

export function __setMockCookie(name: string, value: string) {
  store.set(name, value);
}

export function __clearMockCookies() {
  store.clear();
}

export async function cookies() {
  return {
    get(name: string) {
      return store.has(name) ? { name, value: store.get(name)! } : undefined;
    },
    set(name: string, value: string) {
      store.set(name, value);
    },
    delete(name: string) {
      store.delete(name);
    },
  };
}
