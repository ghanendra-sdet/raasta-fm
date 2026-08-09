export interface Track {
  id: string
  title: string
  artist: string
  artworkUrl?: string
  durationSeconds?: number
}

export interface Queue {
  tracks: Track[]
  currentIndex: number
}

export type PlaybackState = 'idle' | 'playing' | 'paused'

export type PlayerListener = () => void

/**
 * Abstraction every music backend (demo audio, an authorized provider, a future
 * provider) implements. The app talks to this interface only — never to a
 * specific backend directly. See docs/ARCHITECTURE.md and docs/MUSIC-SOURCE.md.
 *
 * No seek() by design — the no-scrub philosophy is enforced here, not just
 * in the UI, so a future provider can't reintroduce scrubbing by accident.
 *
 * `setQueue` and `subscribe` are the minimal extra surface needed to load a
 * queue and let the React layer react to state changes; they're generic to
 * any provider, not specific to the mock/demo implementation.
 */
export interface MusicProvider {
  setQueue(tracks: Track[], startIndex?: number): void
  play(): Promise<void>
  pause(): void
  next(): Promise<void>
  previous(): Promise<void>
  getCurrentTrack(): Track | null
  getQueue(): Queue
  getPlaybackState(): PlaybackState
  subscribe(listener: PlayerListener): () => void
}
