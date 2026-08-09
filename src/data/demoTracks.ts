import type { Track } from '../music/types'
import { categories } from './categories'

export interface CatalogTrack extends Track {
  categoryId: string
}

const TRACKS_PER_CATEGORY = 5

/**
 * Demo/mock catalog only — titles are placeholders, not real song metadata.
 * See docs/MUSIC-SOURCE.md: no real catalog or audio exists yet.
 */
export const demoTracks: CatalogTrack[] = categories.flatMap((category) =>
  Array.from({ length: TRACKS_PER_CATEGORY }, (_, index) => {
    const n = index + 1
    return {
      id: `${category.id}-${n}`,
      title: `${category.label} Demo Track ${n}`,
      artist: 'Raasta FM Demo Audio',
      categoryId: category.id,
    }
  }),
)

export function getTracksForCategory(categoryId: string): CatalogTrack[] {
  return demoTracks.filter((track) => track.categoryId === categoryId)
}
