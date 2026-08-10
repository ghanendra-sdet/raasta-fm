import type { PlaybackState } from '../../music/types'

interface ExperimentalPlayerControlsProps {
  playbackState: PlaybackState
  disabled: boolean
  onPrevious: () => void
  onTogglePlayPause: () => void
  onNext: () => void
}

/**
 * EXPERIMENTAL — visually matches PlayerControls (large, circular, amber)
 * but is wired to useExperimentalYouTubePlayer instead of the app-wide
 * usePlayer(), so it doesn't touch the shared player component. Still
 * Previous / Play-Pause / Next only — no seek, no timestamp.
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
    <div className="flex items-center justify-center gap-6">
      <button
        type="button"
        aria-label="Previous track"
        disabled={disabled}
        onClick={onPrevious}
        className="flex h-14 w-14 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900 text-xl text-neutral-200 transition-colors hover:border-amber-500 hover:text-amber-400 disabled:opacity-30"
      >
        <span aria-hidden="true">⏮</span>
      </button>
      <button
        type="button"
        aria-label={isPlaying ? 'Pause' : 'Play'}
        disabled={disabled}
        onClick={onTogglePlayPause}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-500 text-3xl text-neutral-950 transition-transform hover:scale-105 disabled:scale-100 disabled:bg-neutral-800 disabled:text-neutral-600"
      >
        <span aria-hidden="true">{isPlaying ? '⏸' : '▶'}</span>
      </button>
      <button
        type="button"
        aria-label="Next track"
        disabled={disabled}
        onClick={onNext}
        className="flex h-14 w-14 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900 text-xl text-neutral-200 transition-colors hover:border-amber-500 hover:text-amber-400 disabled:opacity-30"
      >
        <span aria-hidden="true">⏭</span>
      </button>
    </div>
  )
}
