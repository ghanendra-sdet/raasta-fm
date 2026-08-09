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
import { usePlayer } from '../player/PlayerContext'
import type { Track } from '../../music/types'

const STORAGE_KEY = 'raasta-fm.recently-played'
const MAX_ENTRIES = 20

interface RecentlyPlayedEntry {
  trackId: string
  playedAt: string
}

function isValidEntry(value: unknown): value is RecentlyPlayedEntry {
  if (typeof value !== 'object' || value === null) return false
  const e = value as Record<string, unknown>
  return typeof e.trackId === 'string' && typeof e.playedAt === 'string'
}

function sanitizeEntries(value: unknown): RecentlyPlayedEntry[] {
  return Array.isArray(value) ? value.filter(isValidEntry) : []
}

interface RecentlyPlayedContextValue {
  entries: RecentlyPlayedEntry[]
  recentTracks: Track[]
  clearHistory: () => void
}

const RecentlyPlayedContext = createContext<RecentlyPlayedContextValue | null>(null)

/**
 * Records a play only when PlayerContext's own state actually transitions
 * into 'playing' for the current track — never on queueing, favoriting, or
 * adding to a playlist, and never via a second playback mechanism. Same
 * ID-based, storage.ts-backed model as Favorites/Playlists.
 *
 * Must be mounted inside PlayerProvider (it calls usePlayer()) so it
 * observes playback regardless of which page is currently rendered.
 */
export function RecentlyPlayedProvider({ children }: { children: ReactNode }) {
  const { currentTrack, playbackState } = usePlayer()
  const [entries, setEntries] = useState<RecentlyPlayedEntry[]>(() =>
    sanitizeEntries(readJSON<unknown>(STORAGE_KEY, [])),
  )

  useEffect(() => {
    writeJSON(STORAGE_KEY, entries)
  }, [entries])

  useEffect(() => {
    if (playbackState !== 'playing' || !currentTrack) return
    const trackId = currentTrack.id
    // Syncing to an external system's state change (MusicProvider via
    // usePlayer), not deriving state from this component's own
    // props/state — the pattern the lint rule warns about doesn't apply.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntries((current) => {
      // De-dup and move to top rather than append — a track can only ever
      // appear once, at its most recent play position.
      const withoutTrack = current.filter((entry) => entry.trackId !== trackId)
      const next = [{ trackId, playedAt: new Date().toISOString() }, ...withoutTrack]
      return next.slice(0, MAX_ENTRIES)
    })
  }, [currentTrack, playbackState])

  const clearHistory = useCallback(() => {
    setEntries([])
  }, [])

  // Stale/unknown track IDs are silently dropped, same as Favorites/Playlists.
  const recentTracks = useMemo(
    () =>
      entries
        .map((entry) => getTrackById(entry.trackId))
        .filter((track): track is NonNullable<typeof track> => Boolean(track)),
    [entries],
  )

  const value = useMemo<RecentlyPlayedContextValue>(
    () => ({ entries, recentTracks, clearHistory }),
    [entries, recentTracks, clearHistory],
  )

  return <RecentlyPlayedContext.Provider value={value}>{children}</RecentlyPlayedContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook is colocated with its provider on purpose
export function useRecentlyPlayed(): RecentlyPlayedContextValue {
  const context = useContext(RecentlyPlayedContext)
  if (!context) {
    throw new Error('useRecentlyPlayed must be used within a RecentlyPlayedProvider')
  }
  return context
}
