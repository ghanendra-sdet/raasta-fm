import { act, render } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { FavoritesProvider, useFavorites } from './FavoritesContext'
import { demoTracks } from '../../data/demoTracks'

const [trackA, trackB, trackC] = demoTracks

function setup() {
  let api: ReturnType<typeof useFavorites> | undefined

  function Capture() {
    api = useFavorites()
    return null
  }

  const utils = render(
    <FavoritesProvider>
      <Capture />
    </FavoritesProvider>,
  )

  return { ...utils, api: () => api! }
}

describe('FavoritesContext', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('starts with no favorites', () => {
    const { api } = setup()
    expect(api().favoriteIds).toEqual([])
    expect(api().favoriteTracks).toEqual([])
  })

  it('favorites a track', () => {
    const { api } = setup()
    act(() => api().toggleFavorite(trackA.id))
    expect(api().isFavorite(trackA.id)).toBe(true)
    expect(api().favoriteIds).toContain(trackA.id)
  })

  it('unfavorites a track', () => {
    const { api } = setup()
    act(() => api().toggleFavorite(trackA.id))
    act(() => api().toggleFavorite(trackA.id))
    expect(api().isFavorite(trackA.id)).toBe(false)
    expect(api().favoriteIds).not.toContain(trackA.id)
  })

  it('survives a React re-render', () => {
    const { api, rerender } = setup()
    act(() => api().toggleFavorite(trackA.id))
    rerender(
      <FavoritesProvider>
        <></>
      </FavoritesProvider>,
    )
    expect(api().isFavorite(trackA.id)).toBe(true)
  })

  it('survives a simulated page reload (new provider instance, same localStorage)', () => {
    const first = setup()
    act(() => first.api().toggleFavorite(trackA.id))
    first.unmount()

    const second = setup()
    expect(second.api().isFavorite(trackA.id)).toBe(true)
  })

  it('supports favoriting multiple tracks', () => {
    const { api } = setup()
    act(() => {
      api().toggleFavorite(trackA.id)
      api().toggleFavorite(trackB.id)
      api().toggleFavorite(trackC.id)
    })
    expect(api().favoriteIds).toHaveLength(3)
    expect(
      api()
        .favoriteTracks.map((t) => t.id)
        .sort(),
    ).toEqual([trackA.id, trackB.id, trackC.id].sort())
  })

  it('is idempotent: adding the same favorite twice does not duplicate it', () => {
    const { api } = setup()
    act(() => api().addFavorite(trackA.id))
    act(() => api().addFavorite(trackA.id))
    expect(api().favoriteIds).toEqual([trackA.id])
  })

  it('does not crash on corrupted localStorage data', () => {
    window.localStorage.setItem('raasta-fm.favorites', '{not valid json')
    expect(() => setup()).not.toThrow()
    const { api } = setup()
    expect(api().favoriteIds).toEqual([])
  })

  it('gracefully drops a stale/unknown track ID instead of crashing', () => {
    window.localStorage.setItem('raasta-fm.favorites', JSON.stringify(['does-not-exist']))
    const { api } = setup()
    expect(api().favoriteIds).toEqual(['does-not-exist'])
    expect(api().favoriteTracks).toEqual([])
  })
})
