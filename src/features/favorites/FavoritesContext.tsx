import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { readJSON, writeJSON } from '../../services/storage'
import { getTrackById } from '../../data/demoTracks'
import type { Track } from '../../music/types'

const STORAGE_KEY = 'raasta-fm.favorites'

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

interface FavoritesContextValue {
  favoriteIds: string[]
  favoriteTracks: Track[]
  isFavorite: (trackId: string) => boolean
  addFavorite: (trackId: string) => void
  removeFavorite: (trackId: string) => void
  toggleFavorite: (trackId: string) => void
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

/**
 * Stores only track IDs, never whole Track objects — see docs comment on
 * getTrackById. This keeps the persisted data tiny and means swapping the
 * demo catalog for a real authorized provider later can't leave stale
 * duplicated metadata behind; only the ID needs to still resolve.
 *
 * Local-only by design for the prototype (localStorage, single device). If
 * the product later needs cross-device favorites, that's an authenticated
 * sync layer added on top of this same ID-based model, not a rewrite of it.
 */
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    const stored = readJSON<unknown>(STORAGE_KEY, [])
    return isStringArray(stored) ? stored : []
  })

  useEffect(() => {
    writeJSON(STORAGE_KEY, favoriteIds)
  }, [favoriteIds])

  const isFavorite = useCallback((trackId: string) => favoriteIds.includes(trackId), [favoriteIds])

  const addFavorite = useCallback((trackId: string) => {
    setFavoriteIds((current) => (current.includes(trackId) ? current : [...current, trackId]))
  }, [])

  const removeFavorite = useCallback((trackId: string) => {
    setFavoriteIds((current) => current.filter((id) => id !== trackId))
  }, [])

  const toggleFavorite = useCallback(
    (trackId: string) => {
      if (isFavorite(trackId)) {
        removeFavorite(trackId)
      } else {
        addFavorite(trackId)
      }
    },
    [isFavorite, removeFavorite, addFavorite],
  )

  // Stale/unknown IDs (e.g. from an older catalog) are silently dropped here
  // rather than shown as broken rows or thrown as errors.
  const favoriteTracks = useMemo(
    () =>
      favoriteIds
        .map((id) => getTrackById(id))
        .filter((track): track is NonNullable<typeof track> => Boolean(track)),
    [favoriteIds],
  )

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favoriteIds,
      favoriteTracks,
      isFavorite,
      addFavorite,
      removeFavorite,
      toggleFavorite,
    }),
    [favoriteIds, favoriteTracks, isFavorite, addFavorite, removeFavorite, toggleFavorite],
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook is colocated with its provider on purpose
export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
