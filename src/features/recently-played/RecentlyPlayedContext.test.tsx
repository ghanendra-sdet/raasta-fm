import { act, render } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { RecentlyPlayedProvider, useRecentlyPlayed } from './RecentlyPlayedContext'
import { PlayerProvider, usePlayer } from '../player/PlayerContext'
import { FavoritesProvider, useFavorites } from '../favorites/FavoritesContext'
import { demoTracks } from '../../data/demoTracks'

const [trackA, trackB, trackC] = demoTracks
const STORAGE_KEY = 'raasta-fm.recently-played'

function setup() {
  let recentApi: ReturnType<typeof useRecentlyPlayed> | undefined
  let playerApi: ReturnType<typeof usePlayer> | undefined
  let favoritesApi: ReturnType<typeof useFavorites> | undefined

  function Capture() {
    recentApi = useRecentlyPlayed()
    playerApi = usePlayer()
    favoritesApi = useFavorites()
    return null
  }

  const utils = render(
    <FavoritesProvider>
      <PlayerProvider>
        <RecentlyPlayedProvider>
          <Capture />
        </RecentlyPlayedProvider>
      </PlayerProvider>
    </FavoritesProvider>,
  )

  return {
    ...utils,
    recent: () => recentApi!,
    player: () => playerApi!,
    favorites: () => favoritesApi!,
  }
}

describe('RecentlyPlayedContext', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('starts empty', () => {
    const { recent } = setup()
    expect(recent().entries).toEqual([])
  })

  it('records a track once playback actually starts', () => {
    const { recent, player } = setup()
    act(() => {
      player().setQueue([trackA])
      player().play()
    })
    expect(recent().entries.map((e) => e.trackId)).toEqual([trackA.id])
  })

  it('does not record a track that is only queued', () => {
    const { recent, player } = setup()
    act(() => player().setQueue([trackA]))
    expect(recent().entries).toEqual([])
  })

  it('does not record a track that is only favorited', () => {
    const { recent, favorites } = setup()
    act(() => favorites().toggleFavorite(trackA.id))
    expect(recent().entries).toEqual([])
  })

  it('does not duplicate an entry when the same track is played again', () => {
    const { recent, player } = setup()
    act(() => {
      player().setQueue([trackA])
      player().play()
    })
    act(() => {
      player().pause()
      player().play()
    })
    expect(recent().entries.map((e) => e.trackId)).toEqual([trackA.id])
  })

  it('moves a replayed track to the top instead of duplicating it', () => {
    const { recent, player } = setup()
    act(() => {
      player().setQueue([trackA, trackB, trackC])
      player().play() // A
    })
    act(() => player().next()) // B
    act(() => player().next()) // C
    expect(recent().entries.map((e) => e.trackId)).toEqual([trackC.id, trackB.id, trackA.id])

    act(() => player().previous()) // back to B
    act(() => player().previous()) // back to A
    expect(recent().entries.map((e) => e.trackId)).toEqual([trackA.id, trackB.id, trackC.id])
  })

  it('caps history at 20 entries, dropping the oldest', () => {
    const { recent, player } = setup()
    const tracks = demoTracks.slice(0, 25)
    act(() => {
      player().setQueue(tracks, 0)
      player().play()
    })
    for (let i = 0; i < 24; i += 1) {
      act(() => player().next())
    }
    expect(recent().entries).toHaveLength(20)
    expect(recent().entries[0].trackId).toBe(tracks[24].id)
    expect(recent().entries.map((e) => e.trackId)).not.toContain(tracks[0].id)
  })

  it('survives a simulated page reload (new provider instance, same localStorage)', () => {
    const first = setup()
    act(() => {
      first.player().setQueue([trackA])
      first.player().play()
    })
    first.unmount()

    const second = setup()
    expect(second.recent().entries.map((e) => e.trackId)).toEqual([trackA.id])
  })

  it('does not crash on corrupted localStorage data', () => {
    window.localStorage.setItem(STORAGE_KEY, '{not valid json')
    expect(() => setup()).not.toThrow()
    const { recent } = setup()
    expect(recent().entries).toEqual([])
  })

  it('gracefully drops unknown track IDs when resolving recent tracks', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ trackId: 'does-not-exist', playedAt: '2024-01-01T00:00:00.000Z' }]),
    )
    const { recent } = setup()
    expect(recent().entries).toHaveLength(1)
    expect(recent().recentTracks).toEqual([])
  })
})
