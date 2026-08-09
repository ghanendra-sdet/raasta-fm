# Music Source & Copyright Constraints

**This document is mandatory reading before touching anything audio-related
in this repository.**

## The core fact

We do not own the commercial Hindi music this product is themed around.
Nothing in this repository changes that.

## Hard constraints — do not do these, ever

- Do not download songs from YouTube.
- Do not extract audio from YouTube (or any other video platform).
- Do not scrape MP3 files from any source.
- Do not mirror or cache copyrighted music, in this repo or on any server
  we control.
- Do not store copyrighted songs in the repository, in build artifacts, or
  in any database.
- Do not build an audio-extraction pipeline of any kind.
- Do not circumvent YouTube (or any provider's) restrictions or DRM.
- Do not remove, hide, or obscure YouTube branding from embedded content.
- Do not build a hidden or background-only YouTube audio player that
  strips the required visible player.
- Do not treat a personal YouTube Music Premium (or any personal
  streaming) subscription as a redistribution license. Personal
  entitlements do not transfer to an application's users.

## What the prototype uses instead

For UX/product validation (current phase), audio is either:

- Legally usable test/demo audio (royalty-free or public-domain sources),
  or
- A mock audio layer (no real playback, simulated state) where audio
  content isn't the thing being tested.

The goal right now is validating **UX, navigation, player interaction,
favorites, playlist behavior, nostalgic design, and the driver-focused
experience** — none of which require a real commercial catalog.

## If/when a real music source is considered later

- Any future commercial catalog requires appropriate licensing or
  authorization. This has **not** been decided and is out of scope for the
  prototype.
- The final music source is explicitly undecided. Do not assume it will be
  YouTube, YouTube Music, Spotify, or a licensed Bollywood catalog — see
  [ARCHITECTURE.md](ARCHITECTURE.md) for why the `MusicProvider`
  abstraction exists specifically to avoid that premature commitment.
- If YouTube content is ever used for testing, only the officially
  supported embedding/API mechanisms may be used, and the required
  YouTube player and its functionality (visible player, branding,
  controls) must be preserved — never extract or separate the audio.
  Current developer policy explicitly prohibits downloading, caching, or
  storing YouTube audiovisual content, and prohibits separating its audio
  and video components. Treat that as a hard constraint, not a guideline.
  - https://developers.google.com/youtube/terms/developer-policies
  - https://developers.google.com/youtube/iframe_api_reference
  - https://developers.google.com/youtube/player_parameters
- Any external provider integration must follow that provider's _current_
  terms at the time of integration, not the terms as understood today.

## No ads

Raasta FM's own experience is ad-free by design (see [PRODUCT.md](PRODUCT.md)).
This does not extend to interfering with an external provider's own ads —
we will never remove, block, obscure, or otherwise interfere with
advertisements belonging to an external music provider or player. If a
provider's terms require ads to remain intact, they remain intact.
