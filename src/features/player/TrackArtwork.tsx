function hashToHue(id: string): number {
  let hash = 0
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) | 0
  }
  return Math.abs(hash) % 360
}

interface TrackArtworkProps {
  trackId: string | null
  isPlaying: boolean
  size?: 'default' | 'large'
}

/**
 * A synthesized "radio dial" visual, not album art — there is no artwork to
 * license or source. Deliberately reads as a dial/reel, not a Spotify-style
 * square cover. Rotates gently while playing; respects reduced motion.
 */
export function TrackArtwork({ trackId, isPlaying, size = 'default' }: TrackArtworkProps) {
  const hue = trackId ? hashToHue(trackId) : 30
  const dimensionClass = size === 'large' ? 'h-56 w-56' : 'h-40 w-40'

  return (
    <div
      className={`relative ${dimensionClass} shrink-0 rounded-full border-4 border-neutral-800 shadow-[inset_0_0_30px_rgba(0,0,0,0.6)]`}
      style={{
        backgroundImage: `radial-gradient(circle at 35% 30%, hsl(${hue} 65% 24%) 0%, hsl(${hue} 55% 12%) 55%, #0a0a0a 100%)`,
      }}
      role="img"
      aria-label={trackId ? 'Station dial, currently tuned in' : 'Station dial, no station tuned'}
    >
      <div
        className={`absolute inset-0 rounded-full ${
          isPlaying ? 'animate-[spin_9s_linear_infinite] motion-reduce:animate-none' : ''
        }`}
      >
        <div className="absolute inset-5 rounded-full border border-dashed border-white/10" />
        <div className="absolute inset-10 rounded-full border border-white/10" />
        <div className="absolute inset-[3.25rem] rounded-full border border-white/5" />
      </div>
      <div
        className="absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.4)]"
        style={{ backgroundColor: `hsl(${hue} 75% 55%)` }}
      />
    </div>
  )
}
