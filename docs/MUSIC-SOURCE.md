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

## Experimental YouTube Test Provider

**Status: experimental, isolated, and expected to be replaced or removed.**
This is not the music-source decision — see "If/when a real music source
is considered later" above, which remains unresolved. This section exists
solely to document a single, narrowly-scoped UX experiment run inside
Driver Mode.

**What it is.** `/driver-mode` optionally plays a single fixed **public
YouTube playlist**, `RDCLAK5uy_lnm4v4arFrmL63NUzIdoXJe-E7G4_sriU` — a
YouTube-generated Hindi "mix" radio playlist (80 tracks)
(https://music.youtube.com/playlist?list=RDCLAK5uy_lnm4v4arFrmL63NUzIdoXJe-E7G4_sriU),
through the official YouTube IFrame Player API
(https://developers.google.com/youtube/iframe_api_reference). The
playlist is loaded by ID via the player's own `listType: 'playlist'` /
`list` parameters (https://developers.google.com/youtube/player_parameters)
— the officially supported way to load a playlist into the embedded
player. No YouTube Data API, no API key, no server-side component.

**Why.** To answer one question with real reviewers: _does Raasta FM feel
significantly better when people can experience the concept with real
Hindi music_, before any commercial licensing decision is made. See
[ROADMAP.md](ROADMAP.md) — "Driver Mode — Real Music UX Experiment."

**What it does NOT do** (all of the hard constraints above still apply in
full — this is additive detail, not an exception to them):

- Does not download, extract, scrape, mirror, proxy, or store any
  YouTube audio or video, anywhere, ever.
- Does not convert YouTube video to audio or separate audio from video.
- Does not use YouTube Music Premium or any personal account credentials.
- Does not hide, remove, or obscure YouTube's player, its native
  controls, or its attribution/branding. The `<iframe>` the API creates
  stays visibly present in the UI at all times — Raasta FM's own
  Previous/Play/Next controls are rendered _beside_ it, driving playback
  through the official `playVideo()` / `pauseVideo()` / `nextVideo()` /
  `previousVideo()` methods, never overlaid on top of the player itself.
- Does not circumvent YouTube advertising, restrictions, or any other
  required behavior of the embedded player.
- Does not reintroduce `seek()` into the core `MusicProvider` interface —
  see [ARCHITECTURE.md](ARCHITECTURE.md). If the visible YouTube player
  exposes its own native progress/seek UI as part of required minimum
  functionality (https://developers.google.com/youtube/terms/required-minimum-functionality),
  that is YouTube's own player behavior, not a Raasta FM feature, and does
  not change the product's no-seek contract.

**Isolation.** Implemented as `ExperimentalYouTubeProvider`
(`src/music/youtube/`), a second, independent implementation of the exact
same `MusicProvider` interface `MockMusicProvider` implements — proving
the abstraction holds, per [ARCHITECTURE.md](ARCHITECTURE.md). It is
**not** wired into the app-wide `PlayerContext`/`usePlayer()`; Driver Mode
owns a fully separate local instance (`useExperimentalYouTubePlayer`,
`src/features/driver-mode/`). Every other page — category browsing,
`/now-playing`, Favorites, Playlists, Recently Played — continues to run
on `MockMusicProvider`, completely unaffected. Removing the experiment
means deleting `src/music/youtube/` and `src/features/driver-mode/` and
reverting `src/pages/DriverMode.tsx` — no other file depends on it.

**Known limitations**, documented rather than hidden:

- `setQueue()` on this provider is a no-op — the "queue" is the YouTube
  playlist itself, controlled by YouTube, not application code.
- Only the currently-playing entry has real title/artist metadata (from
  the API's `getVideoData()`); enumerating full metadata for every
  playlist entry would require the separate YouTube Data API v3 with an
  API key, which this experiment does not use.
- `next()`/`previous()` follow YouTube's own playlist boundary behavior
  (no forced wrap-around), unlike `MockMusicProvider`.
- Favoriting acts on the shared app player state, not the YouTube-sourced
  track — favoriting a YouTube video is out of scope for this experiment,
  so the Favorites data model and persistence are unchanged.
- **Playlist history:** the original test playlist (`PLTJ1PnzCWyFw`) was
  replaced after testing found many of its individual videos had
  embedding disabled by their rights holders — common for commercial
  Hindi film-music uploads (major label channels routinely block
  third-party embedding while allowing direct viewing on youtube.com). It
  was then replaced by a Sony Music India playlist
  (`PLHuHXHyLu7BH71H9_USibJABiVmLNClQy`), and later by the current
  YouTube-generated "mix" playlist (above) at the requester's preference.
  Each replacement was verified fully embeddable and loadable via the
  official IFrame API — including, for the current playlist, confirming
  it initializes, resolves real track metadata, and plays/skips correctly
  with **no authentication and no signed-in session** — before adoption.
  This is a content/rights characteristic of whichever playlist is
  configured, not a defect in the provider or the embedding approach — the
  provider still handles a blocked video gracefully regardless: `onError`
  codes 100/101/150 trigger an automatic skip to the next playlist index
  via the official `cuePlaylist()` method (not a workaround — a normal API
  call), bounded by a ~9s total budget; if nothing playable is found in
  that window, Driver Mode shows a clear, honest error state instead of
  spinning indefinitely.

## No ads

Raasta FM's own experience is ad-free by design (see [PRODUCT.md](PRODUCT.md)).
This does not extend to interfering with an external provider's own ads —
we will never remove, block, obscure, or otherwise interfere with
advertisements belonging to an external music provider or player. If a
provider's terms require ads to remain intact, they remain intact.
