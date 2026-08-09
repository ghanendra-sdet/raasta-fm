import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { FavoritesProvider, useFavorites } from '../features/favorites/FavoritesContext'
import { PlayerProvider, usePlayer } from '../features/player/PlayerContext'
import { demoTracks } from '../data/demoTracks'
import Favorites from './Favorites'

const [trackA, trackB] = demoTracks

function setup(seedIds: string[] = []) {
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
        <MemoryRouter>
          <Capture />
          <Favorites />
        </MemoryRouter>
      </PlayerProvider>
    </FavoritesProvider>,
  )

  if (seedIds.length) {
    act(() => {
      seedIds.forEach((id) => favoritesApi?.addFavorite(id))
    })
  }

  return { player: () => playerApi!, favorites: () => favoritesApi! }
}

describe('Favorites page', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders an intentional empty state and no fake tracks when there are no favorites', () => {
    setup()
    expect(screen.getByText(/no favorites yet/i)).toBeInTheDocument()
    expect(screen.getByText(/tap the heart/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^play /i })).not.toBeInTheDocument()
  })

  it('renders the correct favorited tracks and count', () => {
    setup([trackA.id, trackB.id])
    expect(screen.getByText('2 songs')).toBeInTheDocument()
    expect(screen.getByText(trackA.title)).toBeInTheDocument()
    expect(screen.getByText(trackB.title)).toBeInTheDocument()
  })

  it('selecting a favorite starts playback with the favorites list as the queue', async () => {
    const user = userEvent.setup()
    const { player } = setup([trackA.id, trackB.id])

    await user.click(screen.getByRole('button', { name: `Play ${trackB.title}` }))

    expect(player().currentTrack?.id).toBe(trackB.id)
    expect(player().playbackState).toBe('playing')
    expect(player().queue.tracks.map((t) => t.id)).toEqual([trackA.id, trackB.id])
  })
})
