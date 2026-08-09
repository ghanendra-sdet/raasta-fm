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

/**
 * Abstraction every music backend (demo audio, an authorized provider, a future
 * provider) implements. The app talks to this interface only — never to a
 * specific backend directly. See docs/ARCHITECTURE.md and docs/MUSIC-SOURCE.md.
 */
export interface MusicProvider {
  play(): Promise<void>
  pause(): void
  next(): Promise<void>
  previous(): Promise<void>
  getCurrentTrack(): Track | null
  getQueue(): Queue
  getPlaybackState(): PlaybackState
}
