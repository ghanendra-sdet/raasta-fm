import { describe, expect, it, vi } from 'vitest'
import { MockMusicProvider } from './MockMusicProvider'
import type { Track } from '../types'

const tracks: Track[] = [
  { id: 't1', title: 'Track 1', artist: 'Raasta FM Demo Audio' },
  { id: 't2', title: 'Track 2', artist: 'Raasta FM Demo Audio' },
  { id: 't3', title: 'Track 3', artist: 'Raasta FM Demo Audio' },
]

describe('MockMusicProvider', () => {
  it('starts idle with an empty queue', () => {
    const provider = new MockMusicProvider()
    expect(provider.getCurrentTrack()).toBeNull()
    expect(provider.getPlaybackState()).toBe('idle')
    expect(provider.getQueue()).toEqual({ tracks: [], currentIndex: -1 })
  })

  it('treats play() on an empty queue as a no-op', async () => {
    const provider = new MockMusicProvider()
    await provider.play()
    expect(provider.getPlaybackState()).toBe('idle')
  })

  it('treats next()/previous() on an empty queue as no-ops', async () => {
    const provider = new MockMusicProvider()
    await provider.next()
    await provider.previous()
    expect(provider.getCurrentTrack()).toBeNull()
    expect(provider.getPlaybackState()).toBe('idle')
  })

  it('setQueue() selects the first track by default, without auto-playing', () => {
    const provider = new MockMusicProvider()
    provider.setQueue(tracks)
    expect(provider.getCurrentTrack()).toEqual(tracks[0])
    expect(provider.getPlaybackState()).toBe('idle')
  })

  it('clamps an out-of-range startIndex into bounds', () => {
    const provider = new MockMusicProvider()

    provider.setQueue(tracks, 99)
    expect(provider.getCurrentTrack()).toEqual(tracks[2])

    provider.setQueue(tracks, -5)
    expect(provider.getCurrentTrack()).toEqual(tracks[0])
  })

  it('play() and pause() toggle playback state', async () => {
    const provider = new MockMusicProvider()
    provider.setQueue(tracks)

    await provider.play()
    expect(provider.getPlaybackState()).toBe('playing')

    provider.pause()
    expect(provider.getPlaybackState()).toBe('paused')
  })

  it('is idempotent: play() while playing and pause() while paused are no-ops', async () => {
    const provider = new MockMusicProvider()
    provider.setQueue(tracks)
    const listener = vi.fn()
    provider.subscribe(listener)

    await provider.play()
    const callsAfterFirstPlay = listener.mock.calls.length
    await provider.play()
    expect(listener).toHaveBeenCalledTimes(callsAfterFirstPlay)

    provider.pause()
    const callsAfterFirstPause = listener.mock.calls.length
    provider.pause()
    expect(listener).toHaveBeenCalledTimes(callsAfterFirstPause)
  })

  it('next() wraps from the last track back to the first', async () => {
    const provider = new MockMusicProvider()
    provider.setQueue(tracks, tracks.length - 1)

    await provider.next()
    expect(provider.getCurrentTrack()).toEqual(tracks[0])
  })

  it('previous() wraps from the first track back to the last', async () => {
    const provider = new MockMusicProvider()
    provider.setQueue(tracks, 0)

    await provider.previous()
    expect(provider.getCurrentTrack()).toEqual(tracks[tracks.length - 1])
  })

  it('preserves a playing state across next()/previous()', async () => {
    const provider = new MockMusicProvider()
    provider.setQueue(tracks)
    await provider.play()

    await provider.next()
    expect(provider.getPlaybackState()).toBe('playing')
    expect(provider.getCurrentTrack()).toEqual(tracks[1])
  })

  it('does not start playback across next()/previous() when idle or paused', async () => {
    const provider = new MockMusicProvider()
    provider.setQueue(tracks)

    await provider.next()
    expect(provider.getPlaybackState()).toBe('idle')

    await provider.play()
    provider.pause()
    await provider.previous()
    expect(provider.getPlaybackState()).toBe('paused')
  })

  it('resets to idle when a new queue is loaded mid-playback', async () => {
    const provider = new MockMusicProvider()
    provider.setQueue(tracks)
    await provider.play()

    provider.setQueue(tracks, 1)
    expect(provider.getPlaybackState()).toBe('idle')
    expect(provider.getCurrentTrack()).toEqual(tracks[1])
  })

  it('notifies subscribers on state changes and stops after unsubscribing', async () => {
    const provider = new MockMusicProvider()
    const listener = vi.fn()
    const unsubscribe = provider.subscribe(listener)

    provider.setQueue(tracks)
    await provider.play()
    provider.pause()
    expect(listener).toHaveBeenCalledTimes(3)

    unsubscribe()
    await provider.play()
    expect(listener).toHaveBeenCalledTimes(3)
  })
})
