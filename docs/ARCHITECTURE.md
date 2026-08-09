# Architecture — Raasta FM

## Stack

React + TypeScript + Vite + Tailwind CSS + React Router. See
[README.md](../README.md) for why: small, well-understood, fast dev loop,
no backend required for the prototype phase.

State management starts with plain React state and Context. No Redux or
similar unless a concrete need appears — there isn't one yet for a
single-user, mostly-local-state prototype.

## Application layers

```
Raasta FM
    |
Music Provider (abstraction)
    |
    ├── Demo Audio Provider   (v1 default — see MUSIC-SOURCE.md)
    ├── Authorized Provider   (not built — pending a licensing decision)
    └── Future Provider(s)    (not built)
```

The app (pages, player UI, favorites, playlists) never talks to a specific
backend directly. It talks to a `MusicProvider` interface. This is the one
architectural decision that protects the prototype from a premature
commitment to a music source — see [MUSIC-SOURCE.md](MUSIC-SOURCE.md) for
why that commitment can't be made yet.

### `MusicProvider` interface

Defined in `src/music/types/index.ts`:

```ts
interface MusicProvider {
  play(): Promise<void>
  pause(): void
  next(): Promise<void>
  previous(): Promise<void>
  getCurrentTrack(): Track | null
  getQueue(): Queue
  getPlaybackState(): PlaybackState
}
```

Deliberately excludes `seek()` — the no-seek philosophy is enforced at the
interface level, not just the UI level, so a future provider can't
reintroduce scrubbing by accident.

**Alternatives considered:** a richer interface exposing `seek()` and
`setVolume()` was considered and rejected for v1 — anything the UI doesn't
expose shouldn't exist on the abstraction either, to keep the contract
honest. Volume/seek can be added later if a product decision calls for it.

## Folder structure

```
src/
├── app/            # app-level composition (providers, router setup)
├── components/      # shared, presentational components
├── features/
│   ├── player/       # now-playing UI, playback controls
│   ├── playlists/     # create/rename/add/remove/play/delete
│   ├── favorites/     # favorite toggle + favorites list
│   ├── library/       # category browsing (era / mood / Bhakti)
│   └── driver-mode/    # simplified large-control player view
├── music/
│   ├── providers/    # MusicProvider implementations
│   ├── types/         # MusicProvider, Track, Queue, PlaybackState
│   └── mock/           # demo/mock provider + demo catalog data
├── pages/            # route-level components
├── hooks/            # shared hooks
├── services/          # persistence and other cross-cutting services
├── utils/
├── data/             # static category/catalog data
└── styles/
```

Populated incrementally, feature by feature — see [ROADMAP.md](ROADMAP.md).
Nothing here is built ahead of the feature that needs it.

## Data model (conceptual, v1)

```ts
Track { id, title, artist, artworkUrl?, durationSeconds? }
Queue { tracks: Track[], currentIndex: number }
Category { id, label, kind: 'era' | 'mood' | 'bhakti' }
Playlist { id, name, trackIds: string[] }
FavoritesState { trackIds: Set<string> }
RecentlyPlayed { trackIds: string[] }  // capped length, no analytics
```

Catalog metadata (title/artist/category) is static app data in v1 — it is
**not** a copy of licensed audio, and does not imply we hold rights to any
track referenced by that metadata. See [MUSIC-SOURCE.md](MUSIC-SOURCE.md).

## Persistence strategy

`localStorage` for Favorites, Playlists, and Recently Played. Justification:
single-device, single-user prototype with no server and no cross-device
sync requirement. **A backend/database is not introduced simply because
one could be used** — if reviewer feedback later calls for sync, that's a
Phase 3+ decision, not a v1 default.

## Future backend considerations (not built, not scheduled)

If a licensed catalog and multi-device sync become real requirements
after reviewer feedback, the `MusicProvider` abstraction and a persistence
service boundary already exist to make that an additive change rather
than a rewrite. No backend, auth system, or database is planned for the
prototype phase.

## Explicit non-goals (architecture)

No microservices, no Kubernetes, no complex backend, no recommendation
engine, no AI features, no social/chat, no payments, no subscriptions, no
ad platform, no analytics infrastructure, no admin dashboard, no
multi-region deployment, no native mobile app, no complex auth — unless a
later, explicit product decision requires one. See [ROADMAP.md](ROADMAP.md)
Phase 4 for where that decision would even be considered.
