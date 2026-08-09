import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecentlyPlayed } from './RecentlyPlayedContext'
import { usePlayer } from '../player/PlayerContext'

/**
 * Reusable, lightweight — a small section, not a dedicated page or nav
 * item. See docs/PRODUCT.md: history is a convenience, not analytics.
 */
export function RecentlyPlayedSection() {
  const { recentTracks, clearHistory } = useRecentlyPlayed()
  const { setQueue, play } = usePlayer()
  const navigate = useNavigate()
  const [isConfirmingClear, setIsConfirmingClear] = useState(false)

  function handlePlay(index: number) {
    setQueue(recentTracks, index)
    play()
    navigate('/now-playing')
  }

  function handleConfirmClear() {
    clearHistory()
    setIsConfirmingClear(false)
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-medium tracking-wide text-neutral-300 uppercase">
          <span aria-hidden="true">🕓</span>
          Recently Played
        </h2>

        {recentTracks.length > 0 &&
          (isConfirmingClear ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500">Clear all history?</span>
              <button
                type="button"
                aria-label="Confirm clear recently played history"
                onClick={handleConfirmClear}
                className="rounded-md border border-rose-500/60 px-2 py-1 text-rose-400 transition-colors hover:border-rose-400"
              >
                Confirm
              </button>
              <button
                type="button"
                aria-label="Cancel clear recently played history"
                onClick={() => setIsConfirmingClear(false)}
                className="rounded-md border border-neutral-700 px-2 py-1 text-neutral-300 transition-colors hover:border-neutral-500"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              aria-label="Clear recently played"
              onClick={() => setIsConfirmingClear(true)}
              className="text-xs text-neutral-500 underline-offset-4 transition-colors hover:text-amber-400 hover:underline"
            >
              Clear recently played
            </button>
          ))}
      </div>

      {recentTracks.length === 0 ? (
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 px-4 py-6 text-center">
          <p className="text-sm text-neutral-300">No songs played yet.</p>
          <p className="mt-1 text-xs text-neutral-500">
            Start listening and your recent tracks will appear here.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-neutral-800 border-y border-neutral-800">
          {recentTracks.map((track, index) => (
            <li key={track.id} className="flex items-center justify-between py-3">
              <div className="min-w-0">
                <p className="truncate text-sm text-neutral-100">{track.title}</p>
                <p className="truncate text-xs text-neutral-500">{track.artist}</p>
              </div>
              <button
                type="button"
                aria-label={`Play ${track.title}`}
                onClick={() => handlePlay(index)}
                className="ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-700 text-neutral-200 transition-colors hover:border-amber-500 hover:text-amber-400"
              >
                <span aria-hidden="true">▶</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
