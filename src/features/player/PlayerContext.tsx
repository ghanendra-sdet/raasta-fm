import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { MockMusicProvider } from '../../music/mock/MockMusicProvider'
import type { MusicProvider, PlaybackState, Queue, Track } from '../../music/types'

interface PlayerSnapshot {
  currentTrack: Track | null
  playbackState: PlaybackState
  queue: Queue
}

interface PlayerContextValue extends PlayerSnapshot {
  setQueue: (tracks: Track[], startIndex?: number) => void
  play: () => void
  pause: () => void
  togglePlayPause: () => void
  next: () => void
  previous: () => void
}

const PlayerContext = createContext<PlayerContextValue | null>(null)

function readSnapshot(provider: MusicProvider): PlayerSnapshot {
  return {
    currentTrack: provider.getCurrentTrack(),
    playbackState: provider.getPlaybackState(),
    queue: provider.getQueue(),
  }
}

/**
 * Owns one MusicProvider instance for the app's lifetime and exposes it as
 * React state via useSyncExternalStore. Swapping MockMusicProvider for a
 * future authorized provider only touches this one line — see
 * docs/ARCHITECTURE.md.
 */
export function PlayerProvider({ children }: { children: ReactNode }) {
  const [provider] = useState<MusicProvider>(() => new MockMusicProvider())
  const snapshotRef = useRef<PlayerSnapshot>(readSnapshot(provider))

  const subscribe = useCallback(
    (onStoreChange: () => void) =>
      provider.subscribe(() => {
        snapshotRef.current = readSnapshot(provider)
        onStoreChange()
      }),
    [provider],
  )
  const getSnapshot = useCallback(() => snapshotRef.current, [])

  const snapshot = useSyncExternalStore(subscribe, getSnapshot)

  const value = useMemo<PlayerContextValue>(
    () => ({
      ...snapshot,
      setQueue: (tracks, startIndex) => provider.setQueue(tracks, startIndex),
      play: () => {
        void provider.play()
      },
      pause: () => provider.pause(),
      togglePlayPause: () => {
        if (provider.getPlaybackState() === 'playing') {
          provider.pause()
        } else {
          void provider.play()
        }
      },
      next: () => {
        void provider.next()
      },
      previous: () => {
        void provider.previous()
      },
    }),
    [snapshot, provider],
  )

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook is colocated with its provider on purpose
export function usePlayer(): PlayerContextValue {
  const context = useContext(PlayerContext)
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider')
  }
  return context
}
