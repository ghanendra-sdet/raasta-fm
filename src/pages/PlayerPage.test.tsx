import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import type { Track } from '../music/types'
import { PlayerProvider, usePlayer } from '../features/player/PlayerContext'
import PlayerPage from './PlayerPage'

const tracks: Track[] = [
  { id: 't1', title: 'Track One', artist: 'Raasta FM Demo Audio' },
  { id: 't2', title: 'Track Two', artist: 'Raasta FM Demo Audio' },
]

function renderPlayer(seedTracks: Track[] | null = tracks) {
  let playerApi: ReturnType<typeof usePlayer> | undefined

  function Capture() {
    playerApi = usePlayer()
    return null
  }

  const utils = render(
    <PlayerProvider>
      <MemoryRouter>
        <Capture />
        <PlayerPage />
      </MemoryRouter>
    </PlayerProvider>,
  )

  if (seedTracks) {
    act(() => {
      playerApi?.setQueue(seedTracks)
    })
  }

  return { ...utils, player: () => playerApi }
}

describe('PlayerPage', () => {
  it('renders the current track title and artist', () => {
    renderPlayer()
    expect(screen.getByText('Track One')).toBeInTheDocument()
    expect(screen.getByText('Raasta FM Demo Audio')).toBeInTheDocument()
  })

  it('shows a graceful empty state when the queue is empty', () => {
    renderPlayer(null)
    expect(screen.getByText(/nothing queued yet/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /browse stations/i })).toBeInTheDocument()
  })

  it('exposes accessible labels for previous, play/pause, and next', () => {
    renderPlayer()
    expect(screen.getByRole('button', { name: 'Previous track' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next track' })).toBeInTheDocument()
  })

  it('renders no seek/progress controls', () => {
    renderPlayer()
    expect(screen.queryByRole('slider')).not.toBeInTheDocument()
    expect(document.querySelector('input[type="range"]')).toBeNull()
    expect(screen.queryByText(/\d:\d{2}/)).not.toBeInTheDocument()
  })

  it('clicking Play switches the button to Pause and reflects playing state', async () => {
    const user = userEvent.setup()
    renderPlayer()
    await user.click(screen.getByRole('button', { name: 'Play' }))
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
    expect(screen.getByText('playing')).toBeInTheDocument()
  })

  it('clicking Pause switches back to Play and reflects paused state', async () => {
    const user = userEvent.setup()
    renderPlayer()
    await user.click(screen.getByRole('button', { name: 'Play' }))
    await user.click(screen.getByRole('button', { name: 'Pause' }))
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument()
    expect(screen.getByText('paused')).toBeInTheDocument()
  })

  it('clicking Next changes the current track', async () => {
    const user = userEvent.setup()
    renderPlayer()
    await user.click(screen.getByRole('button', { name: 'Next track' }))
    expect(screen.getByText('Track Two')).toBeInTheDocument()
  })

  it('clicking Previous changes the current track (wraps to the last track)', async () => {
    const user = userEvent.setup()
    renderPlayer()
    await user.click(screen.getByRole('button', { name: 'Previous track' }))
    expect(screen.getByText('Track Two')).toBeInTheDocument()
  })

  it('reflects provider state driven from outside the component tree', () => {
    const { player } = renderPlayer(null)

    act(() => {
      player()?.setQueue(tracks)
      player()?.play()
    })

    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
  })
})
