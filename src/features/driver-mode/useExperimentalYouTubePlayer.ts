import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import type { RefObject } from 'react'
import { ExperimentalYouTubeProvider } from '../../music/youtube/ExperimentalYouTubeProvider'
import type { PlaybackState, Track } from '../../music/types'

/**
 * A fixed public YouTube playlist used only to test the Driver Mode
 * concept with real Hindi music. See docs/MUSIC-SOURCE.md.
 */
export const EXPERIMENTAL_PLAYLIST_ID = 'PLTJ1PnzCWyFw'

interface Snapshot {
  currentTrack: Track | null
  playbackState: PlaybackState
}

/**
 * EXPERIMENTAL — owns one ExperimentalYouTubeProvider instance local to
 * Driver Mode. Deliberately does NOT touch the app-wide PlayerContext/
 * usePlayer(): this hook is the entire footprint of the experiment on the
 * React side. See ExperimentalYouTubeProvider for the full isolation
 * rationale.
 *
 * The container ref is a caller-owned parameter rather than something this
 * hook returns bundled with reactive state — keeping refs and render data
 * in separate values, not one merged object.
 */
export function useExperimentalYouTubePlayer(containerRef: RefObject<HTMLDivElement | null>) {
  const [provider] = useState(() => new ExperimentalYouTubeProvider(EXPERIMENTAL_PLAYLIST_ID))
  const snapshotRef = useRef<Snapshot>({ currentTrack: null, playbackState: 'idle' })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (containerRef.current) {
      provider.attach(containerRef.current)
    }
    return () => provider.destroy()
  }, [provider, containerRef])

  const subscribe = useCallback(
    (onStoreChange: () => void) =>
      provider.subscribe(() => {
        snapshotRef.current = {
          currentTrack: provider.getCurrentTrack(),
          playbackState: provider.getPlaybackState(),
        }
        setError(provider.getLastError())
        onStoreChange()
      }),
    [provider],
  )
  const getSnapshot = useCallback(() => snapshotRef.current, [])

  const snapshot = useSyncExternalStore(subscribe, getSnapshot)

  return useMemo(
    () => ({
      currentTrack: snapshot.currentTrack,
      playbackState: snapshot.playbackState,
      error,
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
    [snapshot, error, provider],
  )
}
