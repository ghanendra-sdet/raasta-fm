import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ExperimentalYouTubeProvider } from './ExperimentalYouTubeProvider'

const PLAYER_STATE = { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 }

interface FakePlayerOptions {
  events?: {
    onReady?: (event: { target: FakePlayer }) => void
    onStateChange?: (event: { target: FakePlayer; data: number }) => void
    onError?: (event: { target: FakePlayer; data: number }) => void
  }
}

/** Minimal stand-in for YT.Player, driven manually by each test. */
class FakePlayer {
  state = PLAYER_STATE.UNSTARTED
  playlist = ['vid1', 'vid2', 'vid3']
  playlistIndex = 0
  videoData = { video_id: '', title: '', author: '' }
  destroyed = false
  options: FakePlayerOptions

  constructor(_container: unknown, options: FakePlayerOptions) {
    this.options = options
  }

  triggerReady() {
    this.videoData = { video_id: 'vid1', title: 'Track One', author: 'Channel One' }
    this.options.events?.onReady?.({ target: this })
  }

  playVideo() {
    this.state = PLAYER_STATE.PLAYING
    this.options.events?.onStateChange?.({ target: this, data: this.state })
  }

  pauseVideo() {
    this.state = PLAYER_STATE.PAUSED
    this.options.events?.onStateChange?.({ target: this, data: this.state })
  }

  nextVideo() {
    this.playlistIndex = Math.min(this.playlistIndex + 1, this.playlist.length - 1)
    this.videoData = {
      video_id: this.playlist[this.playlistIndex],
      title: `Track ${this.playlistIndex + 1}`,
      author: 'Channel One',
    }
    this.state = PLAYER_STATE.PLAYING
    this.options.events?.onStateChange?.({ target: this, data: this.state })
  }

  previousVideo() {
    this.playlistIndex = Math.max(this.playlistIndex - 1, 0)
    this.videoData = {
      video_id: this.playlist[this.playlistIndex],
      title: `Track ${this.playlistIndex + 1}`,
      author: 'Channel One',
    }
    this.state = PLAYER_STATE.PLAYING
    this.options.events?.onStateChange?.({ target: this, data: this.state })
  }

  triggerError(code: number) {
    this.options.events?.onError?.({ target: this, data: code })
  }

  cuePlaylistCalls: Array<{ list: string; listType: string; index: number }> = []

  cuePlaylist(args: { list: string; listType: string; index: number }) {
    this.cuePlaylistCalls.push(args)
  }

  getPlayerState() {
    return this.state
  }

  getVideoData() {
    return this.videoData
  }

  getPlaylist() {
    return this.playlist
  }

  getPlaylistIndex() {
    return this.playlistIndex
  }

  destroy() {
    this.destroyed = true
  }
}

let lastPlayer: FakePlayer | null = null

vi.mock('./loadYouTubeIframeApi', () => ({
  loadYouTubeIframeApi: vi.fn(
    () =>
      new Promise((resolve) => {
        resolve({
          PlayerState: PLAYER_STATE,
          Player: class {
            constructor(container: unknown, options: FakePlayerOptions) {
              lastPlayer = new FakePlayer(container, options)
              return lastPlayer
            }
          },
        })
      }),
  ),
}))

async function attachAndReady(provider: ExperimentalYouTubeProvider) {
  provider.attach(document.createElement('div'))
  await new Promise((resolve) => setTimeout(resolve, 0))
  lastPlayer?.triggerReady()
  return lastPlayer!
}

describe('ExperimentalYouTubeProvider', () => {
  beforeEach(() => {
    lastPlayer = null
  })

  it('is idle with no current track before the player is ready', () => {
    const provider = new ExperimentalYouTubeProvider('PLtest')
    expect(provider.getPlaybackState()).toBe('idle')
    expect(provider.getCurrentTrack()).toBeNull()
    expect(provider.getQueue()).toEqual({ tracks: [], currentIndex: -1 })
  })

  it('play() delegates to the underlying player.playVideo() once ready', async () => {
    const provider = new ExperimentalYouTubeProvider('PLtest')
    const fake = await attachAndReady(provider)

    await provider.play()

    expect(fake.state).toBe(PLAYER_STATE.PLAYING)
    expect(provider.getPlaybackState()).toBe('playing')
  })

  it('pause() delegates to pauseVideo()', async () => {
    const provider = new ExperimentalYouTubeProvider('PLtest')
    await attachAndReady(provider)

    await provider.play()
    provider.pause()

    expect(provider.getPlaybackState()).toBe('paused')
  })

  it('defers play() called before the player is ready, running it once ready', async () => {
    const provider = new ExperimentalYouTubeProvider('PLtest')
    provider.attach(document.createElement('div'))
    await provider.play() // called before onReady fires

    await new Promise((resolve) => setTimeout(resolve, 0))
    lastPlayer?.triggerReady()

    expect(lastPlayer?.state).toBe(PLAYER_STATE.PLAYING)
  })

  it('exposes the current track from getVideoData() once ready', async () => {
    const provider = new ExperimentalYouTubeProvider('PLtest')
    await attachAndReady(provider)

    expect(provider.getCurrentTrack()).toEqual({
      id: 'youtube:vid1',
      title: 'Track One',
      artist: 'Channel One',
    })
  })

  it('next()/previous() advance through the real YouTube playlist', async () => {
    const provider = new ExperimentalYouTubeProvider('PLtest')
    await attachAndReady(provider)

    await provider.next()
    expect(provider.getCurrentTrack()?.id).toBe('youtube:vid2')

    await provider.previous()
    expect(provider.getCurrentTrack()?.id).toBe('youtube:vid1')
  })

  it('getQueue() reflects the real playlist length and current index', async () => {
    const provider = new ExperimentalYouTubeProvider('PLtest')
    await attachAndReady(provider)
    await provider.next()

    const queue = provider.getQueue()
    expect(queue.tracks).toHaveLength(3)
    expect(queue.currentIndex).toBe(1)
    expect(queue.tracks[1]).toEqual({ id: 'youtube:vid2', title: 'Track 2', artist: 'Channel One' })
  })

  it('setQueue() is a documented no-op', async () => {
    const provider = new ExperimentalYouTubeProvider('PLtest')
    await attachAndReady(provider)
    expect(() => provider.setQueue([{ id: 'x', title: 'x', artist: 'x' }], 0)).not.toThrow()
    expect(provider.getCurrentTrack()?.id).toBe('youtube:vid1')
  })

  it('records a non-skippable playback error via onError without crashing', async () => {
    const provider = new ExperimentalYouTubeProvider('PLtest')
    const fake = await attachAndReady(provider)

    expect(provider.getLastError()).toBeNull()
    fake.triggerError(5) // Html5Error — not auto-skippable
    expect(provider.getLastError()).toBe("This track can't play in this browser.")
  })

  it('auto-skips a skippable error (embedding disabled) via cuePlaylist rather than surfacing it', async () => {
    const provider = new ExperimentalYouTubeProvider('PLtest')
    const fake = await attachAndReady(provider)

    fake.triggerError(101) // EmbeddingNotAllowed
    expect(provider.getLastError()).toBeNull() // not surfaced immediately — retrying

    await new Promise((resolve) => setTimeout(resolve, 350))
    expect(fake.cuePlaylistCalls).toEqual([{ list: 'PLtest', listType: 'playlist', index: 1 }])
  })

  it('notifies subscribers on state changes and stops after unsubscribing', async () => {
    const provider = new ExperimentalYouTubeProvider('PLtest')
    const listener = vi.fn()
    const unsubscribe = provider.subscribe(listener)

    const fake = await attachAndReady(provider)
    const callsAfterReady = listener.mock.calls.length
    expect(callsAfterReady).toBeGreaterThan(0)

    await provider.play()
    expect(listener.mock.calls.length).toBeGreaterThan(callsAfterReady)

    unsubscribe()
    const callsAfterUnsubscribe = listener.mock.calls.length
    fake.pauseVideo()
    expect(listener.mock.calls.length).toBe(callsAfterUnsubscribe)
  })

  it('destroy() tears down the underlying player', async () => {
    const provider = new ExperimentalYouTubeProvider('PLtest')
    const fake = await attachAndReady(provider)

    provider.destroy()

    expect(fake.destroyed).toBe(true)
    expect(provider.getPlaybackState()).toBe('idle')
  })
})
