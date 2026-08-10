import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FavoriteButton } from '../features/favorites/FavoriteButton'
import { RoadsideBackground } from '../features/driver-mode/RoadsideBackground'
import { ExperimentalPlayerControls } from '../features/driver-mode/ExperimentalPlayerControls'
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
 */
export default function DriverMode() {
  const time = useClock()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const player = useExperimentalYouTubePlayer(containerRef)
  const isLoading = !player.currentTrack && !player.error

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-neutral-950 text-neutral-100">
      <RoadsideBackground />

      <div className="relative flex items-center justify-between px-4 pt-4 text-xs text-neutral-200/80">
        <span suppressHydrationWarning>
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <span
          className="flex items-center gap-1.5"
          title="Demo value — live presence not yet implemented"
        >
          <span aria-hidden="true" className="text-emerald-400">
            ●
          </span>
          {DEMO_ONLINE_COUNT} online
        </span>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center px-4">
        <p className="text-sm font-semibold tracking-[0.4em] text-neutral-100 uppercase drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
          Raasta FM
        </p>
      </div>

      <div className="relative flex flex-col items-center gap-4 px-4 pb-8">
        <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-neutral-950/80 p-4 shadow-[0_8px_40px_rgba(0,0,0,0.5)] backdrop-blur">
          {/*
            Required visible YouTube player — must stay visible with its
            native controls/attribution, never hidden or covered by our own
            UI. See docs/MUSIC-SOURCE.md.
          */}
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
            <div ref={containerRef} className="h-full w-full" />
          </div>

          <div className="mt-3 text-center">
            {player.error ? (
              <p className="text-xs text-rose-400">{player.error}</p>
            ) : isLoading ? (
              <p className="text-xs text-neutral-500">Tuning in&hellip;</p>
            ) : (
              <>
                <p className="truncate text-sm text-neutral-100">{player.currentTrack?.title}</p>
                <p className="truncate text-xs text-neutral-500">{player.currentTrack?.artist}</p>
              </>
            )}
          </div>

          <div className="mt-4 flex flex-col items-center gap-3">
            <ExperimentalPlayerControls
              playbackState={player.playbackState}
              disabled={isLoading}
              onPrevious={player.previous}
              onTogglePlayPause={player.togglePlayPause}
              onNext={player.next}
            />
            <FavoriteButton />
          </div>
        </div>

        <Link to="/" className="text-xs text-neutral-400 underline underline-offset-4">
          Exit Driver Mode
        </Link>
      </div>
    </main>
  )
}
