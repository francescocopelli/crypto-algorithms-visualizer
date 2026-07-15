# Crypto Algorithms Visualizer

> Interactive educational lab for cryptography students and teachers — no install, no dependencies, runs in any browser.

🔗 **Live demo:** [francescocopelli.github.io/crypto-algorithms-visualizer](https://francescocopelli.github.io/crypto-algorithms-visualizer)

---

## What is this?

A single-page web app that lets you step through the internals of 9 cryptographic algorithm families, experiment with 6 attack scenarios, rehearse 6 guided numeric examples, answer 12 quiz questions and read concise teacher explanations — all without installing anything.

Built for university courses in Applied Cryptography and Information Security.

---

## Sections

### 🔬 Algorithm Visualizer
Step-by-step walkthrough of each algorithm's internal state. Switch between **Student mode** (plain-language hints) and **Teacher mode** (deeper design notes).

| Algorithm | Category | Key insight |
|---|---|---|
| AES-128 | Block cipher | Substitution-Permutation Network; confusion via S-box, diffusion via MixColumns |
| DES | Feistel cipher | 56-bit key; nonlinearity from S-boxes only |
| RSA | Public key | Trapdoor from integer factoring; φ(n) connects public and private exponents |
| Diffie-Hellman | Key exchange | Shared secret derived without transmission; discrete log hardness |
| ElGamal | Public key | Randomized encryption; ephemeral k must never repeat |
| Hash functions | Digest | Avalanche effect; one-wayness; no key |
| MAC / HMAC / CMAC | Authentication | Keyed integrity; distinguishes fingerprinting from authentication |
| Authenticated Encryption | AEAD | Confidentiality + integrity in one construction; verify tag before decrypting |
| ECC / ECDH | Elliptic curve | Scalar multiplication replaces exponentiation; smaller keys, same security |

### ⚔️ Attack Lab
Experiment with weakened constructions and understand *why* they fail:
- **ECB pattern leakage** — equal blocks, equal ciphertexts
- **DES 56-bit brute force** — exhaustive key search
- **CBC bit-flipping** — malleability without integrity
- **Textbook RSA** — deterministic, no semantic security
- **Nonce reuse (AEAD)** — catastrophic keystream reuse
- **Reused ephemeral k** — private key exposure in ElGamal/DSA

### 📖 Guided Examples
Exam-friendly numeric walkthroughs you can rehearse by hand:
- RSA toy example (p=61, q=53, e=17)
- Small-prime Diffie-Hellman (p=23, g=5)
- AES round intuition
- Hash vs HMAC comparison
- ECB image thought experiment
- ECDH conceptual flow

### ✏️ Exercises
Interactive step-by-step exercises for RSA and Diffie-Hellman. Enter your answers at each step and get immediate feedback. Use 🎲 to generate random exam-friendly parameters.

### 🧠 Quiz Mode
12 multiple-choice questions with immediate feedback and explanations. Topics cover block ciphers, public-key primitives, authentication and attack recognition.

### 💬 Co-Teaching
Guided lesson flow for 5 algorithm families (RSA, Diffie-Hellman, AES, Hash & MAC, AEAD). Each topic includes multi-step explanations, analogies, embedded check questions and a FAQ accordion.

### 🤖 AI Tutor *(local, privacy-first)*
An on-device AI assistant powered by **[WebLLM](https://webllm.mlc.ai/)** running **Phi-3.5-mini-instruct** entirely in the browser — no server, no API key, no data ever leaves the device.

- **Context-aware:** system prompt automatically includes the active Co-Teaching topic so the model gives relevant answers
- **Streaming responses:** text appears word-by-word as it is generated
- **Persistent chat history:** up to 20 turns per session, automatically trimmed
- **Topic continuity:** switching Co-Teaching topic injects a context-change note into the conversation without losing history
- **Download once, run forever:** the model is cached by the browser after the first load (~2.2 GB for Phi-3.5-mini Q4)

> **First-time load:** the model is downloaded from the MLC CDN and cached in the browser's IndexedDB. Subsequent loads are instant.

### 👩‍🏫 Teacher Mode
Concise definitions, intuitive analogies and warnings about the most common student misunderstandings — one panel per algorithm family.

### 📋 Exam Sheet
Quick-reference table for all 9 primitives: confidentiality, integrity, authentication, non-repudiation, typical use cases and secure configurations.

---

## Browser compatibility

| Feature | Chrome 113+ | Firefox 117+ | Safari 17.4+ | Edge 113+ |
|---|:---:|:---:|:---:|:---:|
| Core app (visualizer, quiz…) | ✅ | ✅ | ✅ | ✅ |
| AI Tutor (WebLLM / WebGPU) | ✅ | ❌* | ✅ | ✅ |
| AI Tutor fallback (WASM) | ✅ | ✅ | ✅ | ✅ |

*Firefox WebGPU support is experimental behind a flag as of mid-2026. The WASM fallback works but is slower.

---

## Stack

| Layer | Technology |
|---|---|
| Markup | Semantic HTML5 |
| Styles | Plain CSS with custom properties (dark/light theme) |
| Logic | Vanilla JavaScript (ES2020+), no frameworks |
| AI inference | [WebLLM](https://webllm.mlc.ai/) · Phi-3.5-mini-instruct-q4f16_1 (local, in-browser) |
| Deploy | GitHub Pages (static, zero build step) |

---

## Project structure

```
crypto-algorithms-visualizer/
├── index.html           # Shell: header, nav, all sections, CSS, WebLLM AI Tutor UI
├── app.js               # Algorithm / attack / quiz data + render logic
├── exercise_engine.js   # Step-by-step exercise renderer
├── ai_tutor.js          # WebLLM wrapper: init, streaming ask, history, context
├── _config.yml          # GitHub Pages config
└── data/
    ├── algorithms.json
    ├── attacks.json
    ├── examples.json
    ├── quiz.json
    └── teacher.json
```

---

## Usage

Open `index.html` directly in a browser, or visit the [live GitHub Pages site](https://francescocopelli.github.io/crypto-algorithms-visualizer).

No build step, no npm, no bundler required.

For the **AI Tutor**, the first visit downloads the Phi-3.5-mini model (~2.2 GB) and caches it in IndexedDB. After that, the tutor loads instantly on every subsequent visit.

---

## Educational disclaimer

This app uses simplified models and toy parameters for pedagogical clarity. **Do not use any of this code as a production cryptographic implementation.**

---

## License

MIT — free to use for teaching and learning.
