/**
 * Original, hand-authored SVG — evening Indian roadside silhouette
 * (skyline, road, string lights, a parked auto-rickshaw shape). Not traced
 * or derived from any reference image; built purely from geometric shapes
 * to establish Raasta FM's own visual identity for Driver Mode. Purely
 * decorative, so it's hidden from assistive tech.
 */
export function RoadsideBackground() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 800 1000"
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        <linearGradient id="raasta-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1030" />
          <stop offset="45%" stopColor="#3a1d3f" />
          <stop offset="75%" stopColor="#8a3d2f" />
          <stop offset="100%" stopColor="#c9772f" />
        </linearGradient>
        <radialGradient id="raasta-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd28a" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffd28a" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="800" height="1000" fill="url(#raasta-sky)" />
      <circle cx="620" cy="430" r="160" fill="url(#raasta-sun)" />
      <circle cx="620" cy="430" r="70" fill="#ffcf82" opacity="0.85" />

      {/* String lights */}
      <g stroke="#e0b34a" strokeWidth="2" opacity="0.5">
        <path d="M0 90 Q 400 180 800 90" fill="none" />
      </g>
      <g fill="#ffd98a">
        {Array.from({ length: 14 }, (_, i) => {
          const t = i / 13
          const x = t * 800
          const y = 90 + Math.sin(t * Math.PI) * 90
          return <circle key={i} cx={x} cy={y} r={4} opacity={0.7} />
        })}
      </g>

      {/* Distant skyline */}
      <g fill="#100a1c">
        <polygon points="0,560 40,560 40,500 90,500 90,540 150,540 150,470 210,470 210,560 270,560 270,510 330,510 330,560 800,560 800,600 0,600" />
      </g>

      {/* Road */}
      <polygon points="260,600 540,600 700,1000 100,1000" fill="#0b0710" />
      <polygon points="260,600 540,600 700,1000 100,1000" fill="#1c1424" opacity="0.4" />
      <g fill="#e0b34a" opacity="0.55">
        <polygon points="392,650 408,650 402,700 388,700" />
        <polygon points="378,760 404,760 392,830 358,830" />
        <polygon points="352,900 388,900 368,990 316,990" />
      </g>

      {/* Roadside auto-rickshaw silhouette */}
      <g transform="translate(72,470)" fill="#0b0710">
        <circle cx="20" cy="118" r="16" />
        <circle cx="100" cy="118" r="16" />
        <path d="M4 118 Q4 60 44 46 L96 46 Q120 46 120 78 L120 110 L4 110 Z" />
        <rect x="34" y="18" width="60" height="34" rx="6" />
      </g>

      <rect x="0" y="960" width="800" height="40" fill="#050308" />
    </svg>
  )
}
