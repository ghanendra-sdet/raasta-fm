import { usePlayer } from './PlayerContext'

interface PlayerControlsProps {
  size?: 'default' | 'large'
}

/**
 * Previous / Play-Pause / Next only — no seek, no timestamp, no scrubbing,
 * no 10-second skip. This is an intentional product constraint, not a
 * missing feature. See docs/UX.md.
 */
export function PlayerControls({ size = 'default' }: PlayerControlsProps) {
  const { currentTrack, playbackState, previous, next, togglePlayPause } = usePlayer()
  const disabled = !currentTrack
  const isPlaying = playbackState === 'playing'

  const sideButtonClass = size === 'large' ? 'h-16 w-16 text-2xl' : 'h-12 w-12 text-lg'
  const playButtonClass = size === 'large' ? 'h-24 w-24 text-4xl' : 'h-16 w-16 text-2xl'

  return (
    <div className="flex items-center justify-center gap-6">
      <button
        type="button"
        aria-label="Previous track"
        disabled={disabled}
        onClick={previous}
        className={`flex ${sideButtonClass} items-center justify-center rounded-full border border-neutral-700 bg-neutral-900 text-neutral-200 transition-colors hover:border-amber-500 hover:text-amber-400 disabled:opacity-30 disabled:hover:border-neutral-700 disabled:hover:text-neutral-200`}
      >
        <span aria-hidden="true">⏮</span>
      </button>
      <button
        type="button"
        aria-label={isPlaying ? 'Pause' : 'Play'}
        disabled={disabled}
        onClick={togglePlayPause}
        className={`flex ${playButtonClass} items-center justify-center rounded-full bg-amber-500 text-neutral-950 transition-transform hover:scale-105 disabled:scale-100 disabled:bg-neutral-800 disabled:text-neutral-600`}
      >
        <span aria-hidden="true">{isPlaying ? '⏸' : '▶'}</span>
      </button>
      <button
        type="button"
        aria-label="Next track"
        disabled={disabled}
        onClick={next}
        className={`flex ${sideButtonClass} items-center justify-center rounded-full border border-neutral-700 bg-neutral-900 text-neutral-200 transition-colors hover:border-amber-500 hover:text-amber-400 disabled:opacity-30 disabled:hover:border-neutral-700 disabled:hover:text-neutral-200`}
      >
        <span aria-hidden="true">⏭</span>
      </button>
    </div>
  )
}
