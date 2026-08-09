import { Link, useNavigate, useParams } from 'react-router-dom'
import { getCategoryById } from '../data/categories'
import { getTracksForCategory } from '../data/demoTracks'
import { usePlayer } from '../features/player/PlayerContext'

export default function CategoryPage() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const { setQueue, play } = usePlayer()
  const category = categoryId ? getCategoryById(categoryId) : undefined
  const tracks = categoryId ? getTracksForCategory(categoryId) : []

  if (!category) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Category not found</h1>
        <Link
          to="/"
          className="mt-2 inline-block text-sm text-amber-400 underline underline-offset-4"
        >
          Back to Home
        </Link>
      </div>
    )
  }

  function handlePlay(index: number) {
    setQueue(tracks, index)
    play()
    navigate('/now-playing')
  }

  return (
    <div>
      <Link to="/" className="text-sm text-neutral-400 underline-offset-4 hover:underline">
        ← Home
      </Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">{category.label}</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {tracks.length} demo track{tracks.length === 1 ? '' : 's'}
      </p>
      <ul className="mt-6 divide-y divide-neutral-800 border-y border-neutral-800">
        {tracks.map((track, index) => (
          <li key={track.id} className="flex items-center justify-between py-3">
            <div className="min-w-0">
              <p className="truncate text-sm text-neutral-100">{track.title}</p>
              <p className="truncate text-xs text-neutral-500">{track.artist}</p>
            </div>
            <button
              type="button"
              aria-label={`Play ${track.title}`}
              onClick={() => handlePlay(index)}
              className="ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-700 text-neutral-200 transition-colors hover:border-amber-500 hover:text-amber-400"
            >
              <span aria-hidden="true">▶</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
