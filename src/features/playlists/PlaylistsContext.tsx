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

const STORAGE_KEY = 'raasta-fm.playlists'

export interface Playlist {
  id: string
  name: string
  trackIds: string[]
  createdAt: string
  updatedAt: string
}

function isValidPlaylist(value: unknown): value is Playlist {
  if (typeof value !== 'object' || value === null) return false
  const p = value as Record<string, unknown>
  return (
    typeof p.id === 'string' &&
    typeof p.name === 'string' &&
    Array.isArray(p.trackIds) &&
    p.trackIds.every((id) => typeof id === 'string') &&
    typeof p.createdAt === 'string' &&
    typeof p.updatedAt === 'string'
  )
}

// Malformed individual entries are dropped rather than resetting the whole
// collection — one bad row shouldn't cost every other saved playlist.
function sanitizePlaylists(value: unknown): Playlist[] {
  return Array.isArray(value) ? value.filter(isValidPlaylist) : []
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `playlist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

interface PlaylistsContextValue {
  playlists: Playlist[]
  createPlaylist: (name: string) => string | null
  renamePlaylist: (playlistId: string, name: string) => void
  deletePlaylist: (playlistId: string) => void
  addTrackToPlaylist: (playlistId: string, trackId: string) => void
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void
  getPlaylistById: (playlistId: string) => Playlist | undefined
  getPlaylistTracks: (playlistId: string) => Track[]
}

const PlaylistsContext = createContext<PlaylistsContextValue | null>(null)

/**
 * Local-only playlists, keyed by stable track IDs and resolved against the
 * catalog — the same ID-based model as FavoritesContext. This context never
 * duplicates catalog metadata and MusicProvider never knows playlists
 * exist: the only thing that crosses that boundary is a resolved Track[]
 * handed to setQueue(). Swapping the demo catalog for a real provider later
 * only touches getTrackById(), not this layer.
 */
export function PlaylistsProvider({ children }: { children: ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>(() =>
    sanitizePlaylists(readJSON<unknown>(STORAGE_KEY, [])),
  )

  useEffect(() => {
    writeJSON(STORAGE_KEY, playlists)
  }, [playlists])

  const createPlaylist = useCallback((name: string): string | null => {
    const trimmed = name.trim()
    if (!trimmed) return null
    const id = generateId()
    const now = new Date().toISOString()
    setPlaylists((current) => [
      ...current,
      { id, name: trimmed, trackIds: [], createdAt: now, updatedAt: now },
    ])
    return id
  }, [])

  const renamePlaylist = useCallback((playlistId: string, name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setPlaylists((current) =>
      current.map((playlist) =>
        playlist.id === playlistId
          ? { ...playlist, name: trimmed, updatedAt: new Date().toISOString() }
          : playlist,
      ),
    )
  }, [])

  const deletePlaylist = useCallback((playlistId: string) => {
    setPlaylists((current) => current.filter((playlist) => playlist.id !== playlistId))
  }, [])

  const addTrackToPlaylist = useCallback((playlistId: string, trackId: string) => {
    setPlaylists((current) =>
      current.map((playlist) =>
        playlist.id === playlistId && !playlist.trackIds.includes(trackId)
          ? {
              ...playlist,
              trackIds: [...playlist.trackIds, trackId],
              updatedAt: new Date().toISOString(),
            }
          : playlist,
      ),
    )
  }, [])

  const removeTrackFromPlaylist = useCallback((playlistId: string, trackId: string) => {
    setPlaylists((current) =>
      current.map((playlist) =>
        playlist.id === playlistId
          ? {
              ...playlist,
              trackIds: playlist.trackIds.filter((id) => id !== trackId),
              updatedAt: new Date().toISOString(),
            }
          : playlist,
      ),
    )
  }, [])

  const getPlaylistById = useCallback(
    (playlistId: string) => playlists.find((playlist) => playlist.id === playlistId),
    [playlists],
  )

  // Stale/unknown track IDs are silently dropped, same as Favorites.
  const getPlaylistTracks = useCallback(
    (playlistId: string): Track[] => {
      const playlist = playlists.find((p) => p.id === playlistId)
      if (!playlist) return []
      return playlist.trackIds
        .map((id) => getTrackById(id))
        .filter((track): track is NonNullable<typeof track> => Boolean(track))
    },
    [playlists],
  )

  const value = useMemo<PlaylistsContextValue>(
    () => ({
      playlists,
      createPlaylist,
      renamePlaylist,
      deletePlaylist,
      addTrackToPlaylist,
      removeTrackFromPlaylist,
      getPlaylistById,
      getPlaylistTracks,
    }),
    [
      playlists,
      createPlaylist,
      renamePlaylist,
      deletePlaylist,
      addTrackToPlaylist,
      removeTrackFromPlaylist,
      getPlaylistById,
      getPlaylistTracks,
    ],
  )

  return <PlaylistsContext.Provider value={value}>{children}</PlaylistsContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook is colocated with its provider on purpose
export function usePlaylists(): PlaylistsContextValue {
  const context = useContext(PlaylistsContext)
  if (!context) {
    throw new Error('usePlaylists must be used within a PlaylistsProvider')
  }
  return context
}
