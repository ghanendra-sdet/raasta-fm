import { Link } from 'react-router-dom'
import { usePlayer } from '../features/player/PlayerContext'
import { TrackArtwork } from '../features/player/TrackArtwork'
import { NowPlayingDisplay } from '../features/player/NowPlayingDisplay'
import { PlayerControls } from '../features/player/PlayerControls'
import { FavoriteButton } from '../features/favorites/FavoriteButton'

export default function PlayerPage() {
  const { currentTrack, playbackState } = usePlayer()

  if (!currentTrack) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Now Playing</h1>
        <p className="max-w-xs text-neutral-400">
          Nothing queued yet. Pick a station from Home and press play.
        </p>
        <Link to="/" className="text-sm text-amber-400 underline underline-offset-4">
          Browse stations
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <p className="text-xs font-medium tracking-[0.3em] text-neutral-500 uppercase">Raasta FM</p>
      <TrackArtwork trackId={currentTrack.id} isPlaying={playbackState === 'playing'} />
      <NowPlayingDisplay track={currentTrack} playbackState={playbackState} />
      <PlayerControls />
      <FavoriteButton />
    </div>
  )
}
