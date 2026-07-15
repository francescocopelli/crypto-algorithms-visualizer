// Crypto Algorithms Visualizer — app.js
// 9 algorithm families, 6 attack scenarios, 6 guided examples, 12 quiz questions
// Student / Teacher mode, dark/light theme toggle

const ALGORITHMS = [
  {
    id: 'aes', name: 'AES', tag: 'Block cipher',
    title: 'AES-128 round flow',
    summary: 'Follow the 4×4 state matrix through each transformation and watch confusion and diffusion emerge.',
    input: '00112233445566778899aabbccddeeff',
    key: '000102030405060708090a0b0c0d0e0f',
    bitWidth: '128', model: 'Single-round', goal: 'Diffusion',
    inputHelper: '32 hex chars — plaintext block.',
    keyHelper: '32 hex chars — round key.',
    steps: [
      { name: 'Initial state', purpose: 'Plaintext loaded into the state matrix.', value: ['00','11','22','33','44','55','66','77','88','99','aa','bb','cc','dd','ee','ff'], teacher: 'AES arranges bytes in a 4×4 state and transforms the state, not the raw string.' },
      { name: 'AddRoundKey', purpose: 'XOR state with the round key.', value: ['00','10','20','30','40','50','60','70','80','90','a0','b0','c0','d0','e0','f0'], teacher: 'Key mixing. XOR is self-inverse, so the same operation undoes itself during decryption.' },
      { name: 'SubBytes', purpose: 'Apply the nonlinear S-box to every byte.', value: ['63','ca','b7','04','09','53','d0','51','cd','60','e0','e7','ba','70','e1','8c'], teacher: 'Nonlinearity enters here. Without it AES would be an affine function, trivially breakable.' },
      { name: 'ShiftRows', purpose: 'Rotate each row to spread byte influence across columns.', value: ['63','ca','b7','04','53','d0','51','09','e0','e7','cd','60','8c','ba','70','e1'], teacher: 'ShiftRows only moves bytes; it does not change values. It prepares columns for MixColumns.' },
      { name: 'MixColumns', purpose: 'Combine bytes per column via GF(2⁸) arithmetic.', value: ['5f','72','64','15','57','f5','bc','92','f7','be','3b','29','1d','b9','f9','1a'], teacher: 'One byte change now affects an entire column — this is diffusion at work.' }
    ]
  },
  {
    id: 'des', name: 'DES', tag: 'Feistel cipher',
    title: 'DES Feistel round',
    summary: 'Trace how DES splits the block, expands half and mixes it with round subkeys.',
    input: '0123456789ABCDEF', key: '133457799BBCDFF1',
    bitWidth: '64', model: 'Round-focused', goal: 'Confusion',
    inputHelper: '16 hex chars — 64-bit block.',
    keyHelper: '16 hex chars — 56-bit effective key + parity bits.',
    steps: [
      { name: 'Initial permutation', purpose: 'Reorder bits before the rounds.', value: ['CC','00','CC','FF','F0','AA','F0','AA','0F','0F','0F','0F','55','55','55','55'], teacher: 'IP is a fixed permutation and contributes nothing to security.' },
      { name: 'Split halves', purpose: 'Divide into L0 and R0 (32 bits each).', value: ['L0','CC00CCFF','R0','F0AAF0AA','→','Feistel'], teacher: 'Feistel structure lets DES decrypt by reversing the subkey order.' },
      { name: 'Expansion E', purpose: 'Expand R0 from 32 to 48 bits for S-box input.', value: ['E(R0)','48 bits','XOR K1','subkey'], teacher: 'Expansion duplicates edge bits, enabling differential patterns at S-box input.' },
      { name: 'Round output', purpose: 'L1 = R0; R1 = L0 ⊕ F(R0, K1).', value: ['L1','R0','R1','L0⊕F','swap','yes'], teacher: 'The round function is nonlinear because of S-boxes, not permutations.' }
    ]
  },
  {
    id: 'rsa', name: 'RSA', tag: 'Public key',
    title: 'RSA pipeline',
    summary: 'Key generation, encryption and decryption with small exam-friendly numbers.',
    input: 'm = 42', key: 'p=61, q=53, e=17',
    bitWidth: 'n=3233', model: 'Toy arithmetic', goal: 'Trapdoor one-wayness',
    inputHelper: 'Message integer smaller than n.',
    keyHelper: 'Small primes and public exponent.',
    steps: [
      { name: 'Choose primes', purpose: 'Compute n and φ(n).', value: ['p','61','q','53','n','3233','φ(n)','3120'], teacher: 'Security depends on factoring n; the algorithm itself is fully public.' },
      { name: 'Public exponent', purpose: 'Select e coprime with φ(n).', value: ['e','17','gcd(e,φ)','1','valid','yes'], teacher: 'gcd(e, φ(n)) = 1 guarantees a modular inverse exists.' },
      { name: 'Private exponent', purpose: 'Compute d: ed ≡ 1 mod φ(n).', value: ['d','2753','check','17·2753 mod 3120 = 1'], teacher: 'Extended Euclidean algorithm is the exam-expected method here.' },
      { name: 'Encrypt', purpose: 'c = mᵉ mod n.', value: ['m','42','c','2557'], teacher: 'Modular exponentiation is efficient via square-and-multiply.' },
      { name: 'Decrypt', purpose: 'm = cᵈ mod n.', value: ['c','2557','m','42'], teacher: "Decryption works because d inverts e mod φ(n) — Euler's theorem." }
    ]
  },
  {
    id: 'dh', name: 'Diffie-Hellman', tag: 'Key exchange',
    title: 'DH key exchange',
    summary: 'Two parties derive the same shared secret without transmitting it.',
    input: 'p=23, g=5, a=6', key: 'b=15',
    bitWidth: 'mod 23', model: 'Small prime group', goal: 'Shared secret',
    inputHelper: 'Prime modulus, generator and Alice secret.',
    keyHelper: 'Bob secret exponent.',
    steps: [
      { name: 'Public parameters', purpose: 'Agree on p and g.', value: ['p','23','g','5'], teacher: 'These are fully public; secrecy comes from the private exponents.' },
      { name: 'Alice sends A', purpose: 'A = gᵃ mod p.', value: ['a','6','A','8'], teacher: '5⁶ mod 23 = 8. Alice publishes A.' },
      { name: 'Bob sends B', purpose: 'B = gᵇ mod p.', value: ['b','15','B','19'], teacher: '5¹⁵ mod 23 = 19. Bob publishes B.' },
      { name: 'Shared secret', purpose: 'Alice: Bᵃ mod p = 2; Bob: Aᵇ mod p = 2.', value: ['K_A','2','K_B','2'], teacher: 'Commutativity of exponents gives the same result on both sides.' }
    ]
  },
  {
    id: 'elgamal', name: 'ElGamal', tag: 'Public key',
    title: 'ElGamal encryption',
    summary: 'Ephemeral randomness and the danger of reusing k.',
    input: 'p=23, g=5, m=13', key: 'x=6, k=10',
    bitWidth: 'mod 23', model: 'Toy arithmetic', goal: 'Randomized encryption',
    inputHelper: 'Prime, generator and message.',
    keyHelper: 'Private key x and ephemeral k.',
    steps: [
      { name: 'Public key', purpose: 'y = gˣ mod p.', value: ['x','6','y','8'], teacher: 'ElGamal public key is y = gˣ mod p.' },
      { name: 'Ephemeral k', purpose: 'Choose fresh random k per ciphertext.', value: ['k','10','r = gᵏ','9'], teacher: 'If k repeats, two ciphertexts become algebraically linked and the private key leaks.' },
      { name: 'Ciphertext c2', purpose: 'c2 = m · yᵏ mod p.', value: ['yᵏ','3','c2','4'], teacher: 'The message is masked with the shared secret yᵏ.' },
      { name: 'Decrypt', purpose: 'm = c2 · (rˣ)⁻¹ mod p.', value: ['rˣ','3','m','13'], teacher: 'The receiver divides by the shared secret to unmask the message.' }
    ]
  },
  {
    id: 'hash', name: 'Hash functions', tag: 'Digest',
    title: 'Avalanche effect',
    summary: 'A single bit change should flip roughly half the output bits.',
    input: 'cryptography', key: 'cryptographz',
    bitWidth: '256', model: 'Comparison', goal: 'Avalanche',
    inputHelper: 'First input message.',
    keyHelper: 'Second message differing by one character.',
    steps: [
      { name: 'Input pair', purpose: 'Two messages differing by one character.', value: ['m1','cryptography','m2','cryptographz'], teacher: 'A single character change is enough to test avalanche.' },
      { name: 'Digest 1', purpose: 'H(m1).', value: ['H(m1)','5c4d...a12f'], teacher: 'Use truncated digests in class for readability.' },
      { name: 'Digest 2', purpose: 'H(m2).', value: ['H(m2)','91b8...7dd0'], teacher: 'Tiny input changes should destroy visible structure in the output.' },
      { name: 'Comparison', purpose: 'Count flipped bits.', value: ['flipped','≈128/256'], teacher: 'A secure hash should flip ≈50% of output bits on average.' }
    ]
  },
  {
    id: 'mac', name: 'MAC / HMAC / CMAC', tag: 'Authentication',
    title: 'Keyed integrity',
    summary: 'Contrast plain hashing with keyed integrity checks.',
    input: 'pay Bob 10', key: 'lecture-key',
    bitWidth: '128+', model: 'Concept flow', goal: 'Integrity',
    inputHelper: 'Message to authenticate.',
    keyHelper: 'Shared secret key.',
    steps: [
      { name: 'Plain hash', purpose: 'Hashing alone does not authenticate the sender.', value: ['H(m)','public'], teacher: 'Anyone can compute H(m); authenticity is absent.' },
      { name: 'Add secret key', purpose: 'Bind K to the message.', value: ['K','lecture-key','m','pay Bob 10'], teacher: 'Adding a key changes the threat model completely.' },
      { name: 'Tag generation', purpose: 'tag = MAC(K, m).', value: ['tag','8f31...'], teacher: 'Only holders of K can generate a valid tag.' },
      { name: 'Verification', purpose: 'Accept only if tags match.', value: ['tamper?','detected'], teacher: 'MACs provide integrity and, under shared-key assumptions, authenticate the sender.' }
    ]
  },
  {
    id: 'ae', name: 'Authenticated Enc.', tag: 'AEAD',
    title: 'Authenticated encryption',
    summary: 'Confidentiality and integrity in one construction, plus the role of nonces and tags.',
    input: 'nonce=7c3f, exam notes', key: 'session-key',
    bitWidth: '96/128/256', model: 'AEAD flow', goal: 'Conf + integrity',
    inputHelper: 'Nonce and plaintext.',
    keyHelper: 'Session key.',
    steps: [
      { name: 'Nonce', purpose: 'Choose a unique nonce for this encryption.', value: ['nonce','7c3f','reuse?','never'], teacher: 'Nonce reuse can catastrophically break many AE modes.' },
      { name: 'Encrypt', purpose: 'Produce ciphertext from plaintext and key.', value: ['ciphertext','c1 82 0a...'], teacher: 'The ciphertext alone says nothing about tampering.' },
      { name: 'Tag', purpose: 'Generate authentication tag over ciphertext (+ optional AAD).', value: ['tag','6e 4a...'], teacher: 'The tag covers ciphertext and optionally associated data.' },
      { name: 'Verify first', purpose: 'Reject modified inputs before releasing plaintext.', value: ['modified?','reject'], teacher: 'Never decrypt first and verify later — that enables oracle attacks.' }
    ]
  },
  {
    id: 'ecc', name: 'ECC / ECDH', tag: 'Elliptic curve',
    title: 'ECDH key exchange',
    summary: 'Scalar multiplication replaces modular exponentiation in the DH analogy.',
    input: 'G = base point, a=7', key: 'b=11',
    bitWidth: 'curve group', model: 'Point arithmetic', goal: 'Compact security',
    inputHelper: 'Base point and Alice scalar.',
    keyHelper: 'Bob scalar.',
    steps: [
      { name: 'Base point', purpose: 'Agree on curve and generator G.', value: ['G','public base point'], teacher: 'Curve and generator are public domain parameters.' },
      { name: 'Alice public key', purpose: 'A = aG.', value: ['a','7','A','7G'], teacher: 'Scalar multiplication replaces classical exponentiation.' },
      { name: 'Bob public key', purpose: 'B = bG.', value: ['b','11','B','11G'], teacher: 'Each public key is a point on the curve.' },
      { name: 'Shared secret', purpose: 'aB = bA = abG.', value: ['S','77G'], teacher: 'Both sides meet at the same point — scalar multiplication distributes cleanly.' }
    ]
  }
];

const ATTACKS = [
  {
    id: 'ecb', name: 'ECB leakage', type: 'Chosen-plaintext', target: 'ECB',
    title: 'ECB pattern leakage', risk: 84,
    summary: 'Equal plaintext blocks → equal ciphertext blocks; file structure survives encryption.',
    experiment: 'Encrypt a bitmap with repeated 16-byte blocks under ECB. Large uniform regions map to repeated ciphertext blocks and the image outline remains visible.',
    why: 'ECB lacks semantic security: it deterministically maps each equal block to the same ciphertext, preserving visible structure.',
    fix: 'Use randomized or nonce-based modes (CBC + MAC, or preferably GCM / ChaCha20-Poly1305).',
    observations: ['Repeated input block → repeated ciphertext block', 'No diffusion across block boundaries', 'Image or file structure remains recognizable after encryption']
  },
  {
    id: 'des-brute', name: 'DES brute force', type: 'Exhaustive search', target: 'DES',
    title: '56-bit key exhaustive search', risk: 91,
    summary: 'DES has a 56-bit effective key — far too small against modern hardware.',
    experiment: 'Estimate the effort for 2⁵⁶ key candidates and compare against dedicated FPGA arrays or distributed search systems.',
    why: 'Security margins decay with hardware growth; what cost millions in 1977 is now trivially achievable.',
    fix: 'Use modern ciphers with at least 128-bit keys, e.g. AES-128 or AES-256.',
    observations: ['2⁵⁶ ≈ 7.2 × 10¹⁶ keys — broken in hours with specialized hardware', '56-bit keys are no longer future-proof', 'Legacy protocol support is not a security argument']
  },
  {
    id: 'cbc-flip', name: 'CBC bit flipping', type: 'Ciphertext manipulation', target: 'CBC',
    title: 'CBC malleability without MAC', risk: 79,
    summary: 'Without integrity protection, attackers flip targeted plaintext bits by modifying ciphertext.',
    experiment: 'Flip a chosen bit in ciphertext block Cᵢ and inspect how plaintext block Pᵢ₊₁ changes after decryption.',
    why: 'CBC decryption XORs the previous ciphertext block into the next plaintext block, enabling controlled corruption.',
    fix: 'Authenticate ciphertexts with a MAC (Encrypt-then-MAC) or use AEAD.',
    observations: ['Controlled bit flips in the following decrypted block', 'Tampering survives if no integrity check exists', 'Padding oracles can amplify the attack further']
  },
  {
    id: 'textbook-rsa', name: 'Textbook RSA', type: 'Structural weakness', target: 'RSA',
    title: 'Deterministic textbook RSA', risk: 88,
    summary: 'Raw RSA is deterministic: repeated messages produce identical ciphertexts; algebraic attacks become feasible.',
    experiment: 'Encrypt the same message twice with the same public key using textbook RSA and compare the identical outputs.',
    why: 'Without randomized padding (e.g. OAEP), RSA preserves too much structure and is not semantically secure.',
    fix: 'Always use randomized padding schemes such as OAEP. Never deploy textbook RSA directly.',
    observations: ['Same message → same ciphertext every time', 'No chosen-ciphertext attack resilience', 'Padding is part of the cryptosystem, not an optional wrapper']
  },
  {
    id: 'nonce-reuse', name: 'Nonce reuse (AEAD)', type: 'Operational failure', target: 'AEAD',
    title: 'Nonce reuse catastrophe', risk: 95,
    summary: 'Reusing a nonce with the same key in stream-like AE can reveal relations between plaintexts and destroy authenticity.',
    experiment: 'Encrypt two messages with the same nonce and key. XOR the ciphertexts to recover the XOR of the plaintexts directly.',
    why: 'Many AEAD constructions derive the same keystream on nonce+key repetition, so the masks cancel under XOR.',
    fix: 'Guarantee nonce uniqueness per key, or use misuse-resistant AEAD designs (e.g. AES-SIV).',
    observations: ['C₁ ⊕ C₂ = P₁ ⊕ P₂ — plaintext structure leaks directly', 'Operational mistakes can defeat strong primitives', 'Nonce management is a system-level engineering responsibility']
  },
  {
    id: 'reused-k', name: 'Reused ephemeral k', type: 'Ephemeral key failure', target: 'ElGamal / DSA',
    title: 'Reused k exposes private key', risk: 93,
    summary: 'Two signatures or ciphertexts with the same k expose private-key information through simple algebra.',
    experiment: 'Write the two equations produced with the same k and solve the linear system for the private key modularly.',
    why: 'Randomness is embedded in the private computation; reusing it reduces hidden unknowns and makes the system solvable.',
    fix: 'Use high-quality randomness or RFC 6979 deterministic nonce generation for signatures.',
    observations: ['One repeated k can directly reveal the private key', 'Implementation mistakes defeat mathematically sound schemes', 'Randomness quality is a core security requirement']
  }
];

const EXAMPLES = [
  {
    id: 'rsa-toy', topic: 'RSA', title: 'RSA toy example',
    summary: 'Small modulus makes the arithmetic fully inspectable while preserving all structural properties.',
    steps: [
      'Choose p=61 and q=53 → n = 3233, φ(n) = (61-1)(53-1) = 3120.',
      'Pick e=17 with gcd(17, 3120) = 1.',
      'Compute d=2753 so that 17 · 2753 ≡ 1 mod 3120.',
      'Encrypt m=42: c = 42¹⁷ mod 3233 = 2557.',
      'Decrypt: 2557²⁷⁵³ mod 3233 = 42. ✓'
    ],
    takeaway: 'Good exam answers connect the arithmetic to the trapdoor: encryption uses the public exponent; decryption relies on the modular inverse tied to φ(n).',
    mistake: 'Students often confuse n with φ(n) when computing d.'
  },
  {
    id: 'dh-small', topic: 'Diffie-Hellman', title: 'Small-prime DH exchange',
    summary: 'A tiny group is insecure in practice but ideal for rehearsing shared-secret derivation by hand.',
    steps: [
      'Public parameters: p=23, g=5.',
      'Alice picks a=6, publishes A = 5⁶ mod 23 = 8.',
      'Bob picks b=15, publishes B = 5¹⁵ mod 23 = 19.',
      'Alice: 19⁶ mod 23 = 2.   Bob: 8¹⁵ mod 23 = 2.   Same secret ✓'
    ],
    takeaway: 'The secret is never transmitted; only exponentiated public values travel over the channel.',
    mistake: 'Students sometimes multiply A and B instead of exponentiating with their own private exponent.'
  },
  {
    id: 'aes-round', topic: 'AES', title: 'AES round intuition',
    summary: 'Isolating one round lets students focus on each transformation in turn.',
    steps: [
      'Load plaintext bytes into the 4×4 AES state matrix.',
      'XOR the round key byte-by-byte in AddRoundKey.',
      'Apply the S-box to each byte in SubBytes (nonlinearity).',
      'Rotate rows in ShiftRows (positional mixing).',
      'Mix each column via GF(2⁸) in MixColumns (diffusion).'
    ],
    takeaway: 'Separate nonlinearity from diffusion: SubBytes creates confusion; MixColumns amplifies diffusion.',
    mistake: 'ShiftRows changes positions, not values — a very common exam error.'
  },
  {
    id: 'mac-compare', topic: 'MAC', title: 'Hash vs HMAC',
    summary: 'Placing plain hashing next to HMAC makes the authentication gap impossible to miss.',
    steps: [
      'Compute H(m) for a public message — anyone can reproduce this.',
      'Note: no key, no authenticity. Anyone can forge a "matching" digest.',
      'Introduce secret K and compute HMAC(K, m) = H(K ⊕ opad ∥ H(K ⊕ ipad ∥ m)).',
      'Only holders of K can generate or verify a valid tag.'
    ],
    takeaway: 'A hash gives fingerprinting; a MAC gives keyed integrity.',
    mistake: 'Writing "hashing provides authentication" without mentioning the secret key.'
  },
  {
    id: 'ecb-demo', topic: 'Attack', title: 'ECB image thought experiment',
    summary: 'A powerful exam-ready reasoning pattern — no implementation required.',
    steps: [
      'Split a structured image into repeated 16-byte plaintext blocks.',
      'Encrypt each block independently under ECB mode.',
      'Identical input blocks produce identical output blocks.',
      'The encrypted image still reveals the original outline — confidentiality fails.'
    ],
    takeaway: 'Confidentiality must hide patterns, not just individual values.',
    mistake: 'Claiming ECB is secure because the underlying block cipher (AES, DES) is strong.'
  },
  {
    id: 'ecc-shared', topic: 'ECC', title: 'ECDH conceptual flow',
    summary: 'Symbolic points teach the exchange clearly before introducing heavy curve arithmetic.',
    steps: [
      'Agree on curve parameters and base point G.',
      'Alice publishes A = aG; Bob publishes B = bG.',
      'Alice computes aB = a(bG); Bob computes bA = b(aG).',
      'Both obtain abG — the shared secret point. ✓'
    ],
    takeaway: 'ECC preserves the Diffie-Hellman logic with shorter keys for comparable security.',
    mistake: 'Thinking the public-key points A or B are themselves the shared secret.'
  }
];

const QUIZ = [
  { category: 'Integrity', q: 'Which property prevents an attacker from modifying ciphertext without detection?', opts: ['Confidentiality','Integrity','Availability','Compression'], correct: 1, ex: 'Integrity mechanisms (MACs, AEAD tags) detect unauthorised modification.' },
  { category: 'Modes', q: 'Why is ECB considered insecure for structured data?', opts: ['It is too slow','It leaks repeated patterns','It requires a nonce','It cannot decrypt'], correct: 1, ex: 'ECB maps equal plaintext blocks to equal ciphertext blocks, preserving visible structure.' },
  { category: 'RSA', q: 'What is the role of φ(n) in textbook RSA key generation?', opts: ['It is the ciphertext space','It is used to compute the private exponent','It replaces the modulus','It stores the message'], correct: 1, ex: 'The private exponent d is chosen so that ed ≡ 1 mod φ(n).' },
  { category: 'DH', q: 'In Diffie-Hellman, what must remain secret?', opts: ['The prime modulus p','The generator g','The private exponents','The public values A and B'], correct: 2, ex: 'Shared secret depends on private exponents; p, g and public values can all be known.' },
  { category: 'DES', q: 'What gives DES its nonlinearity?', opts: ['Initial permutation','Final permutation','S-boxes','Key length'], correct: 2, ex: 'Permutations only reorder bits; S-boxes provide the nonlinear behaviour.' },
  { category: 'Hashes', q: 'A secure hash should exhibit which effect when one input bit changes?', opts: ['Compression loss','Avalanche effect','Key reuse','Deterministic secrecy'], correct: 1, ex: 'A tiny input change should flip ≈half the output bits on average.' },
  { category: 'AEAD', q: 'What is the safest order when processing authenticated encryption output?', opts: ['Decrypt first, verify later','Verify tag before releasing plaintext','Ignore tag for speed','Reuse the nonce'], correct: 1, ex: 'Verify authenticity before acting on plaintext; otherwise padding/oracle attacks become possible.' },
  { category: 'MAC', q: 'Why is HMAC stronger than a plain hash for authentication?', opts: ['It is shorter','It uses a secret key','It is reversible','It avoids modular arithmetic'], correct: 1, ex: 'The secret key prevents attackers from forging valid tags.' },
  { category: 'ElGamal', q: 'What is the danger of reusing the same ephemeral value k?', opts: ['The ciphertext gets shorter','It can leak the private key','It speeds up decryption','It disables hashing'], correct: 1, ex: 'Reusing ephemeral randomness creates solvable equations that expose secret information.' },
  { category: 'ECC', q: 'Why is ECC attractive compared with classical finite-field DH?', opts: ['It avoids public keys','Comparable security with smaller keys','It is symmetric','It never needs randomness'], correct: 1, ex: 'ECC achieves equivalent security with much shorter keys.' },
  { category: 'Modes', q: 'What does CBC mode fail to provide on its own?', opts: ['Block encryption','Confidentiality','Integrity','Determinism'], correct: 2, ex: 'CBC hides content but does not prevent malleability or detect tampering.' },
  { category: 'Teaching', q: 'Which explanation best distinguishes hashing from encryption for students?', opts: ['Both use keys','Hashing is one-way; encryption is designed to be reversed with the right key','Encryption always shortens data','Hashing guarantees secrecy'], correct: 1, ex: 'Reversibility is the key pedagogical distinction.' }
];

const TEACHER = [
  { title: 'DES', summary: 'Present DES as historically important but no longer secure due to its 56-bit effective key.', analogy: 'A classic lock mechanism that is instructive to study, but whose key space is far too small for modern attackers.', warning: 'Students often think every permutation contributes equally to security; emphasise the central role of S-boxes.' },
  { title: 'AES', summary: 'Explain AES as a substitution-permutation network built from repeatable round transformations.', analogy: 'Repeatedly repainting bytes, moving them around the room, then blending each column with the neighbours.', warning: 'Do not let students conflate educational one-round visualizations with the full multi-round standard.' },
  { title: 'RSA', summary: 'Teach RSA as modular arithmetic plus a trapdoor created by factoring hardness.', analogy: 'The public key is like a mailbox slot anyone can post into; only the owner knows how to open the box.', warning: 'Raw textbook RSA is insufficient in practice; randomized padding (OAEP) is essential.' },
  { title: 'Diffie-Hellman', summary: 'The insight is agreement on a shared secret without ever transmitting it.', analogy: 'Each party adds a private twist to the same public object; the twists combine consistently on both sides.', warning: 'A shared secret alone does not authenticate the peer — MITM attacks still apply without authentication.' },
  { title: 'Hashes and MACs', summary: 'Separate fingerprinting from authentication clearly in every lesson.', analogy: 'A hash is a public checksum; a MAC is a sealed stamp that only key-holders can produce.', warning: 'Students frequently overclaim what a bare hash can provide.' },
  { title: 'AEAD', summary: 'Use AEAD to show that confidentiality and integrity should be designed together, not bolted on.', analogy: 'Not just a locked box — a locked and tamper-evident box where breaking the seal is immediately obvious.', warning: 'Nonce reuse must be framed as a system-level engineering failure, not a minor detail.' }
];

// ── State ────────────────────────────────────────────────────────────────────
const S = {
  currentAlgo: 0,
  currentStep: 0,
  currentAttack: 0,
  currentExample: 0,
  mode: 'student',
  quizIndex: 0,
  quizAnswers: Array(QUIZ.length).fill(null)
};

// ── Render helpers ───────────────────────────────────────────────────────────
function renderLists() {
  document.getElementById('algoList').innerHTML = ALGORITHMS.map((a, i) =>
    `<button class="algo-btn ${i === S.currentAlgo ? 'active' : ''}" data-ai="${i}"><span>${a.name}</span><span>›</span></button>`
  ).join('');
  document.getElementById('attackList').innerHTML = ATTACKS.map((a, i) =>
    `<button class="attack-btn ${i === S.currentAttack ? 'active' : ''}" data-at="${i}"><span>${a.name}</span><span>›</span></button>`
  ).join('');
  document.getElementById('exampleList').innerHTML = EXAMPLES.map((a, i) =>
    `<button class="example-btn ${i === S.currentExample ? 'active' : ''}" data-ex="${i}"><span>${a.title}</span><span>›</span></button>`
  ).join('');
  document.getElementById('teacherGrid').innerHTML = TEACHER.map(t =>
    `<article class="teacher-panel">
      <h4>${t.title}</h4>
      <p style="color:var(--color-text-muted);font-size:var(--text-sm)">${t.summary}</p>
      <div class="callout" style="margin-top:.75rem;font-size:var(--text-sm)"><strong>Analogy:</strong> ${t.analogy}</div>
      <div class="card" style="margin-top:.75rem"><h4>Exam warning</h4><p style="font-size:var(--text-sm)">${t.warning}</p></div>
    </article>`
  ).join('');
}

function renderAlgo() {
  const al = ALGORITHMS[S.currentAlgo];
  const st = al.steps[S.currentStep];
  document.getElementById('algoTitle').textContent = al.title;
  document.getElementById('algoSummary').textContent = al.summary;
  document.getElementById('algoTag').textContent = al.tag;
  document.getElementById('algoInput').value = al.input;
  document.getElementById('algoKey').value = al.key;
  document.getElementById('inputHelper').textContent = al.inputHelper;
  document.getElementById('keyHelper').textContent = al.keyHelper;
  document.getElementById('currentStepIdx').textContent = `${S.currentStep + 1}/${al.steps.length}`;
  document.getElementById('securityGoal').textContent = al.goal;
  document.getElementById('bitWidth').textContent = al.bitWidth;
  document.getElementById('algoModel').textContent = al.model;
  document.getElementById('teacherCallout').innerHTML =
    `<strong>${S.mode === 'teacher' ? 'Teacher note' : 'Student hint'}:</strong> ${S.mode === 'teacher' ? st.teacher : st.purpose}`;
  document.getElementById('timeline').innerHTML = al.steps.map((s, i) =>
    `<div class="step ${i === S.currentStep ? 'current' : ''}">
      <div class="step-top"><strong>${i + 1}. ${s.name}</strong>
      <span class="badge ${i === S.currentStep ? 'primary' : 'success'}">${i === S.currentStep ? 'Current' : 'Ready'}</span></div>
      <p style="font-size:var(--text-sm)">${s.purpose}</p>
    </div>`
  ).join('');
  const v = st.value;
  document.getElementById('matrixView').innerHTML = v.map((c, i) =>
    `<div class="cell ${i < 4 ? 'highlight' : ''}">${c}</div>`
  ).join('');
}

function renderAttack() {
  const a = ATTACKS[S.currentAttack];
  document.getElementById('attackType').textContent = a.type;
  document.getElementById('attackTarget').textContent = a.target;
  document.getElementById('attackTitle').textContent = a.title;
  document.getElementById('attackSummary').textContent = a.summary;
  document.getElementById('attackExperiment').textContent = a.experiment;
  document.getElementById('attackWhy').textContent = a.why;
  document.getElementById('attackFix').textContent = a.fix;
  document.getElementById('riskBar').style.width = `${a.risk}%`;
  document.getElementById('attackObservations').innerHTML = a.observations.map((o, i) =>
    `<div class="step ${i === 0 ? 'current' : ''}"><strong>Observation ${i + 1}</strong><p style="font-size:var(--text-sm)">${o}</p></div>`
  ).join('');
}

function renderExample() {
  const e = EXAMPLES[S.currentExample];
  document.getElementById('exampleTopic').textContent = e.topic;
  document.getElementById('exampleTitle').textContent = e.title;
  document.getElementById('exampleSummary').textContent = e.summary;
  document.getElementById('exampleSteps').innerHTML = e.steps.map((s, i) =>
    `<div class="step ${i === 0 ? 'current' : ''}"><strong>Step ${i + 1}</strong><p style="font-size:var(--text-sm)">${s}</p></div>`
  ).join('');
  document.getElementById('exampleTakeaway').innerHTML = `<strong>Takeaway:</strong> ${e.takeaway}`;
  document.getElementById('exampleMistake').textContent = e.mistake;
}

function renderQuiz() {
  const q = QUIZ[S.quizIndex];
  const ans = S.quizAnswers[S.quizIndex];
  document.getElementById('quizQuestionTitle').textContent = `Question ${S.quizIndex + 1}`;
  document.getElementById('quizQuestionText').textContent = q.q;
  document.getElementById('quizCategory').textContent = q.category;
  document.getElementById('quizProgress').style.width = `${((S.quizIndex + 1) / QUIZ.length) * 100}%`;
  document.getElementById('quizOptions').innerHTML = q.opts.map((o, i) => {
    let cls = 'quiz-option';
    if (ans !== null) {
      if (i === q.correct) cls += ' correct';
      else if (i === ans) cls += ' wrong';
    }
    return `<button class="${cls}" data-opt="${i}">${String.fromCharCode(65 + i)}. ${o}</button>`;
  }).join('');
  const answered = S.quizAnswers.filter(v => v !== null).length;
  const correct = S.quizAnswers.reduce((acc, v, i) => acc + (v === QUIZ[i].correct ? 1 : 0), 0);
  document.getElementById('quizAnswered').textContent = answered;
  document.getElementById('quizCorrect').textContent = correct;
  document.getElementById('quizAccuracy').textContent = answered ? `${Math.round(correct / answered * 100)}%` : '0%';
  document.getElementById('quizExplanation').innerHTML = ans === null
    ? 'Select an answer to reveal the explanation.'
    : `<strong>${ans === q.correct ? 'Correct ✓' : 'Review ✗'}</strong> ${q.ex}`;
}

// ── Event delegation ─────────────────────────────────────────────────────────
document.addEventListener('click', e => {
  const ai = e.target.closest('[data-ai]');
  if (ai) { S.currentAlgo = +ai.dataset.ai; S.currentStep = 0; renderLists(); renderAlgo(); }

  const at = e.target.closest('[data-at]');
  if (at) { S.currentAttack = +at.dataset.at; renderLists(); renderAttack(); }

  const ex = e.target.closest('[data-ex]');
  if (ex) { S.currentExample = +ex.dataset.ex; renderLists(); renderExample(); }

  const op = e.target.closest('[data-opt]');
  if (op) { S.quizAnswers[S.quizIndex] = +op.dataset.opt; renderQuiz(); }

  const na = e.target.closest('.nav a');
  if (na) { document.querySelectorAll('.nav a').forEach(a => a.classList.remove('active')); na.classList.add('active'); }
});

document.getElementById('nextStepBtn').addEventListener('click', () => {
  S.currentStep = Math.min(S.currentStep + 1, ALGORITHMS[S.currentAlgo].steps.length - 1);
  renderAlgo();
});
document.getElementById('prevStepBtn').addEventListener('click', () => {
  S.currentStep = Math.max(S.currentStep - 1, 0);
  renderAlgo();
});
document.getElementById('resetStepBtn').addEventListener('click', () => {
  S.currentStep = 0;
  renderAlgo();
});
document.getElementById('nextQuizBtn').addEventListener('click', () => {
  S.quizIndex = Math.min(S.quizIndex + 1, QUIZ.length - 1);
  renderQuiz();
});
document.getElementById('prevQuizBtn').addEventListener('click', () => {
  S.quizIndex = Math.max(S.quizIndex - 1, 0);
  renderQuiz();
});
document.getElementById('restartQuizBtn').addEventListener('click', () => {
  S.quizIndex = 0;
  S.quizAnswers = Array(QUIZ.length).fill(null);
  renderQuiz();
});
document.getElementById('modeStudent').addEventListener('click', () => { S.mode = 'student'; renderAlgo(); });
document.getElementById('modeTeacher').addEventListener('click', () => { S.mode = 'teacher'; renderAlgo(); });

// ── Theme toggle ─────────────────────────────────────────────────────────────
let theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
document.documentElement.setAttribute('data-theme', theme);
document.getElementById('themeBtn').addEventListener('click', () => {
  theme = theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', theme);
});

// ── Boot ─────────────────────────────────────────────────────────────────────
renderLists();
renderAlgo();
renderAttack();
renderExample();
renderQuiz();
