import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { PlaylistsProvider, usePlaylists } from './PlaylistsContext'
import { PlayerProvider, usePlayer } from '../player/PlayerContext'
import { AddToPlaylistControl } from './AddToPlaylistControl'
import { demoTracks } from '../../data/demoTracks'

const [trackA] = demoTracks

function setup() {
  let playerApi: ReturnType<typeof usePlayer> | undefined
  let playlistsApi: ReturnType<typeof usePlaylists> | undefined

  function Capture() {
    playerApi = usePlayer()
    playlistsApi = usePlaylists()
    return null
  }

  render(
    <PlaylistsProvider>
      <PlayerProvider>
        <Capture />
        <AddToPlaylistControl />
      </PlayerProvider>
    </PlaylistsProvider>,
  )

  act(() => {
    playerApi?.setQueue(demoTracks)
  })

  return { player: () => playerApi!, playlists: () => playlistsApi! }
}

describe('AddToPlaylistControl', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('adds the current track to an existing playlist', async () => {
    const user = userEvent.setup()
    const { playlists } = setup()

    let playlistId = ''
    act(() => {
      playlistId = playlists().createPlaylist('Morning Drive')!
    })

    await user.click(screen.getByText('Add to playlist'))
    await user.click(screen.getByRole('button', { name: 'Add to Morning Drive' }))

    expect(playlists().getPlaylistById(playlistId)?.trackIds).toContain(trackA.id)
  })

  it('creates a new playlist and adds the current track to it', async () => {
    const user = userEvent.setup()
    const { playlists } = setup()

    await user.click(screen.getByText('Add to playlist'))
    await user.type(screen.getByLabelText('New playlist name'), 'Night Drive')
    await user.click(screen.getByRole('button', { name: 'Create playlist and add track' }))

    const created = playlists().playlists.find((p) => p.name === 'Night Drive')
    expect(created?.trackIds).toContain(trackA.id)
  })
})
