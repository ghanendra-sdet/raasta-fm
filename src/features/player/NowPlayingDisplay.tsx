import type { PlaybackState, Track } from '../../music/types'

interface NowPlayingDisplayProps {
  track: Track | null
  playbackState: PlaybackState
}

/**
 * An old car-stereo LCD panel, not a Spotify-style now-playing card — no
 * progress bar or timestamp belongs here by design. See docs/UX.md.
 */
export function NowPlayingDisplay({ track, playbackState }: NowPlayingDisplayProps) {
  return (
    <div className="w-full max-w-xs rounded-md border border-emerald-900/60 bg-[#08120c] px-4 py-3 text-center shadow-[inset_0_1px_8px_rgba(0,0,0,0.6)]">
      <p className="truncate font-mono text-sm tracking-wide text-emerald-400">
        {track ? track.title : 'No station selected'}
      </p>
      <p className="mt-1 truncate font-mono text-xs text-emerald-600">
        {track ? track.artist : 'Pick a station from Home'}
      </p>
      <p className="mt-2 font-mono text-[10px] tracking-[0.3em] text-emerald-700 uppercase">
        {playbackState}
      </p>
    </div>
  )
}
