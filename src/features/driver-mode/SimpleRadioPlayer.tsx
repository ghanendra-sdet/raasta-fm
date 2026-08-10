import { useState } from 'react'
import type { PlaybackState, Track } from '../../music/types'
import type { PlaybackProgress } from './useExperimentalYouTubePlayer'

function hashToHue(id: string): number {
  let hash = 0
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) | 0
  }
  return Math.abs(hash) % 360
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const whole = Math.floor(seconds)
  const minutes = Math.floor(whole / 60)
  const secs = whole % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

/**
 * YouTube's standard, publicly documented per-video thumbnail URL pattern
 * (used by embeds/oEmbed everywhere) — a live hotlink rendered by the
 * browser, never fetched/saved by our code. Not "downloading or storing"
 * artwork; no different from any site referencing an <img src>.
 */
function getYouTubeThumbnailUrl(trackId: string): string | null {
  if (!trackId.startsWith('youtube:')) return null
  const videoId = trackId.slice('youtube:'.length)
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null
}

interface SimpleRadioPlayerProps {
  currentTrack: Track | null
  playbackState: PlaybackState
  progress: PlaybackProgress | null
  error: string | null
  thumbnailFailed: boolean
  onThumbnailError: () => void
  onSeek: (seconds: number) => void
}

/**
 * The minimal, saloon.wtf-inspired-in-spirit-only radio interface: circular
 * artwork on the left, title/artist/progress in the center. Renders its own
 * content only — the caller (DriverMode.tsx) wraps this together with
 * playback controls in one horizontal glass pill so the whole player reads
 * as a single floating piece of glass sitting inside the illustrated
 * scene, not a dashboard.
 *
 * Progress is seekable (reviewer feedback: several playlist videos open
 * with a spoken/dialogue intro before the song starts, and listeners want
 * to skip past it) via a native <input type="range">, wired to
 * ExperimentalYouTubeProvider.seekTo() — a narrow, deliberate exception to
 * the app's normal no-seek rule, scoped to this experimental provider only
 * (see that class's doc comment and docs/UX.md).
 */
export function SimpleRadioPlayer({
  currentTrack,
  playbackState,
  progress,
  error,
  thumbnailFailed,
  onThumbnailError,
  onSeek,
}: SimpleRadioPlayerProps) {
  const isLoading = !currentTrack && !error
  const isPlaying = playbackState === 'playing'
  const thumbnailUrl =
    currentTrack && !thumbnailFailed ? getYouTubeThumbnailUrl(currentTrack.id) : null
  const hue = currentTrack ? hashToHue(currentTrack.id) : 30
  const current = progress?.currentSeconds ?? 0
  const duration = progress?.durationSeconds ?? 0

  // While the user is actively dragging, show the drag position instead of
  // the polled live position (which would otherwise fight the drag every
  // ~500ms) — cleared back to null once they release and seek() is called.
  const [dragValue, setDragValue] = useState<number | null>(null)
  const displaySeconds = dragValue ?? current
  const percent = duration > 0 ? Math.min(100, (displaySeconds / duration) * 100) : 0
  const canSeek = duration > 0

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3 text-left sm:gap-4">
      <div
        className="relative h-14 w-14 shrink-0 animate-[spin_6s_linear_infinite] overflow-hidden rounded-full border-2 border-white/25 shadow-[0_4px_16px_rgba(0,0,0,0.5)] motion-reduce:animate-none sm:h-20 sm:w-20"
        style={{
          backgroundImage: `radial-gradient(circle at 35% 30%, hsl(${hue} 65% 24%) 0%, hsl(${hue} 55% 12%) 55%, #0a0a0a 100%)`,
          animationPlayState: isPlaying ? 'running' : 'paused',
        }}
        role="img"
        aria-label={currentTrack ? `Artwork for ${currentTrack.title}` : 'No station tuned'}
      >
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            onError={onThumbnailError}
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        {error ? (
          <p className="truncate text-sm text-rose-300">{error}</p>
        ) : isLoading ? (
          <p className="text-sm text-neutral-100/90">Tuning in&hellip;</p>
        ) : (
          <>
            <p className="truncate text-sm font-semibold text-neutral-50 sm:text-lg">
              {currentTrack?.title}
            </p>
            <p className="truncate text-xs text-neutral-200/85 sm:text-base">
              {currentTrack?.artist}
            </p>
          </>
        )}

        {!isLoading && (
          <div className="mt-1.5 flex flex-col gap-1">
            <div className="relative flex h-4 w-full items-center">
              <div
                aria-hidden="true"
                className="absolute inset-x-0 h-1 overflow-hidden rounded-full bg-black/30"
              >
                <div
                  className="h-full rounded-full bg-amber-400"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <input
                type="range"
                aria-label="Seek"
                min={0}
                max={duration || 0}
                step={1}
                value={displaySeconds}
                disabled={!canSeek}
                onChange={(event) => setDragValue(Number(event.target.value))}
                onPointerUp={(event) => {
                  onSeek(Number(event.currentTarget.value))
                  setDragValue(null)
                }}
                onKeyUp={(event) => {
                  if (dragValue === null) return
                  onSeek(Number(event.currentTarget.value))
                  setDragValue(null)
                }}
                className="relative h-4 w-full cursor-pointer appearance-none bg-transparent disabled:cursor-default [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-amber-300 [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:mt-[-5px] [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-300"
              />
            </div>
            <div className="flex justify-between font-mono text-[10px] tabular-nums text-white/70 sm:text-xs">
              <span>{formatTime(displaySeconds)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
