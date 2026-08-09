# Roadmap — Raasta FM

Phased on purpose: the goal of Phases 0–2 is to find out whether the
concept is worth building further, not to ship a complete product.
**Do not jump directly to Phase 4.**

## Phase 0 — Concept validation

- Product vision, personas, and non-goals documented ([PRODUCT.md](PRODUCT.md)).
- Architecture proposal reviewed, including the music-provider abstraction
  ([ARCHITECTURE.md](ARCHITECTURE.md)) and the copyright constraints
  ([MUSIC-SOURCE.md](MUSIC-SOURCE.md)).
- Repository initialized with foundation only: scaffold, tooling, docs.

_(Status: this phase — repo and docs are being created now.)_

## Phase 1 — Prototype

- Application shell, routing.
- Hindi category browsing (era / mood / Bhakti).
- `MusicProvider` abstraction + demo/mock provider (no real catalog).
- Player UI: previous / play / pause / next / favorite, no seek.
- Favorites (localStorage).
- Playlists: create, rename, add song, remove song, play, delete.
- Recently played (lightweight).
- Driver Mode (first pass).
- Critical-path unit/component tests + Playwright E2E for the core journey.

## Phase 2 — User review

- Deploy a reviewable build (no production infrastructure).
- Collect ~10 structured reviews from people who understand auto/bus/cab/
  long-distance driving and Hindi music nostalgia ([REVIEW-NOTES.md](REVIEW-NOTES.md)).
- Summarize findings against the success criteria in [PRODUCT.md](PRODUCT.md).
- Stop and reassess before further development.

## Phase 3 — Music-source decision

- Only after Phase 2 findings are in: decide whether/how to pursue a real
  music source (authorized provider integration, licensing, or continued
  demo/mock use).
- This decision is explicitly not made in advance — see
  [MUSIC-SOURCE.md](MUSIC-SOURCE.md).

## Phase 4 — Production architecture

- Only considered if Phases 1–3 validate the concept and a music source is
  resolved. Not scoped yet. Nothing in Phases 0–2 should assume this phase
  happens.

### Future Feature — Live Presence

**Status:** Planned / Deferred.

**Concept:** a subtle `🟢 42 online` indicator near the player — anonymous,
aggregate-only, no user list. Full architecture, session model, heartbeat/
expiry design, multi-tab trade-offs, privacy constraints, and a
non-binding technology comparison (WebSocket vs. SSE vs. Supabase
Realtime vs. Firebase vs. Redis vs. Cloudflare) are documented in
[ARCHITECTURE.md — Future: Realtime Presence](ARCHITECTURE.md#future--realtime-presence).
Not implemented; no realtime infrastructure exists yet.

**Reason deferred:** Not required for initial UX validation and would
introduce backend/realtime infrastructure before the core product
question — whether the no-seek, radio-like listening experience itself
works — has been validated. Matches the project's stated bias against
adding infrastructure ahead of a concrete, validated need (see
[ARCHITECTURE.md](ARCHITECTURE.md) non-goals and [MUSIC-SOURCE.md](MUSIC-SOURCE.md)).

**Earliest reconsideration point:** after Phase 2 review findings are in
and Phase 3 (music-source decision) is underway — i.e. once the product
itself is validated and some form of backend is being considered anyway
for other reasons. Global presence before station-level presence; station-
level presence (`90s Hindi 🟢 18 listening`) only after global presence is
proven to add value.

## Out of scope until a phase explicitly calls for it

Microservices, Kubernetes, complex backend infra, recommendation/AI
features, social/chat, payments, subscriptions, an ad platform, complex
analytics, an admin dashboard, multi-region infrastructure, native mobile
apps, complex auth. See [ARCHITECTURE.md](ARCHITECTURE.md) non-goals.
