import { beforeEach, describe, expect, it } from 'vitest'
import { readJSON, writeJSON } from './storage'

const KEY = 'raasta-fm.test-key'

describe('storage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('returns the fallback when the key is missing', () => {
    expect(readJSON(KEY, ['fallback'])).toEqual(['fallback'])
  })

  it('round-trips a value written and then read', () => {
    writeJSON(KEY, ['a', 'b', 'c'])
    expect(readJSON<string[]>(KEY, [])).toEqual(['a', 'b', 'c'])
  })

  it('returns the fallback instead of throwing on corrupted JSON', () => {
    window.localStorage.setItem(KEY, '{not valid json')
    expect(() => readJSON(KEY, [])).not.toThrow()
    expect(readJSON(KEY, ['fallback'])).toEqual(['fallback'])
  })
})
