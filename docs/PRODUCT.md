# Product Vision — Raasta FM

## Vision

Give drivers — auto, cab, bus, truck, and anyone on a long route — a Hindi
music experience that asks nothing of them once it starts. Choose a
station or mood, press play, and listen. No seeking, no browsing while
moving, no algorithmic feed to manage. The feeling to recreate is a 1990s
Indian barbershop radio or a car-stereo cassette: music that's simply
_on_, in the background, while you do something else.

Inspiration: [saloon.wtf](https://saloon.wtf/) (UX reference only — no
branding, artwork, source, or layout is copied; see [ARCHITECTURE.md](ARCHITECTURE.md)
for how the product diverges).

## Target users / personas

1. **Auto/cab drivers** — short trips, frequent stops, needs music that
   restarts cleanly and doesn't demand attention between fares.
2. **Bus/truck/long-route drivers** — long stretches, wants sustained mood
   (Night Drive, Road Trip, Bhakti) without touching the phone often.
3. **Nostalgia listeners** — not necessarily driving, wants the "old radio"
   feeling rather than a personalized algorithmic feed.

All three personas share one requirement: **minimal interaction is the
feature**, not a limitation to work around.

## Product principles

- **You don't control every second of the song. You simply listen.**
- Choose a station/playlist → press play → listen. That's the core loop.
- Fewer controls, used more confidently, beats more controls used rarely.
- Favor mood and occasion (Night Drive, Road Trip) over algorithmic
  personalization.
- Bhakti is a first-class category, not an afterthought.
- No dark patterns: no autoplay-into-ads, no manufactured urgency, no
  infinite-scroll browsing that encourages distraction while driving.

## Core features (v1 prototype)

- Hindi-only catalog, organized by **era**, **mood**, and **Bhakti**.
- Player: previous / play / pause / next / favorite. No seek/scrub.
- Favorites (persisted locally).
- Playlists: create, rename, add song, remove song, play, delete.
- Recently played (lightweight, no analytics infrastructure).
- Driver Mode: an even simpler, large-touch-target player view, entered
  deliberately before driving — not a mode for browsing while moving.

## Explicit non-goals (v1)

- Not a Spotify competitor. Not optimizing for catalog size or feature count.
- No languages other than Hindi (see the era/mood/Bhakti category lists in
  this doc's companion, the app's category data).
- No seek bar, no 10-second skip, no scrubbing.
- No social features, no chat, no recommendations/AI feed, no ads inside
  the Raasta FM experience, no payments/subscriptions, no accounts beyond
  what local persistence requires.
- No commercial music licensing decision yet — see
  [MUSIC-SOURCE.md](MUSIC-SOURCE.md).
- No native mobile app — mobile web / PWA first.

## Success criteria (first ~10 reviews)

Not measured by feature count, song count, or lines of code. Measured by:

- Does the concept make sense immediately?
- Does the nostalgic experience actually land?
- Is the player easy to understand without explanation?
- Would drivers actually use it?
- Do people like _not_ having seek/scrub control?
- Are Favorites and Playlists useful in practice?
- Is Bhakti as important to reviewers as assumed?
- Which Hindi categories get requested most?
- Would people reach for this over a normal music app in specific
  situations (driving, background listening)?

Findings get logged in [REVIEW-NOTES.md](REVIEW-NOTES.md) and summarized
after the first ~10 reviews, before any further scope expansion.
