import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { PlaylistsProvider, usePlaylists } from '../features/playlists/PlaylistsContext'
import { PlayerProvider, usePlayer } from '../features/player/PlayerContext'
import { demoTracks } from '../data/demoTracks'
import PlaylistDetail from './PlaylistDetail'

const [trackA, trackB] = demoTracks

/**
 * Seeds a playlist via one PlaylistsProvider instance, then unmounts it and
 * renders a fresh provider tree routed to that playlist — mirrors how a
 * real page load would rehydrate from localStorage, same pattern used for
 * Favorites' "survives reload" coverage.
 */
function renderPlaylistDetail() {
  let seedApi: ReturnType<typeof usePlaylists> | undefined

  function Seed() {
    seedApi = usePlaylists()
    return null
  }

  const seedRender = render(
    <PlaylistsProvider>
      <Seed />
    </PlaylistsProvider>,
  )

  let playlistId = ''
  act(() => {
    playlistId = seedApi!.createPlaylist('Morning Drive')!
    seedApi!.addTrackToPlaylist(playlistId, trackA.id)
    seedApi!.addTrackToPlaylist(playlistId, trackB.id)
  })
  seedRender.unmount()

  let playerApi: ReturnType<typeof usePlayer> | undefined

  function CapturePlayer() {
    playerApi = usePlayer()
    return null
  }

  const utils = render(
    <PlaylistsProvider>
      <PlayerProvider>
        <MemoryRouter initialEntries={[`/playlists/${playlistId}`]}>
          <CapturePlayer />
          <Routes>
            <Route path="/playlists/:playlistId" element={<PlaylistDetail />} />
            <Route path="/now-playing" element={<div>NOW PLAYING PAGE</div>} />
            <Route path="/playlists" element={<div>PLAYLISTS PAGE</div>} />
          </Routes>
        </MemoryRouter>
      </PlayerProvider>
    </PlaylistsProvider>,
  )

  return { playlistId, player: () => playerApi!, ...utils }
}

describe('PlaylistDetail', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders the playlist name, track count, and tracks', () => {
    renderPlaylistDetail()
    expect(screen.getByRole('heading', { name: 'Morning Drive' })).toBeInTheDocument()
    expect(screen.getByText('2 songs')).toBeInTheDocument()
    expect(screen.getByText(trackA.title)).toBeInTheDocument()
    expect(screen.getByText(trackB.title)).toBeInTheDocument()
  })

  it('playing the whole playlist creates the correct queue starting at the first track', async () => {
    const user = userEvent.setup()
    const { player } = renderPlaylistDetail()

    await user.click(screen.getByRole('button', { name: 'Play playlist Morning Drive' }))

    expect(player().queue.tracks.map((t) => t.id)).toEqual([trackA.id, trackB.id])
    expect(player().currentTrack?.id).toBe(trackA.id)
    expect(player().playbackState).toBe('playing')
  })

  it('playing a selected track starts the queue at that track', async () => {
    const user = userEvent.setup()
    const { player } = renderPlaylistDetail()

    await user.click(screen.getByRole('button', { name: `Play ${trackB.title}` }))

    expect(player().currentTrack?.id).toBe(trackB.id)
    expect(player().queue.tracks.map((t) => t.id)).toEqual([trackA.id, trackB.id])
  })

  it('removes only the selected track', async () => {
    const user = userEvent.setup()
    renderPlaylistDetail()

    await user.click(screen.getByRole('button', { name: `Remove ${trackA.title} from playlist` }))

    expect(screen.queryByText(trackA.title)).not.toBeInTheDocument()
    expect(screen.getByText(trackB.title)).toBeInTheDocument()
    expect(screen.getByText('1 song')).toBeInTheDocument()
  })

  it('renames the playlist', async () => {
    const user = userEvent.setup()
    renderPlaylistDetail()

    await user.click(screen.getByRole('button', { name: 'Rename playlist' }))
    const input = screen.getByLabelText('Rename playlist')
    await user.clear(input)
    await user.type(input, 'Sunday Drive')
    await user.click(screen.getByRole('button', { name: 'Save playlist name' }))

    expect(screen.getByRole('heading', { name: 'Sunday Drive' })).toBeInTheDocument()
  })

  it('deleting the playlist does not stop an unrelated track already playing', async () => {
    const user = userEvent.setup()
    const { player } = renderPlaylistDetail()

    act(() => {
      player().setQueue(demoTracks.slice(2, 3))
      player().play()
    })
    const unrelatedTrackId = player().currentTrack?.id

    await user.click(screen.getByRole('button', { name: 'Delete playlist' }))

    expect(player().playbackState).toBe('playing')
    expect(player().currentTrack?.id).toBe(unrelatedTrackId)
  })
})
