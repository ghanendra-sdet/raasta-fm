/**
 * Session-scoped persistence for Driver Mode's shuffle order — sessionStorage
 * only (never localStorage), so the order is stable for the current browser
 * tab/session and does not become permanent listening-order state.
 */

export interface ShuffleState {
  order: number[]
  position: number
}

const SESSION_KEY = 'raasta-fm:driver-mode:shuffle-order'

export function loadShuffleState(expectedLength: number): ShuffleState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<ShuffleState>
    if (
      !Array.isArray(parsed.order) ||
      parsed.order.length !== expectedLength ||
      typeof parsed.position !== 'number' ||
      parsed.position < 0 ||
      parsed.position >= expectedLength
    ) {
      return null
    }
    return { order: parsed.order, position: parsed.position }
  } catch {
    return null
  }
}

export function saveShuffleState(state: ShuffleState): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(state))
  } catch {
    // sessionStorage unavailable (private mode, quota) — shuffle still
    // works in-memory for the current page life, just doesn't persist.
  }
}
