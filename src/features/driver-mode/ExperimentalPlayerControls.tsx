import type { PlaybackState } from '../../music/types'

interface ExperimentalPlayerControlsProps {
  playbackState: PlaybackState
  disabled: boolean
  onPrevious: () => void
  onTogglePlayPause: () => void
  onNext: () => void
}

/**
 * EXPERIMENTAL — wired to useExperimentalYouTubePlayer instead of the
 * app-wide usePlayer(), so it doesn't touch the shared player component.
 * Sized and styled to sit inline inside the glass pill alongside
 * SimpleRadioPlayer (see DriverMode.tsx) rather than as its own large,
 * separate control cluster. Still Previous / Play-Pause / Next only — no
 * seek, no timestamp.
 */
export function ExperimentalPlayerControls({
  playbackState,
  disabled,
  onPrevious,
  onTogglePlayPause,
  onNext,
}: ExperimentalPlayerControlsProps) {
  const isPlaying = playbackState === 'playing'

  return (
    <div className="mx-auto flex shrink-0 items-center gap-2 sm:mx-0 sm:gap-3">
      <button
        type="button"
        aria-label="Previous track"
        disabled={disabled}
        onClick={onPrevious}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-base text-neutral-100 transition-colors hover:border-amber-400 hover:text-amber-300 disabled:opacity-30 sm:h-12 sm:w-12"
      >
        <span aria-hidden="true">⏮</span>
      </button>
      <button
        type="button"
        aria-label={isPlaying ? 'Pause' : 'Play'}
        disabled={disabled}
        onClick={onTogglePlayPause}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-xl text-neutral-950 shadow-[0_2px_10px_rgba(0,0,0,0.4)] transition-transform hover:scale-105 disabled:scale-100 disabled:bg-white/20 disabled:text-neutral-400 sm:h-16 sm:w-16"
      >
        <span aria-hidden="true">{isPlaying ? '⏸' : '▶'}</span>
      </button>
      <button
        type="button"
        aria-label="Next track"
        disabled={disabled}
        onClick={onNext}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-base text-neutral-100 transition-colors hover:border-amber-400 hover:text-amber-300 disabled:opacity-30 sm:h-12 sm:w-12"
      >
        <span aria-hidden="true">⏭</span>
      </button>
    </div>
  )
}
