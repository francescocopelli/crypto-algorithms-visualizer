// ── AI Tutor — WebLLM local inference (Phi-3.5-mini-instruct) ───────────────
// Uses @mlc-ai/web-llm loaded via ES module CDN in index.html.
// Exposed API:
//   AiTutor.init(modelId?)     → Promise<void>   — download + load model
//   AiTutor.ask(userMsg, ctx)  → AsyncGenerator   — streaming response
//   AiTutor.reset()            → void             — clear chat history
//   AiTutor.isReady()          → boolean
//   AiTutor.onProgress(cb)     → void             — cb({ progress, text })

(function (global) {
  'use strict';

  // ── Constants ──────────────────────────────────────────────────────────────
  const DEFAULT_MODEL = 'Phi-3.5-mini-instruct-q4f16_1-MLC';

  const SYSTEM_BASE = `Sei un tutor esperto di crittografia applicata che aiuta studenti universitari.
Rispondi sempre in italiano, in modo chiaro e conciso.
Usa esempi numerici semplici quando spieghi concetti matematici.
Se lo studente sbaglia, correggi gentilmente e spiega il perché.
Non inventare mai risultati numerici: se non sei sicuro, dillo esplicitamente.
Massimo 3-4 frasi per risposta, salvo che lo studente chieda una spiegazione approfondita.`;

  const TOPIC_CONTEXT = {
    rsa:   'Stiamo studiando RSA: generazione chiavi (n, φ(n), e, d), cifratura (c = mᵉ mod n), decifratura (m = cᵈ mod n), sicurezza basata sulla difficoltà di fattorizzare n.',
    dh:    'Stiamo studiando Diffie-Hellman: parametri p e g pubblici, esponenti privati a e b, valori pubblici A=gᵃ mod p e B=gᵇ mod p, segreto condiviso K=Bᵃ mod p = Aᵇ mod p. Vulnerabile a MITM senza autenticazione.',
    aes:   'Stiamo studiando AES: cifrario a blocchi simmetrico, 4 trasformazioni per round (AddRoundKey, SubBytes, ShiftRows, MixColumns), confusione da SubBytes, diffusione da MixColumns+ShiftRows. Modalità: ECB (insicuro), CBC, GCM (AEAD).',
    hash:  'Stiamo studiando funzioni hash e MAC: proprietà (pre-image, second pre-image, collision resistance, avalanche), hash vs MAC vs HMAC, HMAC come costruzione sicura contro length-extension.',
    aead:  'Stiamo studiando AEAD: AES-GCM e ChaCha20-Poly1305, ruolo del nonce (mai riusare), dati associati (AAD), regola verify-then-decrypt, disastri da nonce reuse.',
    elgamal: 'Stiamo studiando ElGamal: cifratura randomizzata, chiave pubblica y=gˣ mod p, valore effimero k, pericolo del riuso di k che espone la chiave privata.',
    ecc:   'Stiamo studiando ECC/ECDH: moltiplicazione scalare sostituisce esponenziazione, sicurezza da ECDLP, chiavi più corte rispetto a DH classico, scambio chiavi ECDH.',
    des:   'Stiamo studiando DES: struttura Feistel, chiave effettiva 56 bit, S-box come unica fonte di non-linearità, vulnerabilità alla ricerca esaustiva con hardware moderno.',
    mac:   'Stiamo studiando MAC/HMAC/CMAC: differenza tra hash e MAC keyed, costruzione HMAC, CMAC su AES, protezione contro length-extension, integrità e autenticazione.',
  };

  // ── State ──────────────────────────────────────────────────────────────────
  let _engine = null;
  let _ready = false;
  let _loading = false;
  let _history = [];          // { role: 'user'|'assistant', content: string }[]
  let _progressCb = null;
  let _currentTopic = null;

  // ── Progress callback ──────────────────────────────────────────────────────
  function onProgress(cb) { _progressCb = cb; }

  function _reportProgress(progress, text) {
    if (_progressCb) _progressCb({ progress, text });
  }

  // ── Build system prompt ────────────────────────────────────────────────────
  function _buildSystemPrompt(topicId) {
    const ctx = TOPIC_CONTEXT[topicId] || 'Stiamo studiando crittografia applicata in generale.';
    return `${SYSTEM_BASE}\n\nContesto attuale: ${ctx}`;
  }

  // ── Init / load model ──────────────────────────────────────────────────────
  async function init(modelId) {
    if (_ready || _loading) return;
    _loading = true;
    modelId = modelId || DEFAULT_MODEL;

    try {
      // web-llm is loaded as ES module via <script type="module"> in index.html
      // It attaches itself to globalThis.webllm
      if (!global.webllm) {
        throw new Error('WebLLM non trovato. Assicurati che lo script CDN sia caricato.');
      }
      const { CreateMLCEngine } = global.webllm;

      _reportProgress(0, 'Inizializzazione motore AI...');

      _engine = await CreateMLCEngine(modelId, {
        initProgressCallback: (report) => {
          const pct = Math.round((report.progress || 0) * 100);
          _reportProgress(pct, report.text || `Caricamento modello: ${pct}%`);
        }
      });

      _ready = true;
      _loading = false;
      _reportProgress(100, 'Modello pronto ✓');
    } catch (err) {
      _loading = false;
      _reportProgress(-1, `Errore: ${err.message}`);
      throw err;
    }
  }

  // ── Ask (streaming) ────────────────────────────────────────────────────────
  async function* ask(userMsg, topicId) {
    if (!_ready) throw new Error('Modello non ancora caricato. Chiama AiTutor.init() prima.');
    if (!userMsg || !userMsg.trim()) return;

    // Update system prompt if topic changed
    if (topicId && topicId !== _currentTopic) {
      _currentTopic = topicId;
      // Inject a context-change note without full history wipe
      if (_history.length > 0) {
        _history.push({
          role: 'user',
          content: `[Cambio argomento: ora stiamo parlando di ${topicId.toUpperCase()}]`
        });
        _history.push({
          role: 'assistant',
          content: `Perfetto, passiamo a ${topicId.toUpperCase()}. Come posso aiutarti?`
        });
      }
    }

    _history.push({ role: 'user', content: userMsg.trim() });

    const messages = [
      { role: 'system', content: _buildSystemPrompt(topicId || _currentTopic || 'general') },
      ..._history
    ];

    // Keep history manageable: max last 20 turns (system excluded)
    if (_history.length > 20) {
      _history = _history.slice(_history.length - 20);
    }

    const stream = await _engine.chat.completions.create({
      messages,
      temperature: 0.4,
      max_tokens: 512,
      stream: true,
    });

    let fullResponse = '';
    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content || '';
      if (delta) {
        fullResponse += delta;
        yield delta;
      }
    }

    _history.push({ role: 'assistant', content: fullResponse });
  }

  // ── Utilities ──────────────────────────────────────────────────────────────
  function reset() {
    _history = [];
    _currentTopic = null;
  }

  function isReady() { return _ready; }
  function isLoading() { return _loading; }

  // ── Public API ─────────────────────────────────────────────────────────────
  global.AiTutor = { init, ask, reset, isReady, isLoading, onProgress, DEFAULT_MODEL, TOPIC_CONTEXT };

})(typeof globalThis !== 'undefined' ? globalThis : window);
