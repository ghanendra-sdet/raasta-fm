import { describe, expect, it } from 'vitest'
import {
  createNextCycleOrder,
  createShuffleOrder,
  fisherYatesShuffle,
  pickRandomStartPosition,
} from './shuffle'

/** A deterministic, repeatable "random" sequence for reliable tests. */
function sequenceRandom(values: number[]): () => number {
  let i = 0
  return () => values[i++ % values.length]
}

describe('fisherYatesShuffle', () => {
  it('produces the same number of items as the input', () => {
    const result = fisherYatesShuffle([1, 2, 3, 4, 5], sequenceRandom([0.1, 0.9, 0.5, 0.2, 0.7]))
    expect(result).toHaveLength(5)
  })

  it('contains every original item exactly once', () => {
    const input = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    const result = fisherYatesShuffle(input, sequenceRandom([0.9, 0.1, 0.5, 0.3, 0.8, 0.2, 0.6]))
    expect([...result].sort()).toEqual([...input].sort())
  })

  it('does not mutate the input array', () => {
    const input = [1, 2, 3, 4]
    const copy = [...input]
    fisherYatesShuffle(input, sequenceRandom([0.5, 0.5, 0.5]))
    expect(input).toEqual(copy)
  })

  it('is not always identical to the original order', () => {
    const input = Array.from({ length: 20 }, (_, i) => i)
    // A random-ish deterministic sequence, not all zeros/constant.
    const random = sequenceRandom([0.83, 0.12, 0.67, 0.05, 0.91, 0.44, 0.29, 0.58, 0.71, 0.03])
    const result = fisherYatesShuffle(input, random)
    expect(result).not.toEqual(input)
  })
})

describe('createShuffleOrder', () => {
  it('returns a permutation of [0, length)', () => {
    const order = createShuffleOrder(8, sequenceRandom([0.9, 0.1, 0.5, 0.3, 0.8, 0.2, 0.6]))
    expect([...order].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
  })

  it('can start at different positions across different sessions', () => {
    const orderA = createShuffleOrder(8, sequenceRandom([0.9, 0.1, 0.5, 0.3, 0.8, 0.2, 0.6]))
    const orderB = createShuffleOrder(8, sequenceRandom([0.1, 0.8, 0.2, 0.6, 0.4, 0.9, 0.05]))
    expect(orderA[0]).not.toBe(orderB[0])
  })
})

describe('pickRandomStartPosition', () => {
  it('returns an index within range for a given length', () => {
    for (const r of [0, 0.25, 0.5, 0.75, 0.999]) {
      const position = pickRandomStartPosition(10, () => r)
      expect(position).toBeGreaterThanOrEqual(0)
      expect(position).toBeLessThan(10)
    }
  })

  it('is not hardcoded to always return 0', () => {
    const position = pickRandomStartPosition(10, () => 0.65)
    expect(position).toBe(6)
  })
})

describe('createNextCycleOrder', () => {
  it('produces a full permutation for the new cycle', () => {
    const order = createNextCycleOrder(6, 3, sequenceRandom([0.9, 0.1, 0.5, 0.3, 0.8]))
    expect([...order].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5])
  })

  it("never starts the new cycle with the previous cycle's final track", () => {
    // Rig the shuffle so the naive result would start with index 3 (the
    // excluded index), then confirm the swap-correction kicks in.
    const random = sequenceRandom([0, 0, 0, 0, 0, 0.5])
    const naive = createShuffleOrder(6, sequenceRandom([0, 0, 0, 0, 0]))
    const excludeFirstIndex = naive[0]

    const order = createNextCycleOrder(6, excludeFirstIndex, random)
    expect(order[0]).not.toBe(excludeFirstIndex)
    expect([...order].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5])
  })

  it('does not create duplicate consecutive tracks across many generated cycles', () => {
    let previousLast: number | null = null
    let seed = 1
    // A simple deterministic pseudo-random generator, seeded differently
    // per iteration, standing in for real randomness without flakiness.
    const nextRandom = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }

    for (let cycle = 0; cycle < 50; cycle += 1) {
      const order = createNextCycleOrder(6, previousLast, nextRandom)
      if (previousLast !== null) {
        expect(order[0]).not.toBe(previousLast)
      }
      previousLast = order[order.length - 1]
    }
  })

  it('with only one track, returns that track (no repeat avoidance possible)', () => {
    const order = createNextCycleOrder(1, 0, () => 0.5)
    expect(order).toEqual([0])
  })
})
