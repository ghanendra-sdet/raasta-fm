import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useExperimentalYouTubePlayer } from './useExperimentalYouTubePlayer'

const TRACKS = Array.from({ length: 6 }, (_, i) => ({
  id: `youtube:vid${i}`,
  title: `Track ${i}`,
  artist: 'Channel',
}))

/**
 * A minimal fake standing in for ExperimentalYouTubeProvider — the hook is
 * tested in isolation from the real IFrame API (already covered by
 * ExperimentalYouTubeProvider.test.ts), focused purely on the shuffle
 * behavior the hook adds on top: initial random cue, next()/previous()
 * walking the shuffle order, and session stability.
 */
class FakeProvider {
  listeners = new Set<() => void>()
  currentIndex = 0
  playbackState: 'idle' | 'playing' | 'paused' = 'idle'
  cueAtCalls: number[] = []
  playAtCalls: number[] = []

  attach() {
    // Simulate becoming ready on the next tick, like the real provider.
    setTimeout(() => this.notify(), 0)
  }

  destroy() {}

  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getCurrentTrack() {
    return this.playbackState === 'idle' &&
      this.cueAtCalls.length === 0 &&
      this.playAtCalls.length === 0
      ? null
      : TRACKS[this.currentIndex]
  }

  getPlaybackState() {
    return this.playbackState
  }

  getLastError() {
    return null
  }

  getQueue() {
    return { tracks: TRACKS, currentIndex: this.currentIndex }
  }

  getProgress() {
    return null
  }

  async play() {
    this.playbackState = 'playing'
    this.notify()
  }

  pause() {
    this.playbackState = 'paused'
    this.notify()
  }

  async next() {
    this.currentIndex = Math.min(this.currentIndex + 1, TRACKS.length - 1)
    this.notify()
  }

  async previous() {
    this.currentIndex = Math.max(this.currentIndex - 1, 0)
    this.notify()
  }

  async playAt(index: number) {
    this.playAtCalls.push(index)
    this.currentIndex = index
    this.playbackState = 'playing'
    this.notify()
  }

  cueAt(index: number) {
    this.cueAtCalls.push(index)
    this.currentIndex = index
    this.notify()
  }

  private notify() {
    this.listeners.forEach((l) => l())
  }
}

let lastProvider: FakeProvider | null = null

vi.mock('../../music/youtube/ExperimentalYouTubeProvider', () => ({
  ExperimentalYouTubeProvider: class {
    constructor(playlistId: string) {
      lastProvider = new FakeProvider(playlistId)
      return lastProvider
    }
  },
}))

function renderPlayerHook() {
  const containerRef = { current: document.createElement('div') }
  return renderHook(() => useExperimentalYouTubePlayer(containerRef))
}

describe('useExperimentalYouTubePlayer — session shuffle', () => {
  beforeEach(() => {
    lastProvider = null
    window.sessionStorage.clear()
  })

  it('cues a shuffled/random start position once the playlist is known, never autoplaying', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5) // start position = floor(0.5*6) = 3
    const { result } = renderPlayerHook()

    await waitFor(() => expect(lastProvider!.cueAtCalls).toHaveLength(1))

    // The shuffle itself also consumes random() calls before the start
    // position is picked, so the exact resulting index isn't hand-derivable
    // here — what matters is it's a valid playlist index and nothing played.
    expect(lastProvider!.cueAtCalls[0]).toBeGreaterThanOrEqual(0)
    expect(lastProvider!.cueAtCalls[0]).toBeLessThan(6)
    expect(lastProvider!.playAtCalls).toHaveLength(0) // cueAt never plays
    expect(result.current.playbackState).not.toBe('playing')
    vi.restoreAllMocks()
  })

  it('two fresh sessions can start at different positions', async () => {
    window.sessionStorage.clear()
    vi.spyOn(Math, 'random').mockReturnValue(0.1) // floor(0.1*6) = 0
    const first = renderPlayerHook()
    await waitFor(() => expect(lastProvider!.cueAtCalls).toHaveLength(1))
    const firstStart = lastProvider!.cueAtCalls[0]
    first.unmount()

    window.sessionStorage.clear() // a genuinely fresh session, not a reload of the same one
    vi.spyOn(Math, 'random').mockReturnValue(0.9) // floor(0.9*6) = 5
    renderPlayerHook()
    await waitFor(() => expect(lastProvider!.cueAtCalls).toHaveLength(1))
    const secondStart = lastProvider!.cueAtCalls[0]

    expect(firstStart).not.toBe(secondStart)
    vi.restoreAllMocks()
  })

  it('next() advances through the shuffled order, not the raw playlist order', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0) // deterministic shuffle + start position 0
    const { result } = renderPlayerHook()
    await waitFor(() => expect(lastProvider!.cueAtCalls).toHaveLength(1))
    vi.restoreAllMocks()

    act(() => result.current.next())
    await waitFor(() => expect(lastProvider!.playAtCalls).toHaveLength(1))

    // Whatever index it moved to, it must be a valid, shuffled playlist
    // index — never simply "cued index + 1" (that would be raw order).
    expect(lastProvider!.playAtCalls[0]).toBeGreaterThanOrEqual(0)
    expect(lastProvider!.playAtCalls[0]).toBeLessThan(6)
  })

  it('previous() reverses through the exact same shuffled order next() used', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.3)
    const { result } = renderPlayerHook()
    await waitFor(() => expect(lastProvider!.cueAtCalls).toHaveLength(1))
    vi.restoreAllMocks()

    act(() => result.current.next())
    await waitFor(() => expect(lastProvider!.playAtCalls).toHaveLength(1))
    const afterNext = lastProvider!.playAtCalls[0]

    act(() => result.current.previous())
    await waitFor(() => expect(lastProvider!.playAtCalls).toHaveLength(2))
    const afterPrevious = lastProvider!.playAtCalls[1]

    const startIndex = lastProvider!.cueAtCalls[0]
    expect(afterNext).not.toBe(startIndex) // it moved
    expect(afterPrevious).toBe(startIndex) // and came straight back
  })

  it('play/pause do not reshuffle or change position', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.4)
    const { result } = renderPlayerHook()
    await waitFor(() => expect(lastProvider!.cueAtCalls).toHaveLength(1))
    vi.restoreAllMocks()

    act(() => result.current.play())
    await waitFor(() => expect(result.current.playbackState).toBe('playing'))
    act(() => result.current.togglePlayPause())
    await waitFor(() => expect(result.current.playbackState).toBe('paused'))

    expect(lastProvider!.cueAtCalls).toHaveLength(1) // still just the one initial cue
    expect(lastProvider!.playAtCalls).toHaveLength(0) // play/pause never call playAt
  })

  it('a new cycle does not immediately repeat the previous cycle’s final track', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.2)
    const { result } = renderPlayerHook()
    await waitFor(() => expect(lastProvider!.cueAtCalls).toHaveLength(1))
    vi.restoreAllMocks()

    // Walk all the way through the current 6-track shuffle cycle.
    for (let i = 0; i < 5; i += 1) {
      act(() => result.current.next())
      await waitFor(() => expect(lastProvider!.playAtCalls).toHaveLength(i + 1))
    }
    const lastOfCycle = lastProvider!.playAtCalls[lastProvider!.playAtCalls.length - 1]

    // One more next() rolls into a freshly generated cycle.
    act(() => result.current.next())
    await waitFor(() => expect(lastProvider!.playAtCalls).toHaveLength(6))
    const firstOfNewCycle = lastProvider!.playAtCalls[5]

    expect(firstOfNewCycle).not.toBe(lastOfCycle)
  })
})
