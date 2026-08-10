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
 * The minimal, saloon.wtf-inspired-in-spirit-only radio interface: title,
 * artist, artwork, a display-only progress readout — no card, no panel, no
 * background fill of its own. Sits directly over RoadsideBackground, with
 * drop-shadow on text for legibility instead of an opaque container.
 * Previous/Play-Pause/Next and Favorite are rendered by the caller
 * (DriverMode.tsx) using the existing shared components.
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
    <div className="flex flex-col items-center gap-3 text-center">
      {error ? (
        <p className="max-w-xs text-sm text-rose-400 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
          {error}
        </p>
      ) : isLoading ? (
        <p className="text-sm text-neutral-300 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
          Tuning in&hellip;
        </p>
      ) : (
        <>
          <p className="max-w-[16rem] truncate text-lg font-semibold text-neutral-50 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] sm:max-w-xs">
            {currentTrack?.title}
          </p>
          <p className="max-w-[16rem] truncate text-sm text-neutral-200 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] sm:max-w-xs">
            {currentTrack?.artist}
          </p>
        </>
      )}

      <div
        className="relative mt-1 h-28 w-28 shrink-0 overflow-hidden rounded-full border-2 border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.5)] sm:h-32 sm:w-32"
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

      {!isLoading && (
        <div className="mt-1 flex w-56 flex-col gap-1">
          <div aria-hidden="true" className="h-1 w-full overflow-hidden rounded-full bg-black/40">
            <div className="h-full rounded-full bg-amber-400" style={{ width: `${percent}%` }} />
          </div>
          <div className="flex justify-between font-mono text-[11px] tabular-nums text-white/75 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            <span>{formatTime(current)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
