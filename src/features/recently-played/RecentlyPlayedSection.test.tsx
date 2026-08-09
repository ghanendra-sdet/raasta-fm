import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { RecentlyPlayedProvider } from './RecentlyPlayedContext'
import { RecentlyPlayedSection } from './RecentlyPlayedSection'
import { PlayerProvider, usePlayer } from '../player/PlayerContext'
import { FavoritesProvider, useFavorites } from '../favorites/FavoritesContext'
import { PlaylistsProvider, usePlaylists } from '../playlists/PlaylistsContext'
import { demoTracks } from '../../data/demoTracks'

const [trackA, trackB] = demoTracks

function setup() {
  let playerApi: ReturnType<typeof usePlayer> | undefined
  let favoritesApi: ReturnType<typeof useFavorites> | undefined
  let playlistsApi: ReturnType<typeof usePlaylists> | undefined

  function Capture() {
    playerApi = usePlayer()
    favoritesApi = useFavorites()
    playlistsApi = usePlaylists()
    return null
  }

  const utils = render(
    <FavoritesProvider>
      <PlaylistsProvider>
        <PlayerProvider>
          <RecentlyPlayedProvider>
            <MemoryRouter>
              <Capture />
              <RecentlyPlayedSection />
              <Routes>
                <Route path="/" element={null} />
                <Route path="/now-playing" element={<div>NOW PLAYING PAGE</div>} />
              </Routes>
            </MemoryRouter>
          </RecentlyPlayedProvider>
        </PlayerProvider>
      </PlaylistsProvider>
    </FavoritesProvider>,
  )

  return {
    ...utils,
    player: () => playerApi!,
    favorites: () => favoritesApi!,
    playlists: () => playlistsApi!,
  }
}

describe('RecentlyPlayedSection', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('shows an intentional empty state with no fake tracks', () => {
    setup()
    expect(screen.getByText(/no songs played yet/i)).toBeInTheDocument()
    expect(screen.getByText(/start listening/i)).toBeInTheDocument()
  })

  it('lists played tracks and playing one starts the correct queue', async () => {
    const user = userEvent.setup()
    const { player } = setup()

    act(() => {
      player().setQueue([trackA, trackB])
      player().play() // A
    })
    act(() => player().next()) // B — recent order is now [B, A]

    expect(screen.getByText(trackB.title)).toBeInTheDocument()
    expect(screen.getByText(trackA.title)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: `Play ${trackA.title}` }))

    expect(player().currentTrack?.id).toBe(trackA.id)
    expect(player().queue.tracks.map((t) => t.id)).toEqual([trackB.id, trackA.id])
    expect(player().playbackState).toBe('playing')
    expect(await screen.findByText('NOW PLAYING PAGE')).toBeInTheDocument()
  })

  it('clearing history removes all entries and shows the empty state', async () => {
    const user = userEvent.setup()
    const { player } = setup()

    act(() => {
      player().setQueue([trackA])
      player().play()
    })
    expect(screen.getByText(trackA.title)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Clear recently played' }))
    await user.click(screen.getByRole('button', { name: 'Confirm clear recently played history' }))

    expect(screen.queryByText(trackA.title)).not.toBeInTheDocument()
    expect(screen.getByText(/no songs played yet/i)).toBeInTheDocument()
  })

  it('clearing history does not affect Favorites', async () => {
    const user = userEvent.setup()
    const { player, favorites } = setup()

    act(() => favorites().toggleFavorite(trackA.id))
    act(() => {
      player().setQueue([trackA])
      player().play()
    })

    await user.click(screen.getByRole('button', { name: 'Clear recently played' }))
    await user.click(screen.getByRole('button', { name: 'Confirm clear recently played history' }))

    expect(favorites().isFavorite(trackA.id)).toBe(true)
  })

  it('clearing history does not affect Playlists', async () => {
    const user = userEvent.setup()
    const { player, playlists } = setup()

    let playlistId = ''
    act(() => {
      playlistId = playlists().createPlaylist('Morning Drive')!
      playlists().addTrackToPlaylist(playlistId, trackA.id)
    })
    act(() => {
      player().setQueue([trackA])
      player().play()
    })

    await user.click(screen.getByRole('button', { name: 'Clear recently played' }))
    await user.click(screen.getByRole('button', { name: 'Confirm clear recently played history' }))

    expect(playlists().getPlaylistById(playlistId)?.trackIds).toEqual([trackA.id])
  })

  it('clearing history does not stop current playback', async () => {
    const user = userEvent.setup()
    const { player } = setup()

    act(() => {
      player().setQueue([trackA])
      player().play()
    })

    await user.click(screen.getByRole('button', { name: 'Clear recently played' }))
    await user.click(screen.getByRole('button', { name: 'Confirm clear recently played history' }))

    expect(player().playbackState).toBe('playing')
    expect(player().currentTrack?.id).toBe(trackA.id)
  })

  it('cancelling the clear confirmation keeps the history intact', async () => {
    const user = userEvent.setup()
    const { player } = setup()

    act(() => {
      player().setQueue([trackA])
      player().play()
    })

    await user.click(screen.getByRole('button', { name: 'Clear recently played' }))
    await user.click(screen.getByRole('button', { name: 'Cancel clear recently played history' }))

    expect(screen.getByText(trackA.title)).toBeInTheDocument()
  })
})
