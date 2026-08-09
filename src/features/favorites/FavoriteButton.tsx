import { usePlayer } from '../player/PlayerContext'
import { useFavorites } from './FavoritesContext'

/**
 * A content action, not a playback control — deliberately separate from
 * PlayerControls (Previous / Play-Pause / Next). See docs/UX.md.
 */
export function FavoriteButton() {
  const { currentTrack } = usePlayer()
  const { isFavorite, toggleFavorite } = useFavorites()

  const favorited = currentTrack ? isFavorite(currentTrack.id) : false

  return (
    <button
      type="button"
      disabled={!currentTrack}
      aria-pressed={favorited}
      onClick={() => currentTrack && toggleFavorite(currentTrack.id)}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors disabled:opacity-30 ${
        favorited
          ? 'border-rose-500/60 text-rose-400 hover:border-rose-400'
          : 'border-neutral-700 text-neutral-300 hover:border-amber-500 hover:text-amber-400'
      }`}
    >
      <span aria-hidden="true">{favorited ? '♥' : '♡'}</span>
      {favorited ? 'Remove from favorites' : 'Favorite'}
    </button>
  )
}
