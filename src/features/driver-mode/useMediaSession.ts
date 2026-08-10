import { useEffect } from 'react'
import type { PlaybackState, Track } from '../../music/types'

function getYouTubeThumbnailUrl(trackId: string): string | null {
  if (!trackId.startsWith('youtube:')) return null
  const videoId = trackId.slice('youtube:'.length)
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null
}

interface UseMediaSessionParams {
  currentTrack: Track | null
  playbackState: PlaybackState
  onPlay: () => void
  onPause: () => void
  onPrevious: () => void
  onNext: () => void
}

/**
 * Best-effort lock-screen/OS media-control integration via the standards-
 * based Media Session API — not a background-playback guarantee. Whether
 * playback actually continues when the tab is backgrounded is entirely up
 * to the browser/OS and YouTube's own iframe (mobile Safari in particular
 * suspends background tabs far more aggressively than desktop Chrome or
 * Android Chrome). This hook only keeps `navigator.mediaSession` metadata
 * and action handlers in sync when the API exists; it does nothing on
 * browsers without it. See docs/MUSIC-SOURCE.md.
 *
 * Reads YouTube's standard thumbnail URL for lock-screen artwork — the
 * same public hotlink pattern SimpleRadioPlayer uses, duplicated here
 * rather than imported so this hook has no dependency on that component's
 * internals.
 */
export function useMediaSession({
  currentTrack,
  playbackState,
  onPlay,
  onPause,
  onPrevious,
  onNext,
}: UseMediaSessionParams) {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return

    if (!currentTrack) {
      navigator.mediaSession.metadata = null
      return
    }

    const thumbnailUrl = getYouTubeThumbnailUrl(currentTrack.id)
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist,
      album: 'Raasta FM',
      artwork: thumbnailUrl ? [{ src: thumbnailUrl, sizes: '480x360', type: 'image/jpeg' }] : [],
    })
  }, [currentTrack])

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return
    navigator.mediaSession.playbackState =
      playbackState === 'playing' ? 'playing' : playbackState === 'paused' ? 'paused' : 'none'
  }, [playbackState])

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return

    const handlers: Array<[MediaSessionAction, MediaSessionActionHandler]> = [
      ['play', () => onPlay()],
      ['pause', () => onPause()],
      ['previoustrack', () => onPrevious()],
      ['nexttrack', () => onNext()],
    ]

    for (const [action, handler] of handlers) {
      try {
        navigator.mediaSession.setActionHandler(action, handler)
      } catch {
        // Action not supported by this browser — safe to ignore.
      }
    }

    return () => {
      for (const [action] of handlers) {
        try {
          navigator.mediaSession.setActionHandler(action, null)
        } catch {
          // Action not supported by this browser — safe to ignore.
        }
      }
    }
  }, [onPlay, onPause, onPrevious, onNext])
}
