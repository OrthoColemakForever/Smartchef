# SmartChef

A cross-platform, voice-first cooking assistant for tablets.

## About

The core idea: parse a recipe into a structured `RecipeGraph` once (via an LLM call, or
by hand through a manual entry UI), then do everything else — scaling, navigation,
substitutions — as pure local computation. No network calls, no tokens spent, and it
works offline once a recipe is in your library.

A few architectural choices worth knowing up front:

- **BYOK (bring your own key).** API keys live in secure on-device storage and calls go
  straight from the device to the provider — there's no backend proxying inference.
- **Provider-agnostic.** An `LLMProvider` interface is meant to support multiple
  providers (Anthropic, OpenAI, Gemini, OpenRouter), not lock into one.
- **Voice-first, via Gemini Live.** The voice engine is Google's Gemini Live API —
  real-time, bidirectional audio in, audio out, no separate STT/TTS hop in between.
  Other providers (Anthropic, OpenAI, OpenRouter) stay supported through the same
  `LLMProvider` interface for text-based work, added after the voice loop works.

## Status

Early and actively in development.

- ✅ `RecipeGraph` types (`src/lib/recipe-graph.ts`), including user-curated ingredient
  chips and multi-category tagging (a dish can be e.g. both breakfast and lunch)
- ✅ `scale()` — scales ingredient amounts and servings, with a full passing test suite
  (`src/lib/scale.ts`, `src/lib/scale.test.ts`)
- ✅ Home screen — a resizable recipe card grid (real images, ingredient chips, category
  badges), fully responsive to iPad's windowed-app resizing
- ⬜ **Recipe persistence (current focus)** — manual recipe entry UI → SQLite → the grid
  rendering real, saved recipes instead of hardcoded sample data
- ⬜ `LLMProvider` interface + Gemini Live integration
- ⬜ Cooking session UI, timers, sidebar navigation

Nothing is saved anywhere yet — the grid you see runs entirely on hardcoded sample data.
Getting one real, persisted recipe into the app is the next concrete milestone.

## Tech stack

- [Expo](https://expo.dev) (SDK 57) + React Native
- TypeScript
- [Jest](https://jestjs.io) (`jest-expo` preset) for testing
- [expo-image](https://docs.expo.dev/versions/latest/sdk/image/) for recipe photos
- Planned: SQLite (local recipe storage, next up), Zustand (cooking session state),
  Gemini Live (voice), Supabase (auth + cross-device sync, layered on top of SQLite
  later — not a replacement for it, see "Why SQLite first" below)

## Getting started

```bash
npm install
npx expo start
```

From there, follow the CLI's prompts to open the app in a simulator, Expo Go, or a
connected device.

Run the test suite:

```bash
npm test
```

Typecheck the project:

```bash
npx tsc --noEmit
```

## Roadmap

1. **Spine** — `RecipeGraph` types, `scale()`, recipe card UI *(done)*
2. **Persistence** *(current focus)* — manual recipe entry UI (add/delete ingredient
   and step rows) → SQLite → the grid renders real, saved recipes
3. **Voice assistant** — `LLMProvider` interface + a Gemini Live integration as the
   primary voice engine (streamed audio in, audio out — replaces what was separately
   planned as TTS + STT + `ask()`); a still-undesigned second, more deliberate pass
   gates actual `editRecipe()` structural edits rather than trusting the live
   session's output directly, consistent with "never trust the model's arithmetic"
4. **Provider breadth & sync** — additional `LLMProvider` adapters (Anthropic, OpenAI,
   OpenRouter) for text-based work, secure key storage + entry UI, Supabase auth and
   cross-device sync layered on top of SQLite (see below)
5. **Phase 2** — on-device inference, OCR recipe import, interruption handling, cooking
   session state machine + timers, sidebar navigation, and polish (background/theme
   tweaks, search, recipe detail pages, splash screen)

### Why SQLite first, not Supabase

Supabase would add user accounts for free, which is genuinely appealing — but this
project's core promise since day one is that the app works with zero network dependency
once a recipe is saved ("parse once, run local"). A kitchen is a famously bad Wi-Fi
environment; storage that only lives on a remote server stops working exactly when
someone's mid-recipe with their hands full. SQLite guarantees the core experience keeps
working regardless of connectivity. Supabase stays in the plan — layered on top for
auth and cross-device sync once there's a real reason for an account — not instead of
local storage.

