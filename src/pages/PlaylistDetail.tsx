import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { usePlaylists } from '../features/playlists/PlaylistsContext'
import { usePlayer } from '../features/player/PlayerContext'

export default function PlaylistDetail() {
  const { playlistId } = useParams()
  const navigate = useNavigate()
  const {
    getPlaylistById,
    getPlaylistTracks,
    renamePlaylist,
    deletePlaylist,
    removeTrackFromPlaylist,
  } = usePlaylists()
  const { setQueue, play } = usePlayer()

  const playlist = playlistId ? getPlaylistById(playlistId) : undefined
  const tracks = playlistId ? getPlaylistTracks(playlistId) : []

  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState('')

  if (!playlist || !playlistId) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Playlist not found</h1>
        <Link
          to="/playlists"
          className="mt-2 inline-block text-sm text-amber-400 underline underline-offset-4"
        >
          Back to My Playlists
        </Link>
      </div>
    )
  }

  const id = playlistId

  function handlePlayAll() {
    if (!tracks.length) return
    setQueue(tracks, 0)
    play()
    navigate('/now-playing')
  }

  function handlePlayTrack(index: number) {
    setQueue(tracks, index)
    play()
    navigate('/now-playing')
  }

  function startRename() {
    setRenameValue(playlist!.name)
    setIsRenaming(true)
  }

  function handleRenameSubmit(event: FormEvent) {
    event.preventDefault()
    if (!renameValue.trim()) return
    renamePlaylist(id, renameValue)
    setIsRenaming(false)
  }

  function handleDelete() {
    deletePlaylist(id)
    navigate('/playlists')
  }

  return (
    <div>
      <Link to="/playlists" className="text-sm text-neutral-400 underline-offset-4 hover:underline">
        ← My Playlists
      </Link>

      <div className="mt-2 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {isRenaming ? (
            <form onSubmit={handleRenameSubmit} className="flex gap-2">
              <label className="sr-only" htmlFor="rename-playlist">
                Rename playlist
              </label>
              <input
                id="rename-playlist"
                type="text"
                value={renameValue}
                onChange={(event) => setRenameValue(event.target.value)}
                className="min-w-0 flex-1 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-amber-500 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Save playlist name"
                disabled={!renameValue.trim()}
                className="shrink-0 rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-neutral-950 transition-colors hover:bg-amber-400 disabled:opacity-40"
              >
                Save
              </button>
              <button
                type="button"
                aria-label="Cancel rename"
                onClick={() => setIsRenaming(false)}
                className="shrink-0 rounded-md border border-neutral-700 px-3 py-2 text-sm text-neutral-300 transition-colors hover:border-neutral-500"
              >
                Cancel
              </button>
            </form>
          ) : (
            <h1 className="truncate text-2xl font-semibold tracking-tight">{playlist.name}</h1>
          )}
          <p className="mt-1 text-sm text-neutral-500">
            {tracks.length} song{tracks.length === 1 ? '' : 's'}
          </p>
        </div>

        {!isRenaming && (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              aria-label="Rename playlist"
              onClick={startRename}
              className="rounded-md border border-neutral-700 px-3 py-2 text-xs text-neutral-300 transition-colors hover:border-amber-500 hover:text-amber-400"
            >
              Rename
            </button>
            <button
              type="button"
              aria-label="Delete playlist"
              onClick={handleDelete}
              className="rounded-md border border-neutral-700 px-3 py-2 text-xs text-rose-400 transition-colors hover:border-rose-500"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        aria-label={`Play playlist ${playlist.name}`}
        onClick={handlePlayAll}
        disabled={tracks.length === 0}
        className="mt-4 rounded-full bg-amber-500 px-5 py-2 text-sm font-medium text-neutral-950 transition-colors hover:bg-amber-400 disabled:opacity-30"
      >
        <span aria-hidden="true">▶</span> Play playlist
      </button>

      {tracks.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-1 text-center">
          <p className="text-neutral-300">This playlist is empty.</p>
          <p className="max-w-xs text-sm text-neutral-500">Add songs from the Raasta FM catalog.</p>
          <Link to="/home" className="mt-2 text-sm text-amber-400 underline underline-offset-4">
            Browse stations
          </Link>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-neutral-800 border-y border-neutral-800">
          {tracks.map((track, index) => (
            <li key={track.id} className="flex items-center justify-between py-3">
              <div className="min-w-0">
                <p className="truncate text-sm text-neutral-100">{track.title}</p>
                <p className="truncate text-xs text-neutral-500">{track.artist}</p>
              </div>
              <div className="ml-4 flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  aria-label={`Play ${track.title}`}
                  onClick={() => handlePlayTrack(index)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-700 text-neutral-200 transition-colors hover:border-amber-500 hover:text-amber-400"
                >
                  <span aria-hidden="true">▶</span>
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${track.title} from playlist`}
                  onClick={() => removeTrackFromPlaylist(id, track.id)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-700 text-neutral-400 transition-colors hover:border-rose-500 hover:text-rose-400"
                >
                  <span aria-hidden="true">✕</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
