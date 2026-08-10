/**
 * Loads the official YouTube IFrame Player API script
 * (https://www.youtube.com/iframe_api) exactly once and resolves with the
 * global `YT` namespace once it signals readiness via the API's own
 * `window.onYouTubeIframeAPIReady` contract.
 *
 * EXPERIMENTAL: this loader exists only for the Driver Mode YouTube test
 * provider (see docs/MUSIC-SOURCE.md — "Experimental YouTube Test
 * Provider"). It touches nothing else in the app: no other page calls this
 * module, so removing the experiment is a matter of deleting
 * src/music/youtube/, src/features/driver-mode/, and reverting
 * DriverMode.tsx.
 */

declare global {
  interface Window {
    YT?: typeof YT
    onYouTubeIframeAPIReady?: () => void
  }
}

let apiPromise: Promise<typeof YT> | null = null

export function loadYouTubeIframeApi(): Promise<typeof YT> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('loadYouTubeIframeApi can only run in a browser'))
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT)
  }

  apiPromise ??= new Promise<typeof YT>((resolve, reject) => {
    const previousCallback = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.()
      if (window.YT) {
        resolve(window.YT)
      } else {
        reject(new Error('YouTube IFrame API loaded but window.YT is missing'))
      }
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.youtube.com/iframe_api"]',
    )
    if (existingScript) return

    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    script.onerror = () => reject(new Error('Failed to load the YouTube IFrame API script'))
    document.head.appendChild(script)
  })

  return apiPromise
}
