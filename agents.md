# Agents

This document explains how the main JavaScript modules in the project work together, with a special focus on the on-device AI Tutor.

## Overview

The app is intentionally framework-free: all behavior lives in a small set of vanilla JavaScript modules that operate on a static `index.html` shell. Each module plays a distinct "agent" role:

- `app.js` — UI and data orchestrator for algorithms, attacks, examples, quiz, Co-Teaching and teacher panels.
- `exercise_engine.js` — step-by-step exercise agent for RSA and Diffie-Hellman.
- `ai_tutor.js` — AI Tutor agent that wraps WebLLM / Phi-3.5-mini and exposes a small API to the UI.

## app.js — UI / data agent

`app.js` owns all cryptography-related content and the rendering logic for:

- Algorithm Visualizer (steps, matrices, KPIs, teacher callouts)
- Attack Lab (risk bar, experiments, observations)
- Guided Examples (step timelines, common mistakes)
- Quiz Mode (questions, options, explanations, stats)
- Co-Teaching (CT_TOPICS lesson bubbles, check questions, FAQs)
- Teacher Mode and Exam Sheet panels

It does not know anything about WebLLM or the AI Tutor. Instead, it exposes clear hooks such as `renderCoteach()` and DOM elements (like `#ctLessonContent` and `#ctFaqList`) that other modules can extend.

## exercise_engine.js — exercise agent

`exercise_engine.js` is a focused agent that turns algorithm parameters into interactive exercises.

For each supported algorithm (currently RSA and Diffie-Hellman), it provides:

- A `params` description with labels and defaults
- A `generateRandom()` helper that returns exam-friendly random parameters
- A `buildSteps(params)` function that produces an ordered list of steps

Each step contains:

- A human-readable description
- The expected answer in canonical string form
- Metadata to render the timeline and feedback banners

The `index.html` shell uses this engine twice:

- Inside the Visualizer "Exercise mode" panel
- In the dedicated ✏️ Exercises section (standalone exercises)

## ai_tutor.js — AI Tutor agent

`ai_tutor.js` is the only module that talks to WebLLM / Phi-3.5-mini in the browser. It hides all model details behind a simple, UI-friendly API:

- `AiTutor.onProgress(handler)` — subscribe to progress updates during model download and initialization.
- `AiTutor.init()` — load and prepare the WebLLM model (handled as a one-time operation, cached by the browser).
- `AiTutor.isLoading()` / `AiTutor.isReady()` — report current availability of the AI.
- `AiTutor.ask(message, topicId)` — async generator that streams answer chunks for a given user message and Co-Teaching topic.
- `AiTutor.reset()` — clear the current conversation history.

The AI Tutor is **local-first**:

- All inference runs in the browser via WebGPU or WASM.
- No network calls to external APIs are made when answering questions.
- Conversation history is kept in memory only and trimmed to a fixed number of turns.

## Co-Teaching + AI Tutor integration

The Co-Teaching section in `index.html` is where `app.js` and `ai_tutor.js` meet.

Key ideas:

- Each `CT_TOPICS` entry contains `steps`, `faqs` and a `suggestions` array of topic-specific question ideas.
- `renderCoteach()` updates the lesson content and FAQ accordion, and calls `renderAiSuggestions(topic)` to refresh the AI suggestion chips.
- The AI Tutor panel lives inside the Co-Teaching layout, just under the FAQ card, and reads the current topic from `CT_STATE.topicIdx`.

The wiring in `index.html`:

- Uses `AiTutor.onProgress()` to keep the progress bar and status text in sync during model download.
- Calls `AiTutor.init()` when the user presses "Carica modello AI", disabling the button once the model is ready.
- Streams answers into the UI via `for await (const chunk of AiTutor.ask(msg, topicId))`, updating the assistant bubble as text arrives.
- Maintains UX states (submit enabled/disabled, streaming cursor, automatic scroll to bottom) entirely in the DOM.

## Extending agents

To add a new cryptography topic or feature:

- Extend `CT_TOPICS` in `index.html` / `app.js` with new `steps`, `faqs` and `suggestions`.
- Add corresponding data to `data/*.json` if needed for the visualizer, quiz or teacher mode.
- Use the existing hooks in `app.js` to render new panels instead of introducing a separate UI framework.

To add a new AI capability:

- Extend `ai_tutor.js` with new methods or context-handling logic, keeping the public surface small.
- Reuse the existing AI Tutor panel in `index.html` instead of creating separate chat widgets.

This keeps the project maintainable and easy to reason about for students who are also learning how different "agents" (modules) collaborate in a larger system.
