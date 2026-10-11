import type { BillWithMetadata } from '../types';

const CACHE_KEY = 'chiabill:history:v1';

export interface BillsCache {
  etag: string;
  bills: BillWithMetadata[];
}

interface StoredCache extends BillsCache {
  build: string;
}

// A new deploy may change the bill shape, so a cache from another build is discarded.
function currentBuild(): string {
  return typeof __BUILD_NUMBER__ === 'string' ? __BUILD_NUMBER__ : 'dev';
}

export function readBillsCache(): BillsCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as Partial<StoredCache>;
    if (stored.build !== currentBuild() || typeof stored.etag !== 'string' || !Array.isArray(stored.bills)) {
      return null;
    }
    return { etag: stored.etag, bills: stored.bills };
  } catch {
    return null;
  }
}

export function writeBillsCache(cache: BillsCache): void {
  try {
    const stored: StoredCache = { ...cache, build: currentBuild() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(stored));
  } catch {
    // Storage can be full or blocked; the page works without it.
  }
}

export function clearBillsCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // Nothing to clear.
  }
}

export function etagForRevision(rev: string): string {
  return `"${rev}"`;
}
