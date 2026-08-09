import { Link, useParams } from 'react-router-dom'
import { getCategoryById } from '../data/categories'
import { getTracksForCategory } from '../data/demoTracks'

export default function CategoryPage() {
  const { categoryId } = useParams()
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

  return (
    <div>
      <Link to="/" className="text-sm text-neutral-400 underline-offset-4 hover:underline">
        ← Home
      </Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">{category.label}</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {tracks.length} demo track{tracks.length === 1 ? '' : 's'} — playback lands in Step 8/9.
      </p>
      <ul className="mt-6 divide-y divide-neutral-800 border-y border-neutral-800">
        {tracks.map((track) => (
          <li key={track.id} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm text-neutral-100">{track.title}</p>
              <p className="text-xs text-neutral-500">{track.artist}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
