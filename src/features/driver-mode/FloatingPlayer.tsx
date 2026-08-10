import type { PlaybackState, Track } from '../../music/types'
import type { PlaybackProgress } from './useExperimentalYouTubePlayer'
import { ExperimentalPlayerControls } from './ExperimentalPlayerControls'

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

interface ArtworkProps {
  track: Track | null
  thumbnailFailed: boolean
  onThumbnailError: () => void
}

/** Real YouTube thumbnail when available; otherwise the same synthesized
 * "radio dial" visual language as TrackArtwork (src/features/player), sized
 * for the compact pill rather than reusing that fixed-size component. */
function Artwork({ track, thumbnailFailed, onThumbnailError }: ArtworkProps) {
  const thumbnailUrl = track && !thumbnailFailed ? getYouTubeThumbnailUrl(track.id) : null
  const hue = track ? hashToHue(track.id) : 30

  return (
    <div
      className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-white/15 shadow-[0_2px_10px_rgba(0,0,0,0.4)] sm:h-20 sm:w-20 md:h-24 md:w-24"
      style={{
        backgroundImage: `radial-gradient(circle at 35% 30%, hsl(${hue} 65% 24%) 0%, hsl(${hue} 55% 12%) 55%, #0a0a0a 100%)`,
      }}
      role="img"
      aria-label={track ? `Artwork for ${track.title}` : 'No station tuned'}
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
  )
}

interface ProgressRowProps {
  progress: PlaybackProgress | null
}

/** Display-only — no click handlers, no drag, no role="slider". Reflects
 * ExperimentalYouTubeProvider.getProgress() (getCurrentTime/getDuration
 * reads); there is no seek()/setCurrentTime() anywhere in this app. */
function ProgressRow({ progress }: ProgressRowProps) {
  const current = progress?.currentSeconds ?? 0
  const duration = progress?.durationSeconds ?? 0
  const percent = duration > 0 ? Math.min(100, (current / duration) * 100) : 0

  return (
    <div className="mt-2 flex items-center gap-2">
      <div aria-hidden="true" className="h-1 flex-1 overflow-hidden rounded-full bg-white/15">
        <div className="h-full rounded-full bg-amber-400" style={{ width: `${percent}%` }} />
      </div>
      <span className="shrink-0 font-mono text-[11px] tabular-nums text-white/60">
        {formatTime(current)} / {formatTime(duration)}
      </span>
    </div>
  )
}

interface FloatingPlayerProps {
  currentTrack: Track | null
  playbackState: PlaybackState
  progress: PlaybackProgress | null
  error: string | null
  thumbnailFailed: boolean
  onThumbnailError: () => void
  onPrevious: () => void
  onTogglePlayPause: () => void
  onNext: () => void
}

/**
 * The visible Raasta FM player: a warm, translucent floating pill over the
 * roadside background. This is Driver Mode's primary visual surface — the
 * compliant YouTube iframe itself is rendered small and separately (see
 * DriverMode.tsx), not nested inside this card.
 */
export function FloatingPlayer({
  currentTrack,
  playbackState,
  progress,
  error,
  thumbnailFailed,
  onThumbnailError,
  onPrevious,
  onTogglePlayPause,
  onNext,
}: FloatingPlayerProps) {
  const isLoading = !currentTrack && !error

  return (
    <div className="w-full max-w-xl rounded-[2rem] border border-white/15 bg-gradient-to-b from-amber-950/70 to-neutral-950/80 px-4 py-4 shadow-[0_12px_50px_rgba(0,0,0,0.55)] backdrop-blur sm:px-6 sm:py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <div className="flex items-center gap-3 sm:min-w-0 sm:flex-1">
          <Artwork
            track={currentTrack}
            thumbnailFailed={thumbnailFailed}
            onThumbnailError={onThumbnailError}
          />
          <div className="min-w-0 flex-1">
            {error ? (
              <p className="text-sm text-rose-400">{error}</p>
            ) : isLoading ? (
              <p className="text-sm text-neutral-400">Tuning in&hellip;</p>
            ) : (
              <>
                <p className="truncate text-base font-semibold text-neutral-50">
                  {currentTrack?.title}
                </p>
                <p className="truncate text-sm text-neutral-300">{currentTrack?.artist}</p>
                <ProgressRow progress={progress} />
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 sm:shrink-0">
          <ExperimentalPlayerControls
            playbackState={playbackState}
            disabled={isLoading}
            onPrevious={onPrevious}
            onTogglePlayPause={onTogglePlayPause}
            onNext={onNext}
          />
        </div>
      </div>
    </div>
  )
}
