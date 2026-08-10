# Raasta FM

**Bas Chalao, Gaane Suno.** _(working tagline — may change)_

**🎧 Try it live:** https://ghanendra-sdet.github.io/raasta-fm/
— opens directly into Driver Mode, the current review experience. Have a
listen, and if you've got a minute, a rating or a note on what worked (or
didn't) is genuinely useful at this stage — see
[REVIEW-NOTES.md](docs/REVIEW-NOTES.md) or open an issue with your
feedback.

Raasta FM is an experimental, nostalgic Hindi music experience built for people
who spend their day driving: auto, cab, bus, and truck drivers, and anyone who
wants a simple road-trip listening experience instead of a modern streaming app.

## Why it exists

Modern streaming apps ask you to constantly choose, skip, seek, and manage.
Raasta FM is the opposite: pick a station or mood, press play, and just
listen — closer to a 1990s/2000s Indian radio or cassette player than to
Spotify. See [docs/PRODUCT.md](docs/PRODUCT.md) for the full product vision
and [docs/UX.md](docs/UX.md) for the "no-seek" interaction philosophy.

## Who it's for

Auto, cab, bus, and truck drivers first — anyone who wants a low-attention,
high-nostalgia Hindi music experience second.

## Current scope

- **Hindi only.** No other languages in v1. See [docs/PRODUCT.md](docs/PRODUCT.md).
- Categories: Hindi by era, Hindi by mood, Bhakti, and personal
  (Favorites / My Playlists / Recently Played).
- Player: previous, play/pause, next, favorite. No seek bar in v1.
- Music source: authorized/demo audio only during the prototype phase —
  **no copyrighted content is stored or redistributed.** This is a hard
  constraint; see [docs/MUSIC-SOURCE.md](docs/MUSIC-SOURCE.md).

## Current limitations

- No commercial music catalog yet — the final music source is not decided.
- Driver Mode, playlists, and favorites are being built incrementally; see
  [docs/ROADMAP.md](docs/ROADMAP.md) for what's live vs. planned.
- This is a prototype intended for a small (~10 person) reviewer group, not
  a public release. See [docs/REVIEW-NOTES.md](docs/REVIEW-NOTES.md).

## Development status

**Experimental / Prototype.** The current priority is UX validation, not
feature count or catalog size. See [docs/ROADMAP.md](docs/ROADMAP.md) for
phases and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how the app is
built, including the provider-agnostic music abstraction.

## Tech stack

React, TypeScript, Vite, Tailwind CSS, React Router, ESLint, Prettier.

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run lint      # eslint
npm run format    # prettier --write
npm run build     # typecheck + production build
```

## Documentation

- [docs/PRODUCT.md](docs/PRODUCT.md) — vision, personas, principles, non-goals
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — app architecture, data model, music-provider abstraction
- [docs/MUSIC-SOURCE.md](docs/MUSIC-SOURCE.md) — copyright constraints (mandatory reading)
- [docs/UX.md](docs/UX.md) — driver-first design principles
- [docs/ROADMAP.md](docs/ROADMAP.md) — phased development plan
- [docs/REVIEW-NOTES.md](docs/REVIEW-NOTES.md) — prototype reviewer feedback log
