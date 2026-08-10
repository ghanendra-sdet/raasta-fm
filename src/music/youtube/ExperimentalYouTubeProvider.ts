import type { MusicProvider, PlaybackState, PlayerListener, Queue, Track } from '../types'
import { loadYouTubeIframeApi } from './loadYouTubeIframeApi'

const MAX_AUTO_SKIP_ATTEMPTS = 15
const GIVE_UP_TIMEOUT_MS = 9000

/**
 * Commercial Hindi music uploads frequently have embedding disabled by
 * their rights holder even when the video plays fine directly on
 * youtube.com — a real, observed characteristic of the test playlist, not
 * a bug. Codes 100/101/150 are auto-skipped via the player's own
 * nextVideo() (an official API method, not a workaround) rather than
 * leaving the reviewer stuck on an unplayable track.
 */
function isSkippableError(code: number): boolean {
  return code === 100 || code === 101 || code === 150
}

function describeYouTubeError(code: number): string {
  switch (code) {
    case 2:
      return 'Invalid video request.'
    case 5:
      return "This track can't play in this browser."
    case 100:
      return 'This track is no longer available.'
    case 101:
    case 150:
      return "This track's owner has disabled embedding."
    default:
      return 'YouTube playback error.'
  }
}

/**
 * EXPERIMENTAL — not part of the permanent Raasta FM architecture.
 *
 * Backs the MusicProvider interface with the official YouTube IFrame
 * Player API, playing a single fixed public YouTube playlist (used only to
 * test the Driver Mode concept with real Hindi music). See
 * docs/MUSIC-SOURCE.md — "Experimental YouTube Test Provider" — for the
 * full policy rationale: no audio is downloaded, extracted, or proxied;
 * the official embedded player is used exactly as YouTube's developer
 * policies intend; attribution and required controls are never hidden or
 * overlaid.
 *
 * Isolation: nothing outside src/features/driver-mode references this
 * class. It is not wired into the app-wide PlayerContext, so
 * MockMusicProvider and every other page remain completely unaffected —
 * removing the experiment means deleting this directory,
 * src/features/driver-mode/, and reverting DriverMode.tsx.
 *
 * Known limitations (see docs/MUSIC-SOURCE.md):
 * - No seek(): matches the permanent product rule. The visible YouTube
 *   player may show its own native progress UI (required by YouTube's
 *   embedding policy) — that is provider-native behavior, not a Raasta FM
 *   seek control, and does not change the MusicProvider contract.
 * - getProgress() is a narrow, read-only exception to "provider untouched":
 *   it exposes the player's own getCurrentTime()/getDuration() for a
 *   display-only progress indicator in Driver Mode. No seek()/
 *   setCurrentTime() exists anywhere in this class or MusicProvider —
 *   reading playback position is not the same capability as controlling
 *   it, and the no-seek product contract is unchanged.
 * - setQueue() is a no-op: the "queue" here is the YouTube playlist
 *   itself, controlled by YouTube, not by application code.
 * - getQueue() enumerates real playlist video IDs via the API, but only
 *   the currently-playing entry has real title/artist metadata (from
 *   getVideoData()) — resolving metadata for every other entry would
 *   require the separate YouTube Data API v3 with an API key, which this
 *   experiment does not use.
 * - next()/previous() delegate to the player's own nextVideo()/
 *   previousVideo() and do not force wrap-around the way
 *   MockMusicProvider does — that is standard YouTube playlist behavior,
 *   not a bug.
 */
export class ExperimentalYouTubeProvider implements MusicProvider {
  private readonly playlistId: string
  private player: YT.Player | null = null
  private ytApi: typeof YT | null = null
  private isReady = false
  private listeners = new Set<PlayerListener>()
  private pendingAction: (() => void) | null = null
  private lastError: string | null = null
  // Bumped by destroy() to invalidate any in-flight attach() — React
  // StrictMode's dev-mode mount→cleanup→mount double-invoke otherwise races
  // two overlapping attach() calls against one destroy(), leaving `player`
  // pointing at a torn-down instance (playVideo() etc. silently break).
  private attachToken = 0
  private autoSkipAttempts = 0
  private wantsToPlay = false
  // Bounds the whole auto-skip sequence with a single wall-clock budget so
  // the UI never spins on "Tuning in…" forever if the API stops responding
  // to commands after an error (observed with some playlists — see
  // docs/MUSIC-SOURCE.md known limitations).
  private giveUpTimeoutId: ReturnType<typeof window.setTimeout> | null = null

  constructor(playlistId: string) {
    this.playlistId = playlistId
  }

  /** Creates the underlying YT.Player attached to the given DOM element. */
  attach(container: HTMLElement): void {
    if (this.player) return
    const token = ++this.attachToken

    loadYouTubeIframeApi()
      .then((YTApi) => {
        if (token !== this.attachToken) return // superseded by a later attach()/destroy()
        this.ytApi = YTApi
        this.player = new YTApi.Player(container, {
          playerVars: {
            listType: 'playlist',
            list: this.playlistId,
            autoplay: 0,
            playsinline: 1,
            controls: 1,
            rel: 0,
          },
          events: {
            onReady: () => {
              this.isReady = true
              this.pendingAction?.()
              this.pendingAction = null
              this.notify()
            },
            onStateChange: (event) => {
              if (event.data === this.ytApi?.PlayerState.PLAYING) {
                this.autoSkipAttempts = 0
                this.lastError = null
                if (this.giveUpTimeoutId !== null) {
                  window.clearTimeout(this.giveUpTimeoutId)
                  this.giveUpTimeoutId = null
                }
              }
              this.notify()
            },
            onError: (event) => {
              if (isSkippableError(event.data) && this.autoSkipAttempts < MAX_AUTO_SKIP_ATTEMPTS) {
                this.giveUpTimeoutId ??= window.setTimeout(() => {
                  this.giveUpTimeoutId = null
                  this.autoSkipAttempts = MAX_AUTO_SKIP_ATTEMPTS
                  this.lastError = "Couldn't find a playable track in this playlist right now."
                  this.notify()
                }, GIVE_UP_TIMEOUT_MS)

                // getPlaylist()/nextVideo() require an already-established
                // playlist context, which never forms if the very first
                // entry fails to load — cuePlaylist() with an explicit
                // index works even from that broken state, and (unlike
                // loadPlaylist()) doesn't force playback the user never
                // asked for. A short delay avoids a known YT IFrame API
                // quirk where calling player methods synchronously inside
                // onError is unreliable.
                const index = this.autoSkipAttempts + 1
                this.autoSkipAttempts += 1
                window.setTimeout(() => {
                  this.player?.cuePlaylist({ list: this.playlistId, listType: 'playlist', index })
                  if (this.wantsToPlay) {
                    window.setTimeout(() => this.player?.playVideo(), 300)
                  }
                }, 300)
                return
              }
              this.lastError = describeYouTubeError(event.data)
              this.notify()
            },
          },
        })
      })
      .catch((error: unknown) => {
        if (token !== this.attachToken) return
        this.lastError = error instanceof Error ? error.message : 'Failed to load YouTube player'
        this.notify()
      })
  }

  destroy(): void {
    this.attachToken += 1 // invalidate any in-flight attach()
    if (this.giveUpTimeoutId !== null) {
      window.clearTimeout(this.giveUpTimeoutId)
      this.giveUpTimeoutId = null
    }
    this.player?.destroy()
    this.player = null
    this.ytApi = null
    this.isReady = false
    this.autoSkipAttempts = 0
    this.wantsToPlay = false
    this.listeners.clear()
  }

  getLastError(): string | null {
    return this.lastError
  }

  /**
   * Read-only. Returns null until the player is ready or if the duration
   * isn't known yet (e.g. still buffering). Never used to control playback
   * — see class-level doc comment on the no-seek rationale.
   */
  getProgress(): { currentSeconds: number; durationSeconds: number } | null {
    if (!this.isReady || !this.player) return null
    try {
      const currentSeconds = this.player.getCurrentTime()
      const durationSeconds = this.player.getDuration()
      if (!Number.isFinite(currentSeconds) || !Number.isFinite(durationSeconds)) return null
      return { currentSeconds, durationSeconds }
    } catch {
      return null
    }
  }

  subscribe(listener: PlayerListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  /** No-op: the queue is the external YouTube playlist, not app-controlled. */
  setQueue(): void {}

  async play(): Promise<void> {
    this.wantsToPlay = true
    this.runOrDefer(() => this.player?.playVideo())
  }

  pause(): void {
    this.wantsToPlay = false
    this.runOrDefer(() => this.player?.pauseVideo())
  }

  async next(): Promise<void> {
    this.runOrDefer(() => this.player?.nextVideo())
  }

  async previous(): Promise<void> {
    this.runOrDefer(() => this.player?.previousVideo())
  }

  /**
   * Jumps to a specific playlist index and plays it — the official
   * `playVideoAt()` method, used by Driver Mode's session shuffle (see
   * useExperimentalYouTubePlayer.ts) to navigate a shuffled order instead
   * of the playlist's own next/previous sequence. Does not change what
   * "the playlist" is — same official playlist, same IFrame API, just a
   * different index selected by our own code.
   */
  async playAt(index: number): Promise<void> {
    this.runOrDefer(() => this.player?.playVideoAt(index))
  }

  /**
   * Cues (loads, does not play) a specific playlist index — reuses the
   * exact `cuePlaylist()` call already used above for error auto-skip,
   * just exposed for the shuffle's random session-start position. Never
   * autoplays: matches the existing autoplay:0 policy for this provider.
   */
  cueAt(index: number): void {
    this.runOrDefer(() =>
      this.player?.cuePlaylist({ list: this.playlistId, listType: 'playlist', index }),
    )
  }

  getCurrentTrack(): Track | null {
    if (!this.isReady || !this.player) return null
    try {
      const data = this.player.getVideoData()
      if (!data?.video_id) return null
      return {
        id: `youtube:${data.video_id}`,
        title: data.title || 'YouTube track',
        artist: data.author || 'YouTube',
      }
    } catch {
      return null
    }
  }

  getQueue(): Queue {
    if (!this.isReady || !this.player) return { tracks: [], currentIndex: -1 }
    try {
      const ids = this.player.getPlaylist() ?? []
      const currentIndex = this.player.getPlaylistIndex() ?? -1
      const current = this.getCurrentTrack()
      const tracks: Track[] = ids.map((id, index) =>
        index === currentIndex && current
          ? current
          : { id: `youtube:${id}`, title: 'YouTube track', artist: 'YouTube' },
      )
      return { tracks, currentIndex }
    } catch {
      return { tracks: [], currentIndex: -1 }
    }
  }

  getPlaybackState(): PlaybackState {
    if (!this.isReady || !this.player || !this.ytApi) return 'idle'
    try {
      const state = this.player.getPlayerState()
      if (state === this.ytApi.PlayerState.PLAYING || state === this.ytApi.PlayerState.BUFFERING) {
        return 'playing'
      }
      if (state === this.ytApi.PlayerState.PAUSED) return 'paused'
      return 'idle'
    } catch {
      return 'idle'
    }
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener())
  }

  private runOrDefer(action: () => void): void {
    if (this.isReady) {
      action()
    } else {
      this.pendingAction = action
    }
  }
}
