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

### 🧠 Quiz Mode
12 multiple-choice questions with immediate feedback and explanations. Topics cover block ciphers, public-key primitives, authentication and attack recognition.

### 👩‍🏫 Teacher Mode
Concise definitions, intuitive analogies and warnings about the most common student misunderstandings — one panel per algorithm family.

---

## Stack

| Layer | Technology |
|---|---|
| Markup | Semantic HTML5 |
| Styles | Plain CSS with custom properties (dark/light theme) |
| Logic | Vanilla JavaScript (ES2020+), no frameworks |
| Data | JSON files in `data/` folder |
| Deploy | GitHub Pages (static, zero build step) |

---

## Project structure

```
crypto-algorithms-visualizer/
├── index.html        # Shell: header, sections, all CSS
├── app.js            # All data + render logic
├── _config.yml       # GitHub Pages config
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

---

## Educational disclaimer

This app uses simplified models and toy parameters for pedagogical clarity. **Do not use any of this code as a production cryptographic implementation.**

---

## License

MIT — free to use for teaching and learning.
