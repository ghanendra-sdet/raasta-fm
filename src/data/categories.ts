export type CategoryGroupId = 'era' | 'mood' | 'bhakti'

export interface CategoryGroup {
  id: CategoryGroupId
  label: string
  icon: string
}

export interface Category {
  id: string
  label: string
  group: CategoryGroupId
}

export const categoryGroups: CategoryGroup[] = [
  { id: 'era', label: 'By Era', icon: '🕰️' },
  { id: 'mood', label: 'By Mood', icon: '❤️' },
  { id: 'bhakti', label: 'Bhakti', icon: '🛕' },
]

export const categories: Category[] = [
  // By Era
  { id: 'era-70-80s', label: '70s & 80s Classics', group: 'era' },
  { id: 'era-90s', label: '90s Hindi', group: 'era' },
  { id: 'era-2000-2005', label: '2000–2005', group: 'era' },
  { id: 'era-2006-2010', label: '2006–2010', group: 'era' },
  { id: 'era-2010s', label: '2010s', group: 'era' },
  { id: 'era-recent', label: 'Recent Hindi', group: 'era' },

  // By Mood
  { id: 'mood-romantic', label: 'Romantic', group: 'mood' },
  { id: 'mood-road-trip', label: 'Road Trip', group: 'mood' },
  { id: 'mood-feel-good', label: 'Feel Good', group: 'mood' },
  { id: 'mood-sad', label: 'Sad Songs', group: 'mood' },
  { id: 'mood-high-energy', label: 'High Energy', group: 'mood' },
  { id: 'mood-party', label: 'Party', group: 'mood' },
  { id: 'mood-night-drive', label: 'Night Drive', group: 'mood' },
  { id: 'mood-evergreen', label: 'Evergreen', group: 'mood' },
  { id: 'mood-retro', label: 'Retro', group: 'mood' },

  // Bhakti
  { id: 'bhakti-songs', label: 'Bhakti Songs', group: 'bhakti' },
  { id: 'bhakti-morning', label: 'Morning Bhakti', group: 'bhakti' },
  { id: 'bhakti-shiv', label: 'Shiv Bhajan', group: 'bhakti' },
  { id: 'bhakti-krishna', label: 'Krishna Bhajan', group: 'bhakti' },
  { id: 'bhakti-ram', label: 'Ram Bhajan', group: 'bhakti' },
  { id: 'bhakti-ganesh', label: 'Ganesh Bhajan', group: 'bhakti' },
  { id: 'bhakti-hanuman', label: 'Hanuman Bhajan', group: 'bhakti' },
  { id: 'bhakti-devi', label: 'Devi Bhajan', group: 'bhakti' },
  { id: 'bhakti-mantra', label: 'Mantra / Spiritual', group: 'bhakti' },
]

export function getCategoriesByGroup(group: CategoryGroupId): Category[] {
  return categories.filter((category) => category.group === group)
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find((category) => category.id === id)
}
