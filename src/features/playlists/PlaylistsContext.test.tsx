import { act, render } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { PlaylistsProvider, usePlaylists } from './PlaylistsContext'
import { demoTracks } from '../../data/demoTracks'

const [trackA, trackB] = demoTracks
const STORAGE_KEY = 'raasta-fm.playlists'

function setup() {
  let api: ReturnType<typeof usePlaylists> | undefined

  function Capture() {
    api = usePlaylists()
    return null
  }

  const utils = render(
    <PlaylistsProvider>
      <Capture />
    </PlaylistsProvider>,
  )

  return { ...utils, api: () => api! }
}

describe('PlaylistsContext', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('starts with no playlists', () => {
    const { api } = setup()
    expect(api().playlists).toEqual([])
  })

  it('creates a playlist', () => {
    const { api } = setup()
    let id: string | null = null
    act(() => {
      id = api().createPlaylist('Morning Drive')
    })
    expect(id).not.toBeNull()
    expect(api().playlists).toHaveLength(1)
    expect(api().playlists[0].name).toBe('Morning Drive')
    expect(api().playlists[0].trackIds).toEqual([])
  })

  it('rejects an empty or whitespace-only playlist name', () => {
    const { api } = setup()
    let idEmpty: string | null = 'not-null-yet'
    let idWhitespace: string | null = 'not-null-yet'
    act(() => {
      idEmpty = api().createPlaylist('')
      idWhitespace = api().createPlaylist('   ')
    })
    expect(idEmpty).toBeNull()
    expect(idWhitespace).toBeNull()
    expect(api().playlists).toEqual([])
  })

  it('renames a playlist', () => {
    const { api } = setup()
    let id = ''
    act(() => {
      id = api().createPlaylist('Morning Drive')!
    })
    act(() => api().renamePlaylist(id, 'Evening Drive'))
    expect(api().getPlaylistById(id)?.name).toBe('Evening Drive')
  })

  it('deletes a playlist', () => {
    const { api } = setup()
    let id = ''
    act(() => {
      id = api().createPlaylist('Temporary')!
    })
    act(() => api().deletePlaylist(id))
    expect(api().playlists).toEqual([])
  })

  it('adds a track to a playlist', () => {
    const { api } = setup()
    let id = ''
    act(() => {
      id = api().createPlaylist('Morning Drive')!
    })
    act(() => api().addTrackToPlaylist(id, trackA.id))
    expect(api().getPlaylistById(id)?.trackIds).toEqual([trackA.id])
  })

  it('is idempotent: adding the same track twice does not duplicate it', () => {
    const { api } = setup()
    let id = ''
    act(() => {
      id = api().createPlaylist('Morning Drive')!
    })
    act(() => api().addTrackToPlaylist(id, trackA.id))
    act(() => api().addTrackToPlaylist(id, trackA.id))
    expect(api().getPlaylistById(id)?.trackIds).toEqual([trackA.id])
  })

  it('removes only the specified track from a playlist', () => {
    const { api } = setup()
    let id = ''
    act(() => {
      id = api().createPlaylist('Morning Drive')!
    })
    act(() => {
      api().addTrackToPlaylist(id, trackA.id)
      api().addTrackToPlaylist(id, trackB.id)
    })
    act(() => api().removeTrackFromPlaylist(id, trackA.id))
    expect(api().getPlaylistById(id)?.trackIds).toEqual([trackB.id])
  })

  it('supports an empty playlist', () => {
    const { api } = setup()
    let id = ''
    act(() => {
      id = api().createPlaylist('Empty For Now')!
    })
    expect(api().getPlaylistTracks(id)).toEqual([])
  })

  it('allows multiple playlists to contain the same track', () => {
    const { api } = setup()
    let idOne = ''
    let idTwo = ''
    act(() => {
      idOne = api().createPlaylist('Morning Drive')!
      idTwo = api().createPlaylist('Night Drive')!
    })
    act(() => {
      api().addTrackToPlaylist(idOne, trackA.id)
      api().addTrackToPlaylist(idTwo, trackA.id)
    })
    expect(api().getPlaylistById(idOne)?.trackIds).toContain(trackA.id)
    expect(api().getPlaylistById(idTwo)?.trackIds).toContain(trackA.id)
  })

  it('survives a simulated page reload (new provider instance, same localStorage)', () => {
    const first = setup()
    act(() => {
      first.api().createPlaylist('Morning Drive')
    })
    first.unmount()

    const second = setup()
    expect(second.api().playlists).toHaveLength(1)
    expect(second.api().playlists[0].name).toBe('Morning Drive')
  })

  it('does not crash on corrupted localStorage data', () => {
    window.localStorage.setItem(STORAGE_KEY, '{not valid json')
    expect(() => setup()).not.toThrow()
    const { api } = setup()
    expect(api().playlists).toEqual([])
  })

  it('gracefully drops unknown track IDs when resolving a playlist', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          id: 'p1',
          name: 'Stale Playlist',
          trackIds: ['does-not-exist', trackA.id],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ]),
    )
    const { api } = setup()
    expect(api().getPlaylistTracks('p1')).toEqual([trackA])
  })
})
