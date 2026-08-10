/**
 * Original Raasta FM illustration — a cinematic rear-following view down a
 * village road at dusk, behind a large music bus, toward chai stalls,
 * houses, shops, trees and electric poles either side of the road
 * (public/img/raasta-driver-mode.svg). Hand-authored from scratch as vector
 * primitives — not traced, embedded, or derived from any reference image or
 * other product's assets. Purely decorative, so it's hidden from assistive
 * tech.
 *
 * The lower band of the composition (road surface, no faces/signage) is
 * deliberately left visually calm so the SimpleRadioPlayer glass pill reads
 * clearly over it.
 *
 * Rendered as a CSS background (cover + bottom-anchored) rather than an
 * inline <img>/<svg> so it crops predictably at any viewport. On every
 * phone width this composition targets, `background-size: cover`'s scale
 * factor is height-driven (the container's height/width ratio exceeds the
 * illustration's), which makes the full illustration height always fit
 * exactly — background-position-y has no visible effect at these
 * viewports, only width gets cropped. The bus's own placement inside the
 * SVG (public/img/raasta-driver-mode.svg, #bus) is sized/positioned to
 * leave clearance above the player pill at both mobile and desktop
 * viewports instead.
 */
export function RoadsideBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 bg-neutral-950 bg-[url('/img/raasta-driver-mode.svg')] bg-cover bg-bottom bg-no-repeat"
    />
  )
}
