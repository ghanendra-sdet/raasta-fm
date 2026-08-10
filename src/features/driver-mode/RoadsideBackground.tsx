/**
 * Original Raasta FM illustration — evening Indian roadside scene
 * (public/img/raasta-driver-mode.svg): a barber and customer outside a
 * small shop, a tea stall with a subtle "RAASTA FM" signboard, a parked
 * auto-rickshaw and bus, roadside trees and electric poles, under a warm
 * dusk sky with a grain/paper texture. Hand-authored from scratch — not
 * traced or derived from any reference image. Purely decorative, so it's
 * hidden from assistive tech.
 *
 * Rendered as a CSS background (cover + bottom-anchored) rather than an
 * inline <img>/<svg> so it crops predictably on narrow viewports: the
 * lower band (shops, road, the player-safe area) stays visible instead of
 * being pushed off-screen the way a top-anchored crop would.
 */
export function RoadsideBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 bg-neutral-950 bg-[url('/img/raasta-driver-mode.svg')] bg-cover bg-bottom bg-no-repeat"
    />
  )
}
