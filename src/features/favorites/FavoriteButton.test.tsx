import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { FavoritesProvider, useFavorites } from './FavoritesContext'
import { PlayerProvider, usePlayer } from '../player/PlayerContext'
import { FavoriteButton } from './FavoriteButton'
import { demoTracks } from '../../data/demoTracks'

const [trackA] = demoTracks

function setup() {
  let playerApi: ReturnType<typeof usePlayer> | undefined
  let favoritesApi: ReturnType<typeof useFavorites> | undefined

  function Capture() {
    playerApi = usePlayer()
    favoritesApi = useFavorites()
    return null
  }

  render(
    <FavoritesProvider>
      <PlayerProvider>
        <Capture />
        <FavoriteButton />
      </PlayerProvider>
    </FavoritesProvider>,
  )

  act(() => {
    playerApi?.setQueue(demoTracks)
    playerApi?.play()
  })

  return { player: () => playerApi!, favorites: () => favoritesApi! }
}

describe('FavoriteButton', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('shows an accessible "Favorite" label and aria-pressed=false when not favorited', () => {
    setup()
    const button = screen.getByRole('button', { name: 'Favorite' })
    expect(button).toHaveAttribute('aria-pressed', 'false')
  })

  it('switches to "Remove from favorites" with aria-pressed=true after clicking', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: 'Favorite' }))
    const button = screen.getByRole('button', { name: 'Remove from favorites' })
    expect(button).toHaveAttribute('aria-pressed', 'true')
  })

  it('removing the currently playing track from favorites does not stop playback', () => {
    const { player, favorites } = setup()
    const trackId = trackA.id

    act(() => favorites().addFavorite(trackId))
    expect(favorites().isFavorite(trackId)).toBe(true)
    expect(player().playbackState).toBe('playing')

    act(() => favorites().removeFavorite(trackId))

    expect(favorites().isFavorite(trackId)).toBe(false)
    expect(player().playbackState).toBe('playing')
    expect(player().currentTrack?.id).toBe(trackId)
  })
})
