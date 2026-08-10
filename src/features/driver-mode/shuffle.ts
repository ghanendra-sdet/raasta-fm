/**
 * Pure, dependency-free shuffle utilities for Driver Mode's session
 * playback order. `random` is injectable (defaults to Math.random) so
 * tests can supply a deterministic sequence instead of depending on real
 * randomness.
 */

/** Fisher-Yates shuffle — unbiased, does not mutate the input array. */
export function fisherYatesShuffle<T>(
  items: readonly T[],
  random: () => number = Math.random,
): T[] {
  const result = items.slice()
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    const temp = result[i]
    result[i] = result[j]
    result[j] = temp
  }
  return result
}

/** A shuffled permutation of playlist indices [0, length). */
export function createShuffleOrder(length: number, random: () => number = Math.random): number[] {
  const indices = Array.from({ length }, (_, index) => index)
  return fisherYatesShuffle(indices, random)
}

/** A random starting position within a shuffle order of the given length. */
export function pickRandomStartPosition(
  length: number,
  random: () => number = Math.random,
): number {
  if (length <= 0) return 0
  return Math.floor(random() * length)
}

/**
 * A fresh shuffle order for the next listening cycle, guaranteed not to
 * start with `excludeFirstIndex` (the previous cycle's final track) so
 * playback never appears to repeat a track back-to-back across a cycle
 * boundary. With fewer than 2 tracks, avoiding a repeat isn't possible —
 * the order is returned as-is.
 */
export function createNextCycleOrder(
  length: number,
  excludeFirstIndex: number | null,
  random: () => number = Math.random,
): number[] {
  const order = createShuffleOrder(length, random)
  if (length > 1 && excludeFirstIndex !== null && order[0] === excludeFirstIndex) {
    const swapWith = 1 + Math.floor(random() * (length - 1))
    const temp = order[0]
    order[0] = order[swapWith]
    order[swapWith] = temp
  }
  return order
}
