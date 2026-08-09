/**
 * Isolated localStorage access — the only place in the app that touches
 * `window.localStorage` directly. Every read/write is defensive: corrupted
 * data, a missing key, or a storage failure (quota, private browsing) falls
 * back to the caller-supplied default instead of throwing. Favoriting a song
 * should never be able to crash the app.
 */

export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJSON<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage can fail (quota exceeded, private mode). Silently drop the
    // write rather than crash — this is a nice-to-have persistence layer.
  }
}
