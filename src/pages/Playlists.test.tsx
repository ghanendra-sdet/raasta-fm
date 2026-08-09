import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { PlaylistsProvider, usePlaylists } from '../features/playlists/PlaylistsContext'
import { PlayerProvider } from '../features/player/PlayerContext'
import { demoTracks } from '../data/demoTracks'
import Playlists from './Playlists'

const [trackA] = demoTracks

function renderPlaylists() {
  let api: ReturnType<typeof usePlaylists> | undefined

  function Capture() {
    api = usePlaylists()
    return null
  }

  const utils = render(
    <PlaylistsProvider>
      <PlayerProvider>
        <MemoryRouter initialEntries={['/playlists']}>
          <Capture />
          <Routes>
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/playlists/:playlistId" element={<div>PLAYLIST DETAIL PAGE</div>} />
            <Route path="/now-playing" element={<div>NOW PLAYING PAGE</div>} />
          </Routes>
        </MemoryRouter>
      </PlayerProvider>
    </PlaylistsProvider>,
  )

  return { ...utils, playlists: () => api! }
}

describe('Playlists page', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders an intentional empty state when there are no playlists', () => {
    renderPlaylists()
    expect(screen.getByText(/no playlists yet/i)).toBeInTheDocument()
    expect(screen.getByText(/create a playlist for your next journey/i)).toBeInTheDocument()
  })

  it('creates a playlist via the form and navigates to its detail page', async () => {
    const user = userEvent.setup()
    renderPlaylists()

    await user.type(screen.getByLabelText('Playlist name'), 'Morning Drive')
    await user.click(screen.getByRole('button', { name: 'Create playlist' }))

    expect(await screen.findByText('PLAYLIST DETAIL PAGE')).toBeInTheDocument()
  })

  it('does not allow creating a playlist with a whitespace-only name', async () => {
    const user = userEvent.setup()
    renderPlaylists()

    await user.type(screen.getByLabelText('Playlist name'), '   ')
    expect(screen.getByRole('button', { name: 'Create playlist' })).toBeDisabled()
  })

  it('renders existing playlists with their track counts', () => {
    const { playlists } = renderPlaylists()
    act(() => {
      const id = playlists().createPlaylist('Morning Drive')!
      playlists().addTrackToPlaylist(id, trackA.id)
    })

    expect(screen.getByText('Morning Drive')).toBeInTheDocument()
    expect(screen.getByText('1 song')).toBeInTheDocument()
  })
})
