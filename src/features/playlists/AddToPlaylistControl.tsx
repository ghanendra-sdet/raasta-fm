import { useState, type FormEvent } from 'react'
import { usePlayer } from '../player/PlayerContext'
import { usePlaylists } from './PlaylistsContext'

/**
 * A native <details>/<summary> disclosure — keyboard-operable and toggled
 * by the browser for free, no modal system needed. A separate content
 * action from FavoriteButton on purpose: "songs I like" and "songs I
 * grouped together" are different decisions. See docs/PRODUCT.md.
 */
export function AddToPlaylistControl() {
  const { currentTrack } = usePlayer()
  const { playlists, createPlaylist, addTrackToPlaylist } = usePlaylists()
  const [newName, setNewName] = useState('')
  const [addedTo, setAddedTo] = useState<string | null>(null)

  if (!currentTrack) return null

  function handleAddExisting(playlistId: string, playlistName: string) {
    if (!currentTrack) return
    addTrackToPlaylist(playlistId, currentTrack.id)
    setAddedTo(playlistName)
  }

  function handleCreateAndAdd(event: FormEvent) {
    event.preventDefault()
    if (!currentTrack) return
    const trimmed = newName.trim()
    if (!trimmed) return
    const id = createPlaylist(trimmed)
    if (id) {
      addTrackToPlaylist(id, currentTrack.id)
      setAddedTo(trimmed)
    }
    setNewName('')
  }

  return (
    <details className="w-full max-w-xs rounded-md border border-neutral-800 bg-neutral-900/60 text-sm text-neutral-300">
      <summary className="cursor-pointer list-none px-4 py-2 text-center transition-colors hover:text-amber-400">
        Add to playlist
      </summary>
      <div className="border-t border-neutral-800 px-4 py-3">
        {addedTo && <p className="mb-2 text-xs text-emerald-400">Added to {addedTo}.</p>}

        {playlists.length > 0 && (
          <ul className="mb-3 flex flex-col gap-1">
            {playlists.map((playlist) => (
              <li key={playlist.id}>
                <button
                  type="button"
                  aria-label={`Add to ${playlist.name}`}
                  onClick={() => handleAddExisting(playlist.id, playlist.name)}
                  className="w-full truncate rounded-md px-2 py-1.5 text-left text-neutral-200 transition-colors hover:bg-neutral-800"
                >
                  {playlist.name}
                </button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleCreateAndAdd} className="flex gap-2">
          <label className="sr-only" htmlFor="add-to-new-playlist">
            New playlist name
          </label>
          <input
            id="add-to-new-playlist"
            type="text"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="New playlist"
            className="min-w-0 flex-1 rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-xs text-neutral-100 placeholder:text-neutral-600 focus:border-amber-500 focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Create playlist and add track"
            disabled={!newName.trim()}
            className="shrink-0 rounded-md bg-amber-500 px-3 py-1.5 text-xs font-medium text-neutral-950 transition-colors hover:bg-amber-400 disabled:opacity-40"
          >
            Create
          </button>
        </form>
      </div>
    </details>
  )
}
