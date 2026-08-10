import { useEffect, useRef, useState } from 'react'
import { FavoriteButton } from '../features/favorites/FavoriteButton'
import { RoadsideBackground } from '../features/driver-mode/RoadsideBackground'
import { SimpleRadioPlayer } from '../features/driver-mode/SimpleRadioPlayer'
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
 * Temporary public-review configuration: this is also what renders at
 * "/" for the 10-user experiment (see src/app/router.tsx) — no card, no
 * dashboard, just title/artist/artwork/progress/controls integrated
 * directly over the roadside illustration, inspired by saloon.wtf's
 * simplicity in spirit only (no copied layout, code, or assets).
 *
 * Favorite acts on the shared app player state (unchanged, see
 * FavoriteButton) rather than the YouTube-sourced track — favoriting a
 * YouTube video is out of scope for this experiment so Favorites'
 * catalog-ID-based data model and persistence stay untouched.
 *
 * The required, visible YouTube <iframe> is deliberately NOT placed next
 * to the "online" indicator or any other Raasta FM UI element — it sits
 * alone in the bottom-left corner, small and unstyled, so it reads as a
 * required technical/legal element rather than a second "video player"
 * paired with our own UI. It can never be hidden, zero-sized, opacity-0,
 * moved off-screen, clipped, or covered (YouTube's required minimum
 * functionality) — see docs/MUSIC-SOURCE.md for the full compliance
 * rationale and the limits this places on how small/discreet it can be.
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

  const hasTrack = Boolean(player.currentTrack)

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-neutral-950 text-neutral-100">
      <RoadsideBackground />

      <div className="relative px-4 pt-4 text-xs text-neutral-200/80">
        <span suppressHydrationWarning>
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center gap-4 px-4 py-6">
        <p className="text-sm font-semibold tracking-[0.4em] text-neutral-100 uppercase drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
          Raasta FM
        </p>

        <span
          className="flex items-center gap-1.5 text-xs text-neutral-200/80 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]"
          title="Demo value — live presence not yet implemented"
        >
          <span aria-hidden="true" className="text-emerald-400">
            ●
          </span>
          {DEMO_ONLINE_COUNT} online
        </span>

        <SimpleRadioPlayer
          currentTrack={player.currentTrack}
          progress={player.progress}
          error={player.error}
          thumbnailFailed={thumbnailFailed}
          onThumbnailError={() => setThumbnailFailed(true)}
        />

        <ExperimentalPlayerControls
          playbackState={player.playbackState}
          disabled={!hasTrack}
          onPrevious={player.previous}
          onTogglePlayPause={player.togglePlayPause}
          onNext={player.next}
        />

        <FavoriteButton />
      </div>

      {/*
        Required visible YouTube player. Isolated in its own corner, away
        from "online" and every other Raasta FM element, at the smallest
        size and plainest presentation we judge to still be a genuinely
        visible, operable player surface (real, non-zero pixels; native
        controls and attribution rendered; not clipped) — no card framing/
        background. Never hidden, zero-sized, opacity-0, moved off-screen,
        clipped, or covered by our own UI. See docs/MUSIC-SOURCE.md
        "Experimental YouTube Test Provider".
      */}
      <div className="relative flex justify-start px-4 pb-3">
        <div className="aspect-video w-8 shrink-0 overflow-hidden">
          <div ref={containerRef} className="h-full w-full" />
        </div>
      </div>
    </main>
  )
}
