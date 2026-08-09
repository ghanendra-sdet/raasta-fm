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

## Future — Realtime Presence

**Status: documented, deferred. Not implemented. No backend exists yet to
support it.** See [ROADMAP.md](ROADMAP.md) for when this is revisited.

### Why it exists

Inspired by [saloon.wtf](https://saloon.wtf/)'s `🟢 18 online` indicator.
The point is not analytics — it's the psychological effect of a shared
listening space: _"I'm listening together with other people."_ Raasta FM
is trying to feel like a shared radio, not a private library, and this is
one of the cheapest ways to reinforce that without adding social features.
First-implementation wording: `🟢 42 online` (accurate — doesn't claim
every visitor is driving). `🟢 42 listening` / `🟢 42 on the road` are
future wording variants, not v1.

The indicator stays subtle — a small aggregate count near the player, not
a dashboard. The music stays the primary experience.

### What "online" means

An **active anonymous browser session currently connected to Raasta FM**,
not a page view and not a registered user. Concretely, a session counts as
"online" while:

- a tab has the app open, and
- that tab has sent a heartbeat (or held an open realtime connection)
  within the last N seconds (candidate: 20–30s heartbeat interval, ~45–60s
  expiry — tuned during implementation, not decided now).

It stops counting the moment the tab closes, the network drops, or the
heartbeat lapses — whichever happens first. It does **not** mean "visited
today" or "has an account" (there are no accounts).

### Anonymous session model

- No authentication. A session is a random client-generated session ID
  (e.g. a UUID held in memory or `sessionStorage`), not tied to any
  identity.
- No personal data collected or displayed: no names, emails, phone
  numbers, precise location, IP addresses, or profiles. Only an aggregate
  integer is ever sent to clients.
- No individual-level UI: no "who's online," no user list, no per-user
  station attribution shown to other users.

### Heartbeat / presence-expiry concept

Do not increment a counter on page load and decrement on page unload —
unload events are unreliable (crashes, killed tabs, lost network never
fire them). Instead:

- Client sends a periodic heartbeat (or holds an open connection) while
  the tab is open and visible.
- Server/presence-service tracks last-seen-at per session ID with a
  short TTL.
- A session that stops heartbeating (closed tab, crash, dead network,
  offline laptop) simply expires out of the presence set after the TTL —
  no explicit "goodbye" message required, though one can be sent
  opportunistically (`beforeunload`/`visibilitychange`) as an optimization,
  never as the only mechanism.
- Reconnection (network blip, mobile handoff between cell towers/wifi)
  re-establishes the same session ID where practical, so a brief drop
  doesn't read as two separate sessions.

### Multi-tab considerations

Multiple tabs from the same browser/device should not permanently inflate
the count. Two reasonable definitions, to choose between at
implementation time (trade-off, not decided now):

- **Per-tab session** (simplest): each tab is its own presence entry.
  Slightly overcounts a person with 3 tabs open, but trivial to implement
  and matches how saloon.wtf-style counters typically work.
- **Per-device/browser session** (via a shared `BroadcastChannel` or
  `SharedWorker` coordinating tabs, or a session ID persisted in
  `localStorage` and reference-counted across tabs): undercounts nothing,
  but adds coordination complexity for a cosmetic feature.

Recommendation when this is built: start with per-tab session — the
simplest option that satisfies "an approximate, honest, shared-space
feeling" — and only move to per-device coordination if reviewer feedback
specifically flags inflated-feeling counts.

### Privacy constraints (hard, not negotiable)

No names, emails, phone numbers, precise location, displayed IP addresses,
user profiles, listening history stored server-side, advertising
identifiers, or behavioral analytics. The system produces exactly one
public artifact: an aggregate integer, e.g. `{ "online": 42 }`. Nothing
else is exposed to clients.

### Conceptual data flow

```
Browser
   │  realtime connection (heartbeat or persistent socket)
   ▼
Presence Service
   │
   ├── session A (anonymous, ephemeral, TTL-based)
   ├── session B
   ├── session C
   └── ...
   │
   ▼
Active connection count
   │
   ▼
Broadcast updated count → { "online": 42 }
   │
   ▼
Raasta FM clients render 🟢 42 online
```

### Technology options (not chosen — evaluate at implementation time)

| Option                                                                      | Fit for this project                                                                                                                                                        |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| WebSocket (self-hosted or via a small managed service)                      | Full control over presence/heartbeat logic; requires running and operating a stateful server — real operational overhead for a prototype.                                   |
| Server-Sent Events (SSE) for the count, simple heartbeat POSTs for presence | One-directional broadcast is enough (clients only ever _receive_ a count); no bidirectional socket needed; works over plain HTTP; simplest to host on most platforms.       |
| Supabase Realtime (Presence feature)                                        | Purpose-built anonymous presence with TTL semantics out of the box; free tier likely sufficient at this scale; adds a third-party dependency and account.                   |
| Firebase Realtime Database (`onDisconnect` presence pattern)                | Well-documented presence pattern (`onDisconnect` handles the disconnect case natively); adds a Google-account dependency and its own data-residency/pricing considerations. |
| Redis-backed presence (`SETEX` per session, `SCARD`/count on read)          | Cheap and simple _if a server already exists_; introduces a new piece of infrastructure (Redis) purely for this feature otherwise.                                          |
| Cloudflare Durable Objects / Workers                                        | Good fit for cheap, globally-distributed ephemeral presence at small scale; newer/less standard pattern, steeper learning curve than the alternatives above.                |

**Preliminary lean (to be re-evaluated when this is actually built, not a
commitment now):** SSE (or a managed presence primitive like Supabase
Realtime) over a self-hosted WebSocket/Redis stack — the count is
one-directional and doesn't need a stateful server we operate ourselves,
which matches "simplest solution that satisfies the requirements" better
than standing up new infrastructure for a cosmetic counter.

### Why it's intentionally deferred

Live presence needs _some_ backend/realtime infrastructure — the one
category of infrastructure the current MVP scope explicitly avoids
(see [MUSIC-SOURCE.md](MUSIC-SOURCE.md) and this doc's non-goals). Building
it now would mean standing up realtime infrastructure before the core
product question — _is the no-seek, radio-like listening experience
itself good_ — has been validated by the first ~10 reviews. See
[ROADMAP.md](ROADMAP.md).

### Why the current architecture doesn't block this later

Nothing in the v1 architecture assumes presence doesn't exist:

- The `MusicProvider` abstraction and app layers don't reference presence
  at all — it's an orthogonal, additive concern.
- The suggested integration point is a small `PresenceProvider` (a new
  entry under `src/features/`, e.g. `src/features/presence/`) exposing a
  single `useOnlineCount()` hook — the same pattern already used for
  Favorites/Playlists/Player state, so it slots in without restructuring.
- Rendering the indicator is a small, isolated UI addition near the
  player (see the future UX mockup in the roadmap entry) — it does not
  require changes to routing, the data model, or the music-provider
  contract.

## Explicit non-goals (architecture)

No microservices, no Kubernetes, no complex backend, no recommendation
engine, no AI features, no social/chat, no payments, no subscriptions, no
ad platform, no analytics infrastructure, no admin dashboard, no
multi-region deployment, no native mobile app, no complex auth — unless a
later, explicit product decision requires one. See [ROADMAP.md](ROADMAP.md)
Phase 4 for where that decision would even be considered.
