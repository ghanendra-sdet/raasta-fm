import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import type { RefObject } from 'react'
import { ExperimentalYouTubeProvider } from '../../music/youtube/ExperimentalYouTubeProvider'
import type { PlaybackState, Track } from '../../music/types'

/**
 * A fixed public YouTube playlist used only to test the Driver Mode
 * concept with real Hindi music. See docs/MUSIC-SOURCE.md.
 *
 * Sony Music India — "Most Popular Songs" (51 tracks). Verified fully
 * embeddable via the official IFrame API before adoption; replaced the
 * original PLTJ1PnzCWyFw after testing found many of its videos had
 * embedding disabled by their rights holders. See docs/MUSIC-SOURCE.md.
 */
export const EXPERIMENTAL_PLAYLIST_ID = 'PLHuHXHyLu7BH71H9_USibJABiVmLNClQy'

const PROGRESS_POLL_MS = 500

export interface PlaybackProgress {
  currentSeconds: number
  durationSeconds: number
}

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
 *
 * Progress is polled (the IFrame API has no time-update event) and is
 * strictly informational — see ExperimentalYouTubeProvider.getProgress().
 */
export function useExperimentalYouTubePlayer(containerRef: RefObject<HTMLDivElement | null>) {
  const [provider] = useState(() => new ExperimentalYouTubeProvider(EXPERIMENTAL_PLAYLIST_ID))
  const snapshotRef = useRef<Snapshot>({ currentTrack: null, playbackState: 'idle' })
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<PlaybackProgress | null>(null)

  useEffect(() => {
    if (containerRef.current) {
      provider.attach(containerRef.current)
    }
    return () => provider.destroy()
  }, [provider, containerRef])

  useEffect(() => {
    const id = window.setInterval(() => {
      setProgress(provider.getProgress())
    }, PROGRESS_POLL_MS)
    return () => window.clearInterval(id)
  }, [provider])

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
      progress,
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
    [snapshot, error, progress, provider],
  )
}
