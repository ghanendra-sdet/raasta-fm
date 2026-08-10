import type { Track } from '../../music/types'
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
  progress: PlaybackProgress | null
  error: string | null
  thumbnailFailed: boolean
  onThumbnailError: () => void
}

/**
 * The minimal, saloon.wtf-inspired-in-spirit-only radio interface: circular
 * artwork on the left, title/artist/display-only progress in the center.
 * Renders its own content only — the caller (DriverMode.tsx) wraps this
 * together with playback controls in one horizontal glass pill so the
 * whole player reads as a single floating piece of glass sitting inside
 * the illustrated scene, not a dashboard.
 */
export function SimpleRadioPlayer({
  currentTrack,
  progress,
  error,
  thumbnailFailed,
  onThumbnailError,
}: SimpleRadioPlayerProps) {
  const isLoading = !currentTrack && !error
  const thumbnailUrl =
    currentTrack && !thumbnailFailed ? getYouTubeThumbnailUrl(currentTrack.id) : null
  const hue = currentTrack ? hashToHue(currentTrack.id) : 30
  const current = progress?.currentSeconds ?? 0
  const duration = progress?.durationSeconds ?? 0
  const percent = duration > 0 ? Math.min(100, (current / duration) * 100) : 0

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3 text-left sm:gap-4">
      <div
        className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-white/25 shadow-[0_4px_16px_rgba(0,0,0,0.5)] sm:h-16 sm:w-16"
        style={{
          backgroundImage: `radial-gradient(circle at 35% 30%, hsl(${hue} 65% 24%) 0%, hsl(${hue} 55% 12%) 55%, #0a0a0a 100%)`,
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
            <p className="truncate text-sm font-semibold text-neutral-50 sm:text-base">
              {currentTrack?.title}
            </p>
            <p className="truncate text-xs text-neutral-200/85 sm:text-sm">
              {currentTrack?.artist}
            </p>
          </>
        )}

        {!isLoading && (
          <div className="mt-1.5 flex flex-col gap-1">
            <div aria-hidden="true" className="h-1 w-full overflow-hidden rounded-full bg-black/30">
              <div className="h-full rounded-full bg-amber-400" style={{ width: `${percent}%` }} />
            </div>
            <div className="flex justify-between font-mono text-[10px] tabular-nums text-white/70">
              <span>{formatTime(current)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
