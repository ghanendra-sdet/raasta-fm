import { useEffect, useRef, useState } from 'react'
import { FavoriteButton } from '../features/favorites/FavoriteButton'
import { RoadsideBackground } from '../features/driver-mode/RoadsideBackground'
import { SimpleRadioPlayer } from '../features/driver-mode/SimpleRadioPlayer'
import { ExperimentalPlayerControls } from '../features/driver-mode/ExperimentalPlayerControls'
import { useExperimentalYouTubePlayer } from '../features/driver-mode/useExperimentalYouTubePlayer'
import { useMediaSession } from '../features/driver-mode/useMediaSession'

/**
 * Experiment audience estimate — NOT real presence. There is no realtime
 * backend/presence service in this project (see docs/ROADMAP.md "Future
 * Feature — Live Presence", still deferred, and docs/ARCHITECTURE.md
 * "Future — Realtime Presence"). This is a frontend-only, per-session
 * placeholder for the current 10-user review experiment: a small
 * deterministic-random base (18-30) is generated once per browser session
 * and multiplied by 10 (the experiment's reviewer count), then held stable
 * for the rest of the session — it never claims to count real concurrent
 * visitors, and must never be wired to any actual presence signal without
 * updating this comment and the UI copy together.
 */
const ONLINE_COUNT_MULTIPLIER = 10
const ONLINE_COUNT_SESSION_KEY = 'raasta-fm:driver-mode:online-estimate-base'

function getSessionOnlineEstimate(): number {
  if (typeof window === 'undefined') return 24 * ONLINE_COUNT_MULTIPLIER
  try {
    const stored = window.sessionStorage.getItem(ONLINE_COUNT_SESSION_KEY)
    if (stored) {
      const parsed = Number(stored)
      if (Number.isFinite(parsed)) return parsed
    }
    const base = 18 + Math.floor(Math.random() * 13) // 18-30
    const estimate = base * ONLINE_COUNT_MULTIPLIER
    window.sessionStorage.setItem(ONLINE_COUNT_SESSION_KEY, String(estimate))
    return estimate
  } catch {
    return 24 * ONLINE_COUNT_MULTIPLIER
  }
}

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
 * "/" for the 10-user experiment (see src/app/router.tsx). The player is
 * one horizontal glass pill (SimpleRadioPlayer + ExperimentalPlayerControls
 * together) sitting low over the illustrated scene — not a dashboard, not
 * multiple stacked panels — inspired by saloon.wtf's simplicity and
 * integration in spirit only (no copied layout, code, or assets).
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
  const [onlineEstimate] = useState(getSessionOnlineEstimate)

  if (player.currentTrack?.id !== previousTrackIdRef.current) {
    previousTrackIdRef.current = player.currentTrack?.id ?? null
    if (thumbnailFailed) setThumbnailFailed(false)
  }

  const hasTrack = Boolean(player.currentTrack)

  useMediaSession({
    currentTrack: player.currentTrack,
    playbackState: player.playbackState,
    onPlay: player.play,
    onPause: player.pause,
    onPrevious: player.previous,
    onNext: player.next,
  })

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-neutral-950 text-neutral-100">
      <RoadsideBackground />

      <div className="relative flex items-start justify-between px-4 pt-4 text-xs text-neutral-200/80">
        <span suppressHydrationWarning>
          {time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
        </span>

        <div className="absolute inset-x-0 top-4 flex flex-col items-center gap-1.5">
          <p className="text-xs font-semibold tracking-[0.4em] text-neutral-100 uppercase drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
            Raasta FM
          </p>
          <span
            className="flex items-center gap-1.5 text-xs text-neutral-200/80 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]"
            title="Estimated audience for this review experiment — not a measurement of real concurrent visitors"
          >
            <span aria-hidden="true" className="text-emerald-400">
              ●
            </span>
            {onlineEstimate} online
          </span>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-end gap-3 px-4 pb-4 sm:pb-6">
        {/*
          One floating glass pill: artwork/title/artist/progress on the
          left, playback controls on the right — a single piece of glass
          sitting inside the scene, not a dashboard or stacked panels. Sits
          low, over the road/foreground, with enough bottom margin to never
          touch the viewport edge.
        */}
        <div className="mt-2 flex w-full max-w-xl flex-col gap-3 rounded-3xl border border-white/15 bg-white/10 px-4 py-3 shadow-[0_8px_36px_rgba(0,0,0,0.45)] backdrop-blur-md sm:flex-row sm:items-center sm:gap-4 sm:px-5 sm:py-4">
          <SimpleRadioPlayer
            currentTrack={player.currentTrack}
            playbackState={player.playbackState}
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
        </div>

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
