import { Link } from 'react-router-dom'

/**
 * Deliberately rendered outside the main app layout/nav — Driver Mode is
 * playback-only by design, never a browsing surface. See docs/UX.md.
 */
export default function DriverMode() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-neutral-950 px-6 text-center text-neutral-100">
      <p className="text-sm tracking-[0.2em] text-neutral-500 uppercase">Raasta FM</p>
      <h1 className="text-xl font-medium text-neutral-300">Driver Mode</h1>
      <p className="max-w-xs text-neutral-500">
        Playback-only controls land here in Step 13, once the player exists. No browsing in this
        view — pick a station before you drive.
      </p>
      <Link to="/" className="mt-4 text-sm text-amber-400 underline underline-offset-4">
        Exit Driver Mode
      </Link>
    </main>
  )
}
