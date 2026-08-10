# UX — Raasta FM

## Driver-first principles

The primary user may be operating a vehicle. Every UI decision is
evaluated against that constraint first:

- Mobile-first, not "responsive as an afterthought."
- Large touch targets — nothing that requires precision.
- Minimal interaction to get music playing.
- High readability, strong contrast, no low-contrast "aesthetic" text.
- Very few controls, all obvious without explanation.
- No unnecessary copy, no complicated menus.
- No distracting animation — motion is calm, not attention-seeking.
- Operable with minimal attention: glance, tap, back to the road.

## What the app deliberately avoids

- Seek/scrub bar.
- 10-second forward/backward skip.
- Complex, multi-row player controls.
- Aggressive or excessive recommendations.
- Deep or complicated navigation trees.
- Social-media-style features (feeds, likes-from-others, sharing pressure).
- Distracting animation.
- Tiny tap targets.
- Heavy, dashboard-style UI.

## The core loop

**Choose a station/playlist → press play → listen.**

Everything else (favorites, playlists, recently played) supports that loop;
none of it should compete with it for attention.

## Player behavior — no-seek philosophy

The player intentionally does not expose seeking. This isn't a missing
feature — it's the product's central idea: _you don't control every
second of the song, you simply listen_, the way a radio or cassette deck
worked. Available controls: previous, play/pause, next, favorite.
Shuffle, repeat, and queue view are possible later additions, kept out of
v1 to keep the first impression simple. See [PRODUCT.md](PRODUCT.md) for
the product principle this UX choice is built on.

**Scoped exception — Driver Mode's review build.** Driver Mode's
experimental YouTube-backed player (`ExperimentalYouTubeProvider`, see
docs/MUSIC-SOURCE.md) exposes a real, draggable seek control on its
progress bar, added after direct reviewer feedback: several videos in the
review playlist open with a spoken/dialogue intro before the song starts,
and reviewers wanted a way to skip past it. This is a deliberate,
narrowly-scoped departure from the principle above — it exists only on
`ExperimentalYouTubeProvider.seekTo()`, is not part of the `MusicProvider`
interface, and `MockMusicProvider` (the permanent product's provider) has
no equivalent. Every other page in the app remains no-seek. Whether the
permanent product should eventually allow seeking is an open question for
after this review round, not something this change has settled.

## Driver Mode (future)

An even more stripped-down player view, entered deliberately before a
drive starts — not a mode meant to encourage browsing while moving.
Concept:

```
          RAASTA FM

       🎵 Song Title
          Artist

      ┌────┐ ┌────┐ ┌────┐
      │ ⏮ │ │ ▶  │ │ ⏭ │
      └────┘ └────┘ └────┘

             ♥
```

Design constraint: Driver Mode must not introduce a browsing/searching
interaction pattern. Playlist selection happens before driving; Driver
Mode is playback-only.

## Accessibility

- Sufficient color contrast at all times (this is also a driving-safety
  requirement, not just a WCAG checkbox).
- All interactive controls reachable and operable via keyboard, with
  visible focus states.
- No information conveyed by color alone (e.g., favorite state also uses
  an icon fill change, not just a color change).
- Respect `prefers-reduced-motion`.

## Navigation

Kept shallow on purpose: Home → category → station/playlist → player, and
Home → Favorites / Playlists / Recently Played directly. No nested menus
beyond that for v1.
