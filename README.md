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
- **Voice-first.** Built around hands-free use in a kitchen — TTS readout, STT voice
  commands, and timers are core to the experience, not an add-on.

## Status

Early and actively in development. Currently partway through **Step 1 — the spine**:

- ✅ `RecipeGraph` types (`src/lib/recipe-graph.ts`)
- ✅ `scale()` — scales ingredient amounts and servings, with a full passing test suite
  (`src/lib/scale.ts`, `src/lib/scale.test.ts`)
- ⬜ `LLMProvider` interface + first provider adapter
- ⬜ Manual recipe entry UI → SQLite → rendered recipe list

There's no cooking-session UI, voice support, or persistence yet — right now this is
foundational data-layer work, not a runnable app experience.

## Tech stack

- [Expo](https://expo.dev) (SDK 57) + React Native
- TypeScript
- [Jest](https://jestjs.io) (`jest-expo` preset) for testing
- Planned: Zustand (session state), SQLite (local recipe storage), Supabase (auth + sync)

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

1. **Spine** — `RecipeGraph` types, `scale()`, `LLMProvider` interface, manual recipe
   entry UI *(in progress)*
2. **Interaction loop** — cooking session state machine, TTS readout, STT voice
   commands, timers, `ask()` / `editRecipe()`
3. **Provider breadth & persistence** — additional `LLMProvider` adapters, secure key
   storage + entry UI, Supabase auth and sync
4. **Phase 2** — on-device inference, OCR recipe import, interruption handling

