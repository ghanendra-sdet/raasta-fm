import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FavoriteButton } from '../features/favorites/FavoriteButton'
import { RoadsideBackground } from '../features/driver-mode/RoadsideBackground'
import { FloatingPlayer } from '../features/driver-mode/FloatingPlayer'
import { useExperimentalYouTubePlayer } from '../features/driver-mode/useExperimentalYouTubePlayer'

/**
 * Placeholder only — no realtime presence service exists. See
 * docs/ROADMAP.md "Future Feature — Live Presence" (still deferred) and
 * docs/ARCHITECTURE.md "Future — Realtime Presence". This is a fixed demo
 * value for the visual composition, not a measurement of anything real.
 */
const DEMO_ONLINE_COUNT = 24

function useClock() {
  const [time, setTime] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setTime(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])
  return time
}

/**
 * EXPERIMENTAL Driver Mode — see docs/MUSIC-SOURCE.md "Experimental
 * YouTube Test Provider" and docs/ROADMAP.md "Driver Mode — Real Music UX
 * Experiment". Rendered outside the main app layout/nav on purpose — no
 * browsing surface, playback-only. Not the permanent Raasta FM
 * architecture: this route uses an isolated YouTube-backed provider
 * (useExperimentalYouTubePlayer), not the app-wide PlayerContext/
 * MockMusicProvider used everywhere else in the app.
 *
 * Favorite acts on the shared app player state (unchanged, see
 * FavoriteButton) rather than the YouTube-sourced track — favoriting a
 * YouTube video is out of scope for this experiment so Favorites'
 * catalog-ID-based data model and persistence stay untouched.
 *
 * Visual identity is the FloatingPlayer pill — the required, visible
 * YouTube <iframe> is rendered separately below, small and unobtrusive so
 * it doesn't visually dominate the experience, but never hidden, zero-
 * sized, or covered (required minimum functionality). See
 * docs/MUSIC-SOURCE.md.
 */
export default function DriverMode() {
  const time = useClock()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const player = useExperimentalYouTubePlayer(containerRef)
  const [thumbnailFailed, setThumbnailFailed] = useState(false)
  const previousTrackIdRef = useRef<string | null>(null)

  if (player.currentTrack?.id !== previousTrackIdRef.current) {
    previousTrackIdRef.current = player.currentTrack?.id ?? null
    if (thumbnailFailed) setThumbnailFailed(false)
  }

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-neutral-950 text-neutral-100">
      <RoadsideBackground />

      <div className="relative flex items-start justify-between px-4 pt-4 text-xs text-neutral-200/80">
        <span suppressHydrationWarning>
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <div className="flex flex-col items-end gap-2">
          <span
            className="flex items-center gap-1.5"
            title="Demo value — live presence not yet implemented"
          >
            <span aria-hidden="true" className="text-emerald-400">
              ●
            </span>
            {DEMO_ONLINE_COUNT} online
          </span>
          {/*
            Required visible YouTube player — kept small and secondary to
            the FloatingPlayer below so it doesn't visually dominate Driver
            Mode, but never hidden, zero-sized, or covered by our own UI.
            See docs/MUSIC-SOURCE.md "Experimental YouTube Test Provider".
          */}
          <div className="aspect-video w-28 overflow-hidden rounded-lg border border-white/10 bg-black sm:w-32">
            <div ref={containerRef} className="h-full w-full" />
          </div>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center px-4">
        <p className="text-sm font-semibold tracking-[0.4em] text-neutral-100 uppercase drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
          Raasta FM
        </p>
      </div>

      <div className="relative flex flex-col items-center gap-4 px-4 pb-8">
        <FloatingPlayer
          currentTrack={player.currentTrack}
          playbackState={player.playbackState}
          progress={player.progress}
          error={player.error}
          thumbnailFailed={thumbnailFailed}
          onThumbnailError={() => setThumbnailFailed(true)}
          onPrevious={player.previous}
          onTogglePlayPause={player.togglePlayPause}
          onNext={player.next}
        />

        <FavoriteButton />

        <Link to="/" className="text-xs text-neutral-400 underline underline-offset-4">
          Exit Driver Mode
        </Link>
      </div>
    </main>
  )
}
