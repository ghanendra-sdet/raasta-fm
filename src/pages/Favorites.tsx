import { Link, useNavigate } from 'react-router-dom'
import { useFavorites } from '../features/favorites/FavoritesContext'
import { usePlayer } from '../features/player/PlayerContext'

export default function Favorites() {
  const { favoriteTracks, removeFavorite } = useFavorites()
  const { setQueue, play } = usePlayer()
  const navigate = useNavigate()

  function handlePlay(index: number) {
    setQueue(favoriteTracks, index)
    play()
    navigate('/now-playing')
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">❤️ Favorites</h1>

      {favoriteTracks.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-2 text-center">
          <p className="text-neutral-300">No favorites yet.</p>
          <p className="max-w-xs text-sm text-neutral-500">
            When you find a song you love, tap the heart and it will appear here.
          </p>
          <Link to="/" className="mt-2 text-sm text-amber-400 underline underline-offset-4">
            Browse stations
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-1 text-sm text-neutral-500">
            {favoriteTracks.length} song{favoriteTracks.length === 1 ? '' : 's'}
          </p>
          <ul className="mt-6 divide-y divide-neutral-800 border-y border-neutral-800">
            {favoriteTracks.map((track, index) => (
              <li key={track.id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-neutral-100">{track.title}</p>
                  <p className="truncate text-xs text-neutral-500">{track.artist}</p>
                </div>
                <div className="ml-4 flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Play ${track.title}`}
                    onClick={() => handlePlay(index)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-700 text-neutral-200 transition-colors hover:border-amber-500 hover:text-amber-400"
                  >
                    <span aria-hidden="true">▶</span>
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${track.title} from favorites`}
                    onClick={() => removeFavorite(track.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-700 text-rose-400 transition-colors hover:border-rose-500"
                  >
                    <span aria-hidden="true">♥</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
