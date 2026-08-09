import type { MusicProvider, PlaybackState, PlayerListener, Queue, Track } from '../types'

/**
 * Demo/mock MusicProvider. Plays a short synthesized sine tone per track via
 * the Web Audio API instead of any real audio file — no song is downloaded,
 * extracted, scraped, or bundled. See docs/MUSIC-SOURCE.md.
 *
 * This class is one interchangeable implementation of MusicProvider. Nothing
 * outside src/music/mock knows this provider is "mock" — a future authorized
 * provider implements the same interface and drops in without changes to
 * PlayerContext or any UI. See docs/ARCHITECTURE.md.
 *
 * Behavior contract:
 * - Empty queue: getCurrentTrack() is null, play()/next()/previous() are no-ops.
 * - setQueue(): selects `startIndex` (clamped into range, default 0) as the
 *   current track and resets playback state to 'idle' — it does not auto-play.
 * - next()/previous(): wrap around (last → first, first → last). A radio
 *   station doesn't run out of songs. If the queue was playing, playback
 *   continues on the new track; if it was paused/idle, it stays that way.
 * - play() is idempotent while already playing; pause() is idempotent while
 *   already paused/idle.
 */
export class MockMusicProvider implements MusicProvider {
  private queue: Queue = { tracks: [], currentIndex: -1 }
  private state: PlaybackState = 'idle'
  private listeners = new Set<PlayerListener>()

  private audioContext: AudioContext | null = null
  private oscillator: OscillatorNode | null = null
  private gainNode: GainNode | null = null

  subscribe(listener: PlayerListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  setQueue(tracks: Track[], startIndex = 0): void {
    this.stopTone()
    const currentIndex = tracks.length ? Math.min(Math.max(startIndex, 0), tracks.length - 1) : -1
    this.queue = { tracks, currentIndex }
    this.state = 'idle'
    this.notify()
  }

  async play(): Promise<void> {
    if (this.queue.currentIndex < 0 || this.state === 'playing') return
    this.startTone()
    this.state = 'playing'
    this.notify()
  }

  pause(): void {
    if (this.state !== 'playing') return
    this.stopTone()
    this.state = 'paused'
    this.notify()
  }

  async next(): Promise<void> {
    if (!this.queue.tracks.length) return
    await this.step(1)
  }

  async previous(): Promise<void> {
    if (!this.queue.tracks.length) return
    await this.step(-1)
  }

  getCurrentTrack(): Track | null {
    return this.queue.tracks[this.queue.currentIndex] ?? null
  }

  getQueue(): Queue {
    return this.queue
  }

  getPlaybackState(): PlaybackState {
    return this.state
  }

  private async step(direction: 1 | -1): Promise<void> {
    const previousState = this.state
    const length = this.queue.tracks.length
    const currentIndex = (this.queue.currentIndex + direction + length) % length

    this.stopTone()
    this.queue = { ...this.queue, currentIndex }
    // Paused stays paused on the new track; idle stays idle. Only a
    // playing queue needs the intermediate 'idle' before play() resumes it.
    this.state = previousState === 'playing' ? 'idle' : previousState
    this.notify()

    if (previousState === 'playing') await this.play()
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener())
  }

  private startTone(): void {
    const track = this.getCurrentTrack()
    if (!track || typeof window === 'undefined' || typeof window.AudioContext === 'undefined') {
      return
    }

    this.audioContext ??= new window.AudioContext()
    const context = this.audioContext
    const oscillator = context.createOscillator()
    const gain = context.createGain()

    // Deterministic-but-distinct tone per track — a placeholder for real
    // audio, not a recording of anything.
    oscillator.type = 'sine'
    oscillator.frequency.value = 220 + (hashTrackId(track.id) % 220)
    gain.gain.value = 0.05
    oscillator.connect(gain).connect(context.destination)
    oscillator.start()

    this.oscillator = oscillator
    this.gainNode = gain
  }

  private stopTone(): void {
    this.oscillator?.stop()
    this.oscillator?.disconnect()
    this.gainNode?.disconnect()
    this.oscillator = null
    this.gainNode = null
  }
}

function hashTrackId(id: string): number {
  let hash = 0
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) | 0
  }
  return Math.abs(hash)
}
