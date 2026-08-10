import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FavoritesProvider } from '../features/favorites/FavoritesContext'
import { PlayerProvider } from '../features/player/PlayerContext'
import DriverMode from './DriverMode'

const hookState = {
  currentTrack: null as { id: string; title: string; artist: string } | null,
  playbackState: 'idle' as 'idle' | 'playing' | 'paused',
  error: null as string | null,
  progress: null as { currentSeconds: number; durationSeconds: number } | null,
  play: vi.fn(),
  pause: vi.fn(),
  togglePlayPause: vi.fn(),
  next: vi.fn(),
  previous: vi.fn(),
}

vi.mock('../features/driver-mode/useExperimentalYouTubePlayer', () => ({
  useExperimentalYouTubePlayer: () => hookState,
}))

function renderDriverMode() {
  return render(
    <FavoritesProvider>
      <PlayerProvider>
        <MemoryRouter>
          <DriverMode />
        </MemoryRouter>
      </PlayerProvider>
    </FavoritesProvider>,
  )
}

describe('DriverMode (experimental)', () => {
  beforeEach(() => {
    hookState.currentTrack = null
    hookState.playbackState = 'idle'
    hookState.error = null
    hookState.progress = null
    vi.clearAllMocks()
  })

  it('has no normal navigation chrome', () => {
    renderDriverMode()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'My Playlists' })).not.toBeInTheDocument()
  })

  it('shows a loading state before a track is available', () => {
    renderDriverMode()
    expect(screen.getByText(/tuning in/i)).toBeInTheDocument()
  })

  it('shows a graceful error state without crashing', () => {
    hookState.error = "This track's owner has disabled embedding."
    renderDriverMode()
    expect(screen.getByText("This track's owner has disabled embedding.")).toBeInTheDocument()
  })

  it('renders track info and accessible playback controls once available', () => {
    hookState.currentTrack = { id: 'youtube:vid1', title: 'Track One', artist: 'Channel One' }
    hookState.playbackState = 'playing'
    renderDriverMode()

    expect(screen.getByText('Track One')).toBeInTheDocument()
    expect(screen.getByText('Channel One')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous track' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next track' })).toBeInTheDocument()
  })

  it('play/pause, next, and previous call through to the experimental hook', async () => {
    const user = userEvent.setup()
    hookState.currentTrack = { id: 'youtube:vid1', title: 'Track One', artist: 'Channel One' }
    hookState.playbackState = 'paused'
    renderDriverMode()

    await user.click(screen.getByRole('button', { name: 'Play' }))
    expect(hookState.togglePlayPause).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Next track' }))
    expect(hookState.next).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Previous track' }))
    expect(hookState.previous).toHaveBeenCalledTimes(1)
  })

  it('renders the progress display as display-only, not an interactive seek control', () => {
    hookState.currentTrack = { id: 'youtube:vid1', title: 'Track One', artist: 'Channel One' }
    hookState.progress = { currentSeconds: 11, durationSeconds: 304 }
    renderDriverMode()

    expect(screen.getByText('0:11 / 5:04')).toBeInTheDocument()
    expect(screen.queryByRole('slider')).not.toBeInTheDocument()
    expect(document.querySelector('input[type="range"]')).toBeNull()
    expect(document.querySelector('[onclick]')).toBeNull()
  })

  it('shows 0:00 / 0:00 gracefully when progress is not yet available', () => {
    hookState.currentTrack = { id: 'youtube:vid1', title: 'Track One', artist: 'Channel One' }
    hookState.progress = null
    renderDriverMode()

    expect(screen.getByText('0:00 / 0:00')).toBeInTheDocument()
  })

  it('renders the Favorite control and an exit link', () => {
    renderDriverMode()
    expect(screen.getByRole('button', { name: 'Favorite' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Exit Driver Mode' })).toBeInTheDocument()
  })
})
