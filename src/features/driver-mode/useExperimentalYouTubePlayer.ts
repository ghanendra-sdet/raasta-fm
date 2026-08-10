import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import type { RefObject } from 'react'
import { ExperimentalYouTubeProvider } from '../../music/youtube/ExperimentalYouTubeProvider'
import type { PlaybackState, Track } from '../../music/types'
import { createNextCycleOrder, createShuffleOrder, pickRandomStartPosition } from './shuffle'
import { loadShuffleState, saveShuffleState } from './shuffleSession'
import type { ShuffleState } from './shuffleSession'

/**
 * A fixed public YouTube playlist used only to test the Driver Mode
 * concept with real Hindi music. See docs/MUSIC-SOURCE.md.
 *
 * A YouTube-generated Hindi "mix" radio playlist (RD... ID, 80 tracks).
 * Verified fully embeddable via the official IFrame API before adoption —
 * loads, resolves real track metadata, and plays/skips signed-out, with no
 * authentication required. Replaced the prior Sony Music India playlist
 * (PLHuHXHyLu7BH71H9_USibJABiVmLNClQy). See docs/MUSIC-SOURCE.md.
 */
export const EXPERIMENTAL_PLAYLIST_ID = 'RDCLAK5uy_lnm4v4arFrmL63NUzIdoXJe-E7G4_sriU'

const PROGRESS_POLL_MS = 500

export interface PlaybackProgress {
  currentSeconds: number
  durationSeconds: number
}

interface Snapshot {
  currentTrack: Track | null
  playbackState: PlaybackState
  playlistLength: number
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
 *
 * Session shuffle: `next`/`previous` walk a shuffled permutation of the
 * playlist's indices (see shuffle.ts) instead of the playlist's own
 * next/previous order, so different reviewers don't all hear the same
 * sequence. The shuffle order and current position live in refs (not
 * React state) — reading/advancing them never triggers a re-render or
 * reshuffle by itself — and are persisted to sessionStorage (shuffleSession.ts)
 * so the order stays stable across re-renders, play/pause, and reloads
 * within the same tab, without ever becoming permanent listening-order
 * state. A new shuffle is only generated once, on first playlist load, and
 * again each time a full cycle completes (see next()).
 */
export function useExperimentalYouTubePlayer(containerRef: RefObject<HTMLDivElement | null>) {
  const [provider] = useState(() => new ExperimentalYouTubeProvider(EXPERIMENTAL_PLAYLIST_ID))
  const snapshotRef = useRef<Snapshot>({
    currentTrack: null,
    playbackState: 'idle',
    playlistLength: 0,
  })
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<PlaybackProgress | null>(null)
  const shuffleRef = useRef<ShuffleState | null>(null)
  const shuffleInitializedRef = useRef(false)

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
          playlistLength: provider.getQueue().tracks.length,
        }
        setError(provider.getLastError())
        onStoreChange()
      }),
    [provider],
  )
  const getSnapshot = useCallback(() => snapshotRef.current, [])

  const snapshot = useSyncExternalStore(subscribe, getSnapshot)

  // Once the real playlist length is known (first onReady), establish this
  // session's shuffle order exactly once: reuse it from sessionStorage if
  // this tab already has one for a playlist of the same length, otherwise
  // generate a fresh Fisher-Yates order with a random start position, then
  // cue (never autoplay) that position.
  useEffect(() => {
    if (shuffleInitializedRef.current || snapshot.playlistLength <= 0) return
    shuffleInitializedRef.current = true

    const length = snapshot.playlistLength
    const stored = loadShuffleState(length)
    const state: ShuffleState = stored ?? {
      order: createShuffleOrder(length),
      position: pickRandomStartPosition(length),
    }
    shuffleRef.current = state
    if (!stored) saveShuffleState(state)

    provider.cueAt(state.order[state.position])
  }, [snapshot.playlistLength, provider])

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
        const state = shuffleRef.current
        if (!state) {
          void provider.next()
          return
        }
        const atEnd = state.position >= state.order.length - 1
        const nextState: ShuffleState = atEnd
          ? {
              order: createNextCycleOrder(state.order.length, state.order[state.order.length - 1]),
              position: 0,
            }
          : { order: state.order, position: state.position + 1 }
        shuffleRef.current = nextState
        saveShuffleState(nextState)
        void provider.playAt(nextState.order[nextState.position])
      },
      previous: () => {
        const state = shuffleRef.current
        if (!state) {
          void provider.previous()
          return
        }
        const nextPosition = (state.position - 1 + state.order.length) % state.order.length
        const nextState: ShuffleState = { order: state.order, position: nextPosition }
        shuffleRef.current = nextState
        saveShuffleState(nextState)
        void provider.playAt(nextState.order[nextState.position])
      },
    }),
    [snapshot, error, progress, provider],
  )
}
