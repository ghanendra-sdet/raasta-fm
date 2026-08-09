import { Link } from 'react-router-dom'
import { categoryGroups, getCategoriesByGroup } from '../data/categories'
import { RecentlyPlayedSection } from '../features/recently-played/RecentlyPlayedSection'

export default function Home() {
  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Raasta FM</h1>
        <p className="mt-1 text-neutral-400">Choose your journey.</p>
      </div>

      <RecentlyPlayedSection />

      {categoryGroups.map((group) => (
        <section key={group.id}>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-medium tracking-wide text-neutral-300 uppercase">
            <span aria-hidden="true">{group.icon}</span>
            {group.label}
          </h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {getCategoriesByGroup(group.id).map((category) => (
              <li key={category.id}>
                <Link
                  to={`/category/${category.id}`}
                  className="block rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-200 transition-colors hover:border-amber-500/60 hover:text-amber-400"
                >
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
