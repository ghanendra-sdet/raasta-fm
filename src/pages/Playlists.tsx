import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePlaylists } from '../features/playlists/PlaylistsContext'
import { usePlayer } from '../features/player/PlayerContext'

export default function Playlists() {
  const { playlists, createPlaylist, getPlaylistTracks } = usePlaylists()
  const { setQueue, play } = usePlayer()
  const navigate = useNavigate()
  const [name, setName] = useState('')

  function handleCreate(event: FormEvent) {
    event.preventDefault()
    const id = createPlaylist(name)
    if (id) {
      setName('')
      navigate(`/playlists/${id}`)
    }
  }

  function handlePlay(playlistId: string) {
    const tracks = getPlaylistTracks(playlistId)
    if (!tracks.length) return
    setQueue(tracks, 0)
    play()
    navigate('/now-playing')
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">My Playlists</h1>

      <form onSubmit={handleCreate} className="mt-4 flex gap-2">
        <label className="sr-only" htmlFor="new-playlist-name">
          Playlist name
        </label>
        <input
          id="new-playlist-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="New playlist name"
          className="min-w-0 flex-1 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-amber-500 focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Create playlist"
          disabled={!name.trim()}
          className="shrink-0 rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-neutral-950 transition-colors hover:bg-amber-400 disabled:opacity-40"
        >
          Create
        </button>
      </form>

      {playlists.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-1 text-center">
          <p className="text-neutral-300">No playlists yet.</p>
          <p className="max-w-xs text-sm text-neutral-500">
            Create a playlist for your next journey.
          </p>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-neutral-800 border-y border-neutral-800">
          {playlists.map((playlist) => {
            const trackCount = getPlaylistTracks(playlist.id).length
            return (
              <li key={playlist.id} className="flex items-center justify-between py-3">
                <Link to={`/playlists/${playlist.id}`} className="min-w-0 flex-1">
                  <p className="truncate text-sm text-neutral-100">{playlist.name}</p>
                  <p className="text-xs text-neutral-500">
                    {trackCount} song{trackCount === 1 ? '' : 's'}
                  </p>
                </Link>
                <button
                  type="button"
                  aria-label={`Play playlist ${playlist.name}`}
                  onClick={() => handlePlay(playlist.id)}
                  disabled={trackCount === 0}
                  className="ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-700 text-neutral-200 transition-colors hover:border-amber-500 hover:text-amber-400 disabled:opacity-30"
                >
                  <span aria-hidden="true">▶</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
