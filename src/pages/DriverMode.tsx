import { Link } from 'react-router-dom'
import { usePlayer } from '../features/player/PlayerContext'
import { TrackArtwork } from '../features/player/TrackArtwork'
import { NowPlayingDisplay } from '../features/player/NowPlayingDisplay'
import { PlayerControls } from '../features/player/PlayerControls'
import { FavoriteButton } from '../features/favorites/FavoriteButton'

/**
 * Deliberately rendered outside the main app layout/nav — Driver Mode is
 * playback-only by design, never a browsing surface. See docs/UX.md. Reuses
 * the same player components as /now-playing, just larger, so playback
 * logic and visual identity aren't duplicated. The favorite control is
 * shared for the same reason — it acts on the current track only, not a
 * browsing entry point, so it doesn't turn Driver Mode into a library.
 */
export default function DriverMode() {
  const { currentTrack, playbackState } = usePlayer()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-neutral-950 px-6 py-10 text-center text-neutral-100">
      <p className="text-xs font-medium tracking-[0.35em] text-neutral-500 uppercase">Raasta FM</p>

      {currentTrack ? (
        <>
          <TrackArtwork
            trackId={currentTrack.id}
            isPlaying={playbackState === 'playing'}
            size="large"
          />
          <NowPlayingDisplay track={currentTrack} playbackState={playbackState} />
          <PlayerControls size="large" />
          <FavoriteButton />
        </>
      ) : (
        <p className="max-w-xs text-neutral-500">
          No station selected. Exit Driver Mode and pick one before you drive.
        </p>
      )}

      <Link to="/" className="mt-4 text-sm text-neutral-500 underline underline-offset-4">
        Exit Driver Mode
      </Link>
    </main>
  )
}
