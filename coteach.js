// coteach.js — Co-Teaching data + render logic
// Loaded with defer before app.js so CT_TOPICS is always defined when DOMContentLoaded fires.

var CT_TOPICS = [
  {
    id: 'symmetric', label: 'Crittografia Simmetrica', tag: 'AES / DES',
    suggestions: ['Come funziona AES internamente?', 'Perché DES è obsoleto?', 'Cos’è la chiave a 128 bit?'],
    steps: [
      {
        html: '<div class="lesson-bubble"><strong>Cos’è la crittografia simmetrica?</strong><br>Mittente e destinatario usano la <em>stessa chiave segreta</em> per cifrare e decifrare. È veloce e adatta a grandi volumi di dati.</div>' +
              '<div class="lesson-bubble analogy"><strong>Analogia:</strong> è come una cassaforte con un’unica combinazione condivisa tra due persone fidate.</div>',
        question: {
          text: 'Nella crittografia simmetrica, quante chiavi vengono usate?',
          opts: ['Una chiave condivisa', 'Una chiave pubblica e una privata', 'Nessuna chiave', 'Una chiave diversa per ogni messaggio'],
          correct: 0,
          explanation: 'Corretto: mittente e destinatario condividono un’unica chiave segreta.'
        }
      },
      {
        html: '<div class="lesson-bubble"><strong>AES (Advanced Encryption Standard)</strong><br>Blocco da 128 bit, chiavi da 128/192/256 bit. Lavora su una matrice 4×4 di byte (State) applicando 4 trasformazioni per round: SubBytes, ShiftRows, MixColumns, AddRoundKey.</div>' +
              '<div class="lesson-bubble fact"><strong>Fatto:</strong> AES è lo standard NIST dal 2001 ed è considerato sicuro per uso governativo e commerciale.</div>',
        question: {
          text: 'Quale dimensione ha il blocco di AES?',
          opts: ['64 bit', '128 bit', '256 bit', '512 bit'],
          correct: 1,
          explanation: 'AES usa sempre blocchi da 128 bit, indipendentemente dalla lunghezza della chiave.'
        }
      },
      {
        html: '<div class="lesson-bubble"><strong>Modalità operative</strong><br>La stessa chiave non deve cifrare lo stesso blocco nello stesso modo. Le modalità (ECB, CBC, CTR, GCM) aggiungono variabilità.</div>' +
              '<div class="lesson-bubble warning"><strong>Attenzione:</strong> ECB è pericoloso: blocchi identici producono ciphertext identici, rivelando pattern nel plaintext.</div>',
        question: {
          text: 'Perché la modalità ECB è considerata insicura?',
          opts: ['Usa chiavi troppo corte', 'Blocchi uguali producono ciphertext uguali', 'Non usa padding', 'Non supporta AES'],
          correct: 1,
          explanation: 'ECB cifra ogni blocco indipendentemente: pattern nel plaintext rimangono visibili nel ciphertext.'
        }
      }
    ],
    faqs: [
      { q: 'Qual è la differenza tra AES-128 e AES-256?', a: 'La lunghezza della chiave: 128 bit (10 round) vs 256 bit (14 round). Entrambi usano blocchi da 128 bit.' },
      { q: 'Quando usare CTR invece di CBC?', a: 'CTR è parallelizzabile e non richiede padding; CBC è più diffuso ma sequenziale nella cifratura.' },
      { q: 'DES è ancora sicuro?', a: 'No. Chiave da 56 bit è vulnerabile a brute-force. 3DES offre miglioramenti ma è deprecato; usare AES.' }
    ]
  },
  {
    id: 'asymmetric', label: 'Crittografia Asimmetrica', tag: 'RSA / ECC',
    suggestions: ['Come si generano le chiavi RSA?', 'Cos’è la funzione di Eulero?', 'Perché ECC usa chiavi più corte?'],
    steps: [
      {
        html: '<div class="lesson-bubble"><strong>Chiave pubblica e privata</strong><br>Ogni parte ha una coppia: la <em>chiave pubblica</em> è condivisa liberamente, la <em>privata</em> rimane segreta. Ciò che viene cifrato con una può essere decifrato solo con l’altra.</div>' +
              '<div class="lesson-bubble analogy"><strong>Analogia:</strong> la chiave pubblica è una buca delle lettere aperta; chiunque può inserire messaggi, ma solo il proprietario ha la chiave per aprirla.</div>',
        question: {
          text: 'Con quale chiave si cifra un messaggio destinato a Bob?',
          opts: ['Chiave privata di Bob', 'Chiave pubblica di Bob', 'Chiave privata di Alice', 'Chiave simmetrica condivisa'],
          correct: 1,
          explanation: 'Si cifra con la chiave pubblica del destinatario; solo lui può decifrare con la sua chiave privata.'
        }
      },
      {
        html: '<div class="lesson-bubble"><strong>RSA: come funziona</strong><br>1. Scegli due primi p, q. 2. n = p·q, φ(n) = (p-1)(q-1). 3. Scegli e tale che gcd(e, φ(n)) = 1. 4. Calcola d = e⁻¹ mod φ(n). Chiave pubblica: (n, e). Chiave privata: (n, d).</div>' +
              '<div class="lesson-bubble fact"><strong>Fatto:</strong> la sicurezza di RSA si basa sulla difficoltà di fattorizzare n in p e q quando questi sono grandi.</div>',
        question: {
          text: 'Su quale problema matematico si basa la sicurezza di RSA?',
          opts: ['Logaritmo discreto', 'Fattorizzazione di interi grandi', 'Problema dello zaino', 'Radice quadrata modulare'],
          correct: 1,
          explanation: 'RSA è sicuro finché fattorizzare n = p·q è computazionalmente intrattabile.'
        }
      },
      {
        html: '<div class="lesson-bubble"><strong>ECC: curve ellittiche</strong><br>La crittografia a curva ellittica offre sicurezza equivalente a RSA con chiavi molto più corte (256 bit ECC ≈ 3072 bit RSA), grazie alla difficoltà del problema del logaritmo discreto su curve ellittiche.</div>' +
              '<div class="lesson-bubble fact"><strong>Fatto:</strong> ECC è preferito in ambienti con risorse limitate (IoT, mobile) per le chiavi compatte e le operazioni veloci.</div>',
        question: {
          text: 'Perché ECC usa chiavi più corte di RSA a parità di sicurezza?',
          opts: ['Usa algoritmi più semplici', 'Si basa su un problema matematico più difficile da risolvere', 'Non usa la matematica modulare', 'Le chiavi corte sono sempre più sicure'],
          correct: 1,
          explanation: 'Il logaritmo discreto su curve ellittiche è più difficile da risolvere, quindi bastano chiavi più corte per lo stesso livello di sicurezza.'
        }
      }
    ],
    faqs: [
      { q: 'RSA può essere usato per firme digitali?', a: 'Sì: si firma con la chiave privata e si verifica con la pubblica. È il principio opposto della cifratura.' },
      { q: 'Qual è la dimensione minima raccomandata per RSA?', a: 'NIST raccomanda almeno 2048 bit; 4096 bit per sicurezza a lungo termine.' },
      { q: 'Cos’è ECDSA?', a: 'Elliptic Curve Digital Signature Algorithm: schema di firma basato su ECC, usato in TLS, Bitcoin e passaporti elettronici.' }
    ]
  },
  {
    id: 'hash', label: 'Funzioni Hash', tag: 'SHA / MD5',
    suggestions: ['Cosa garantisce una funzione hash?', 'Perché MD5 non è sicuro?', 'Cos’è una collisione hash?'],
    steps: [
      {
        html: '<div class="lesson-bubble"><strong>Proprietà di una funzione hash crittografica</strong><br>1. <em>Deterministica</em>: stesso input, stesso output. 2. <em>One-way</em>: impossibile risalire all’input dall’output. 3. <em>Collision-resistant</em>: difficile trovare due input con lo stesso hash. 4. <em>Avalanche effect</em>: piccole variazioni nell’input cambiano completamente l’output.</div>',
        question: {
          text: 'Quale proprietà garantisce che non si possa risalire all’input a partire dall’hash?',
          opts: ['Collision resistance', 'One-way (preimage resistance)', 'Determinismo', 'Avalanche effect'],
          correct: 1,
          explanation: 'La preimage resistance (one-way) rende computazionalmente impossibile invertire la funzione hash.'
        }
      },
      {
        html: '<div class="lesson-bubble"><strong>SHA-2 e SHA-3</strong><br>SHA-256 produce un digest da 256 bit; è standard per certificati TLS e blockchain. SHA-3 usa una costruzione sponge completamente diversa da SHA-2 e offre maggiore resilienza a certi attacchi strutturali.</div>' +
              '<div class="lesson-bubble warning"><strong>Attenzione:</strong> MD5 e SHA-1 sono rotti: esistono collisioni pratiche note. Non usarli per scopi di sicurezza.</div>',
        question: {
          text: 'Quale funzione hash è considerata sicura oggi per certificati digitali?',
          opts: ['MD5', 'SHA-1', 'SHA-256', 'CRC32'],
          correct: 2,
          explanation: 'SHA-256 (famiglia SHA-2) è lo standard attuale; MD5 e SHA-1 sono vulnerabili a collisioni.'
        }
      },
      {
        html: '<div class="lesson-bubble"><strong>Applicazioni: MAC e HMAC</strong><br>Un MAC (Message Authentication Code) combina un hash con una chiave segreta per garantire integrità <em>e</em> autenticità. HMAC-SHA256 è la costruzione standard: HMAC(K, m) = H((K ⊕ opad) || H((K ⊕ ipad) || m)).</div>' +
              '<div class="lesson-bubble analogy"><strong>Analogia:</strong> l’hash è come un’impronta digitale del messaggio; il MAC è come un’impronta autenticata con un sigillo segreto.</div>',
        question: {
          text: 'Cosa aggiunge HMAC rispetto a un semplice hash?',
          opts: ['Cifratura del messaggio', 'Autenticazione tramite chiave segreta', 'Compressione dei dati', 'Firma digitale'],
          correct: 1,
          explanation: 'HMAC combina hash e chiave segreta: garantisce che solo chi conosce la chiave possa generare o verificare il MAC.'
        }
      }
    ],
    faqs: [
      { q: 'Hash e cifratura sono la stessa cosa?', a: 'No. La cifratura è reversibile con la chiave; l’hash è one-way e non è progettato per essere invertito.' },
      { q: 'Cos’è il birthday attack?', a: 'Sfrutta il paradosso del compleanno: trovare una collisione richiede ~2^(n/2) operazioni, non 2^n. Per SHA-256 questo è ancora computazionalmente impossibile.' },
      { q: 'Perché non usare solo hash per le password?', a: 'Gli hash veloci (MD5, SHA) sono vulnerabili ad attacchi a dizionario/rainbow table. Usare bcrypt, scrypt o Argon2, che sono lenti e salati per design.' }
    ]
  },
  {
    id: 'dh', label: 'Diffie-Hellman', tag: 'Scambio di chiavi',
    suggestions: ['Come funziona DH passo per passo?', 'Cos’è il logaritmo discreto?', 'DH è vulnerabile a MITM?'],
    steps: [
      {
        html: '<div class="lesson-bubble"><strong>Il problema dello scambio di chiavi</strong><br>Alice e Bob vogliono concordare una chiave segreta condivisa su un canale pubblico, senza che Eva (l’intercettatore) possa calcolarla pur vedendo tutti i messaggi scambiati.</div>' +
              '<div class="lesson-bubble analogy"><strong>Analogia dei colori:</strong> Alice e Bob partono da un colore pubblico, aggiungono ciascuno il proprio colore segreto, si scambiano le miscele. Il colore finale condiviso è impossibile da dedurre per chi vede solo le miscele.</div>',
        question: {
          text: 'Quale problema risolve il protocollo Diffie-Hellman?',
          opts: ['Cifrare messaggi lunghi', 'Concordare una chiave segreta su un canale pubblico', 'Autenticare l’identità delle parti', 'Comprimere i dati trasmessi'],
          correct: 1,
          explanation: 'DH permette a due parti di concordare un segreto condiviso su un canale non sicuro, senza trasmetterlo mai direttamente.'
        }
      },
      {
        html: '<div class="lesson-bubble"><strong>Il protocollo DH passo per passo</strong><br>1. Parametri pubblici: primo p, generatore g. 2. Alice sceglie segreto a, invia A = g^a mod p. 3. Bob sceglie segreto b, invia B = g^b mod p. 4. Alice calcola s = B^a mod p. 5. Bob calcola s = A^b mod p. Entrambi ottengono g^(ab) mod p.</div>' +
              '<div class="lesson-bubble fact"><strong>Fatto:</strong> la sicurezza si basa sulla difficoltà del <em>logaritmo discreto</em>: dato g^a mod p, calcolare a è computazionalmente intrattabile per p grande.</div>',
        question: {
          text: 'Su quale problema matematico si basa la sicurezza di DH?',
          opts: ['Fattorizzazione', 'Logaritmo discreto', 'Radice quadrata modulare', 'Problema dello zaino'],
          correct: 1,
          explanation: 'Il logaritmo discreto: dato g^a mod p è facile calcolarlo, ma ricavare a da g^a mod p è computazionalmente difficile.'
        }
      },
      {
        html: '<div class="lesson-bubble"><strong>Vulnerabilità: attacco Man-in-the-Middle</strong><br>DH da solo non autentica le parti: Eva può intercettare e sostituire i valori A e B, stabilendo chiavi separate con Alice e Bob senza che se ne accorgano.</div>' +
              '<div class="lesson-bubble warning"><strong>Soluzione:</strong> combinare DH con un meccanismo di autenticazione (certificati, firme digitali). TLS usa ECDHE + certificati X.509 per questo motivo.</div>',
        question: {
          text: 'Come si protegge DH dall’attacco Man-in-the-Middle?',
          opts: ['Usando chiavi più lunghe', 'Aggiungendo autenticazione con certificati o firme digitali', 'Ripetendo lo scambio più volte', 'Usando un primo p più grande'],
          correct: 1,
          explanation: 'L’autenticazione (es. certificati X.509 in TLS) garantisce che stai davvero comunicando con la parte corretta e non con un intermediario.'
        }
      }
    ],
    faqs: [
      { q: 'Cos’è ECDH?', a: 'Elliptic Curve Diffie-Hellman: variante di DH su curve ellittiche, con chiavi molto più corte e sicurezza equivalente. Usato in TLS 1.3.' },
      { q: 'Cos’è la Perfect Forward Secrecy?', a: 'Con DHE/ECDHE, ogni sessione usa chiavi DH temporanee: anche se la chiave privata a lungo termine viene compromessa, le sessioni passate rimangono protette.' },
      { q: 'Quali valori di p sono sicuri?', a: 'p deve essere un primo grande (almeno 2048 bit) e preferibilmente un safe prime (p = 2q+1 con q primo) per resistere ad attacchi come Pohlig-Hellman.' }
    ]
  },
  {
    id: 'aead', label: 'AEAD & TLS', tag: 'AES-GCM / ChaCha20',
    suggestions: ['Cosa garantisce AES-GCM?', 'Come funziona TLS 1.3?', 'Cos’è il tag di autenticazione?'],
    steps: [
      {
        html: '<div class="lesson-bubble"><strong>AEAD: Authenticated Encryption with Associated Data</strong><br>Combina <em>riservatezza</em> (cifratura) e <em>integrità/autenticità</em> (MAC) in un’unica primitiva. I dati associati (AAD) sono autenticati ma non cifrati (es. header di pacchetto).</div>' +
              '<div class="lesson-bubble analogy"><strong>Analogia:</strong> una busta con sigillo: il contenuto è segreto (cifratura) e il sigillo garantisce che non sia stata manomessa (autenticazione).</div>',
        question: {
          text: 'Cosa garantisce una primitiva AEAD rispetto alla sola cifratura?',
          opts: ['Solo riservatezza', 'Riservatezza + integrità + autenticità', 'Solo integrità', 'Compressione dei dati'],
          correct: 1,
          explanation: 'AEAD garantisce che i dati siano sia segreti (cifratura) che integri e autentici (tag di autenticazione).'
        }
      },
      {
        html: '<div class="lesson-bubble"><strong>AES-GCM e ChaCha20-Poly1305</strong><br>AES-GCM (Galois/Counter Mode): combina CTR per la cifratura e GHASH per il tag di autenticazione. ChaCha20-Poly1305: alternativa basata su stream cipher, più veloce su hardware senza AES-NI, usata in TLS 1.3 e WireGuard.</div>' +
              '<div class="lesson-bubble warning"><strong>Attenzione:</strong> riusare il nonce in AES-GCM con la stessa chiave è catastrofico: compromette sia riservatezza che integrità.</div>',
        question: {
          text: 'Cosa succede se si riusa lo stesso nonce in AES-GCM?',
          opts: ['Nessun problema pratico', 'Si compromettono riservatezza e integrità', 'Solo le performance peggiorano', 'Il messaggio viene cifrato due volte'],
          correct: 1,
          explanation: 'Il riuso del nonce in GCM permette di ricavare la chiave di autenticazione (H) e decifrare i messaggi precedenti.'
        }
      },
      {
        html: '<div class="lesson-bubble"><strong>TLS 1.3: handshake semplificato</strong><br>TLS 1.3 rimuove algoritmi deboli e riduce l’handshake a 1-RTT (o 0-RTT per sessioni riprese). Usa ECDHE per lo scambio di chiavi (PFS), AEAD per la cifratura dei dati, e certificati X.509 per l’autenticazione del server.</div>' +
              '<div class="lesson-bubble fact"><strong>Fatto:</strong> TLS 1.3 elimina RSA key exchange, CBC, RC4, SHA-1 e compressione TLS, riducendo drasticamente la superficie d’attacco.</div>',
        question: {
          text: 'Quale meccanismo garantisce la Perfect Forward Secrecy in TLS 1.3?',
          opts: ['RSA key exchange', 'Certificati X.509', 'ECDHE (Elliptic Curve Diffie-Hellman Ephemeral)', 'AES-GCM'],
          correct: 2,
          explanation: 'ECDHE genera chiavi temporanee per ogni sessione: anche compromettendo la chiave privata del server, le sessioni passate rimangono sicure.'
        }
      }
    ],
    faqs: [
      { q: 'Cos’è il tag di autenticazione in GCM?', a: 'Un valore di 128 bit calcolato su ciphertext e AAD tramite GHASH. Se il tag non corrisponde alla verifica, il messaggio viene scartato.' },
      { q: 'TLS 1.2 è ancora sicuro?', a: 'Con configurazione corretta (ECDHE, AEAD, SHA-2) sì, ma TLS 1.3 è preferibile per PFS garantita e handshake più veloce.' },
      { q: 'Cos’è lo 0-RTT in TLS 1.3?', a: 'Permette di inviare dati già nel primo messaggio riusando un ticket di sessione, ma è vulnerabile a replay attack: usare con cautela.' }
    ]
  }
];

window.CT_STATE = window.CT_STATE || { topicIdx: 0, stepIdx: 0, answered: {}, completed: {} };

function renderCoteach() {
  var topic = CT_TOPICS[CT_STATE.topicIdx];
  var step  = topic.steps[CT_STATE.stepIdx];
  var key   = topic.id + '_' + CT_STATE.stepIdx;

  document.getElementById('coteachList').innerHTML = CT_TOPICS.map(function(t, i) {
    var done = CT_STATE.completed[t.id] ? ' &#x2713;' : '';
    return '<button class="coteach-btn' + (i === CT_STATE.topicIdx ? ' active' : '') +
      '" data-ct="' + i + '"><span>' + t.label + done + '</span><span>&#x203A;</span></button>';
  }).join('');

  document.getElementById('ctProgressSummary').innerHTML = CT_TOPICS.map(function(t) {
    var done = CT_STATE.completed[t.id];
    return '<div style="display:flex;justify-content:space-between;font-size:var(--text-xs)">' +
      '<span>' + t.label + '</span>' +
      '<span class="badge ' + (done ? 'success' : '') + '">' + (done ? 'Completato' : 'In corso') + '</span>' +
      '</div>';
  }).join('');

  document.getElementById('ctTopicTitle').textContent = topic.label;
  document.getElementById('ctTopicTag').textContent   = topic.tag;

  var pct = Math.round((CT_STATE.stepIdx + 1) / topic.steps.length * 100);
  document.getElementById('ctProgressBar').style.width = pct + '%';
  document.getElementById('ctStepLabel').textContent =
    'Passo ' + (CT_STATE.stepIdx + 1) + ' / ' + topic.steps.length;

  var html = step.html;
  if (step.question) {
    var ans = CT_STATE.answered[key];
    html += '<div class="ct-question"><p style="font-size:var(--text-sm);font-weight:600;margin-bottom:.5rem">' +
      step.question.text + '</p>';
    step.question.opts.forEach(function(opt, oi) {
      var cls = 'ct-opt';
      if (ans !== undefined) {
        if (oi === step.question.correct) cls += ' ct-correct';
        else if (oi === ans)              cls += ' ct-wrong';
      }
      html += '<button class="' + cls + '" ' + (ans !== undefined ? 'disabled' : '') +
        ' data-ctopt="' + oi + '">' + opt + '</button>';
    });
    if (ans !== undefined) {
      html += '<div class="callout" style="margin-top:.5rem;font-size:var(--text-xs)">' +
        step.question.explanation + '</div>';
    }
    html += '</div>';
  }
  document.getElementById('ctLessonContent').innerHTML = html;

  document.getElementById('ctFaqList').innerHTML = topic.faqs.map(function(f) {
    return '<details class="faq-item"><summary>' + f.q + '</summary>' +
      '<div class="faq-answer">' + f.a + '</div></details>';
  }).join('');

  var aiLabel = document.getElementById('aiTopicLabel');
  if (aiLabel) aiLabel.textContent = topic.label;
  var aiSug = document.getElementById('aiSuggestions');
  if (aiSug && topic.suggestions) {
    aiSug.innerHTML = '<span class="label">Suggerimenti:</span>' +
      topic.suggestions.map(function(s) {
        return '<button class="ai-suggestion-btn" data-sug="' +
          s.replace(/"/g, '&quot;') + '">' + s + '</button>';
      }).join('');
  }

  if (typeof saveState === 'function') saveState();
}
