type CacheEntry<T> = {
  data: T;
  savedAt: number;
};

const store = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL_MS = 5 * 60 * 1000;

export function readRouteCache<T>(key: string, ttlMs = DEFAULT_TTL_MS): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.savedAt > ttlMs) {
    store.delete(key);
    return null;
  }
  return entry.data as T;
}

export function writeRouteCache<T>(key: string, data: T): void {
  store.set(key, { data, savedAt: Date.now() });
}
