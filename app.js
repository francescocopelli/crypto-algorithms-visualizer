// Crypto Algorithms Visualizer — app.js
// 9 algorithm families, 6 attack scenarios, 6 guided examples, 12+ quiz questions
// Student / Teacher / Exercise mode, dark/light theme toggle

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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
  { id: 'ecb', name: 'ECB leakage', type: 'Chosen-plaintext', target: 'ECB', title: 'ECB pattern leakage', risk: 84, summary: 'Equal plaintext blocks → equal ciphertext blocks; file structure survives encryption.', experiment: 'Encrypt a bitmap with repeated 16-byte blocks under ECB. Large uniform regions map to repeated ciphertext blocks and the image outline remains visible.', why: 'ECB lacks semantic security: it deterministically maps each equal block to the same ciphertext, preserving visible structure.', fix: 'Use randomized or nonce-based modes (CBC + MAC, or preferably GCM / ChaCha20-Poly1305).', observations: ['Repeated input block → repeated ciphertext block', 'No diffusion across block boundaries', 'Image or file structure remains recognizable after encryption'] },
  { id: 'des-brute', name: 'DES brute force', type: 'Exhaustive search', target: 'DES', title: '56-bit key exhaustive search', risk: 91, summary: 'DES has a 56-bit effective key — far too small against modern hardware.', experiment: 'Estimate the effort for 2⁵⁶ key candidates and compare against dedicated FPGA arrays or distributed search systems.', why: 'Security margins decay with hardware growth; what cost millions in 1977 is now trivially achievable.', fix: 'Use modern ciphers with at least 128-bit keys, e.g. AES-128 or AES-256.', observations: ['2⁵⁶ ≈ 7.2 × 10¹⁶ keys — broken in hours with specialized hardware', '56-bit keys are no longer future-proof', 'Legacy protocol support is not a security argument'] },
  { id: 'cbc-flip', name: 'CBC bit flipping', type: 'Ciphertext manipulation', target: 'CBC', title: 'CBC malleability without MAC', risk: 79, summary: 'Without integrity protection, attackers flip targeted plaintext bits by modifying ciphertext.', experiment: 'Flip a chosen bit in ciphertext block Cᵢ and inspect how plaintext block Pᵢ₊₁ changes after decryption.', why: 'CBC decryption XORs the previous ciphertext block into the next plaintext block, enabling controlled corruption.', fix: 'Authenticate ciphertexts with a MAC (Encrypt-then-MAC) or use AEAD.', observations: ['Controlled bit flips in the following decrypted block', 'Tampering survives if no integrity check exists', 'Padding oracles can amplify the attack further'] },
  { id: 'textbook-rsa', name: 'Textbook RSA', type: 'Structural weakness', target: 'RSA', title: 'Deterministic textbook RSA', risk: 88, summary: 'Raw RSA is deterministic: repeated messages produce identical ciphertexts; algebraic attacks become feasible.', experiment: 'Encrypt the same message twice with the same public key using textbook RSA and compare the identical outputs.', why: 'Without randomized padding (e.g. OAEP), RSA preserves too much structure and is not semantically secure.', fix: 'Always use randomized padding schemes such as OAEP. Never deploy textbook RSA directly.', observations: ['Same message → same ciphertext every time', 'No chosen-ciphertext attack resilience', 'Padding is part of the cryptosystem, not an optional wrapper'] },
  { id: 'nonce-reuse', name: 'Nonce reuse (AEAD)', type: 'Operational failure', target: 'AEAD', title: 'Nonce reuse catastrophe', risk: 95, summary: 'Reusing a nonce with the same key in stream-like AE can reveal relations between plaintexts and destroy authenticity.', experiment: 'Encrypt two messages with the same nonce and key. XOR the ciphertexts to recover the XOR of the plaintexts directly.', why: 'Many AEAD constructions derive the same keystream on nonce+key repetition, so the masks cancel under XOR.', fix: 'Guarantee nonce uniqueness per key, or use misuse-resistant AEAD designs (e.g. AES-SIV).', observations: ['C₁ ⊕ C₂ = P₁ ⊕ P₂ — plaintext structure leaks directly', 'Operational mistakes can defeat strong primitives', 'Nonce management is a system-level engineering responsibility'] },
  { id: 'reused-k', name: 'Reused ephemeral k', type: 'Ephemeral key failure', target: 'ElGamal / DSA', title: 'Reused k exposes private key', risk: 93, summary: 'Two signatures or ciphertexts with the same k expose private-key information through simple algebra.', experiment: 'Write the two equations produced with the same k and solve the linear system for the private key modularly.', why: 'Randomness is embedded in the private computation; reusing it reduces hidden unknowns and makes the system solvable.', fix: 'Use high-quality randomness or RFC 6979 deterministic nonce generation for signatures.', observations: ['One repeated k can directly reveal the private key', 'Implementation mistakes defeat mathematically sound schemes', 'Randomness quality is a core security requirement'] }
];

const EXAMPLES = [
  { id: 'rsa-toy', topic: 'RSA', title: 'RSA toy example', summary: 'Small modulus makes the arithmetic fully inspectable while preserving all structural properties.', steps: ['Choose p=61 and q=53 → n = 3233, φ(n) = (61-1)(53-1) = 3120.', 'Pick e=17 with gcd(17, 3120) = 1.', 'Compute d=2753 so that 17 · 2753 ≡ 1 mod 3120.', 'Encrypt m=42: c = 42¹⁷ mod 3233 = 2557.', 'Decrypt: 2557²⁷⁵³ mod 3233 = 42. ✓'], takeaway: 'Good exam answers connect the arithmetic to the trapdoor: encryption uses the public exponent; decryption relies on the modular inverse tied to φ(n).', mistake: 'Students often confuse n with φ(n) when computing d.' },
  { id: 'dh-small', topic: 'Diffie-Hellman', title: 'Small-prime DH exchange', summary: 'A tiny group is insecure in practice but ideal for rehearsing shared-secret derivation by hand.', steps: ['Public parameters: p=23, g=5.', 'Alice picks a=6, publishes A = 5⁶ mod 23 = 8.', 'Bob picks b=15, publishes B = 5¹⁵ mod 23 = 19.', 'Alice: 19⁶ mod 23 = 2.   Bob: 8¹⁵ mod 23 = 2.   Same secret ✓'], takeaway: 'The secret is never transmitted; only exponentiated public values travel over the channel.', mistake: 'Students sometimes multiply A and B instead of exponentiating with their own private exponent.' },
  { id: 'aes-round', topic: 'AES', title: 'AES round intuition', summary: 'Isolating one round lets students focus on each transformation in turn.', steps: ['Load plaintext bytes into the 4×4 AES state matrix.', 'XOR the round key byte-by-byte in AddRoundKey.', 'Apply the S-box to each byte in SubBytes (nonlinearity).', 'Rotate rows in ShiftRows (positional mixing).', 'Mix each column via GF(2⁸) in MixColumns (diffusion).'], takeaway: 'Separate nonlinearity from diffusion: SubBytes creates confusion; MixColumns amplifies diffusion.', mistake: 'ShiftRows changes positions, not values — a very common exam error.' },
  { id: 'mac-compare', topic: 'MAC', title: 'Hash vs HMAC', summary: 'Placing plain hashing next to HMAC makes the authentication gap impossible to miss.', steps: ['Compute H(m) for a public message — anyone can reproduce this.', 'Note: no key, no authenticity. Anyone can forge a "matching" digest.', 'Introduce secret K and compute HMAC(K, m) = H(K ⊕ opad ∥ H(K ⊕ ipad ∥ m)).', 'Only holders of K can generate or verify a valid tag.'], takeaway: 'A hash gives fingerprinting; a MAC gives keyed integrity.', mistake: 'Writing "hashing provides authentication" without mentioning the secret key.' },
  { id: 'ecb-demo', topic: 'Attack', title: 'ECB image thought experiment', summary: 'A powerful exam-ready reasoning pattern — no implementation required.', steps: ['Split a structured image into repeated 16-byte plaintext blocks.', 'Encrypt each block independently under ECB mode.', 'Identical input blocks produce identical output blocks.', 'The encrypted image still reveals the original outline — confidentiality fails.'], takeaway: 'Confidentiality must hide patterns, not just individual values.', mistake: 'Claiming ECB is secure because the underlying block cipher (AES, DES) is strong.' },
  { id: 'ecc-shared', topic: 'ECC', title: 'ECDH conceptual flow', summary: 'Symbolic points teach the exchange clearly before introducing heavy curve arithmetic.', steps: ['Agree on curve parameters and base point G.', 'Alice publishes A = aG; Bob publishes B = bG.', 'Alice computes aB = a(bG); Bob computes bA = b(aG).', 'Both obtain abG — the shared secret point. ✓'], takeaway: 'ECC preserves the Diffie-Hellman logic with shorter keys for comparable security.', mistake: 'Thinking the public-key points A or B are themselves the shared secret.' }
];

const QUIZ = shuffleArray([
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
]);

const TEACHER = [
  { title: 'DES', summary: 'Present DES as historically important but no longer secure due to its 56-bit effective key.', analogy: 'A classic lock mechanism that is instructive to study, but whose key space is far too small for modern attackers.', warning: 'Students often think every permutation contributes equally to security; emphasise the central role of S-boxes.' },
  { title: 'AES', summary: 'Explain AES as a substitution-permutation network built from repeatable round transformations.', analogy: 'Repeatedly repainting bytes, moving them around the room, then blending each column with the neighbours.', warning: 'Do not let students conflate educational one-round visualizations with the full multi-round standard.' },
  { title: 'RSA', summary: 'Teach RSA as modular arithmetic plus a trapdoor created by factoring hardness.', analogy: 'The public key is like a mailbox slot anyone can post into; only the owner knows how to open the box.', warning: 'Raw textbook RSA is insufficient in practice; randomized padding (OAEP) is essential.' },
  { title: 'Diffie-Hellman', summary: 'The insight is agreement on a shared secret without ever transmitting it.', analogy: 'Each party adds a private twist to the same public object; the twists combine consistently on both sides.', warning: 'A shared secret alone does not authenticate the peer — MITM attacks still apply without authentication.' },
  { title: 'Hashes and MACs', summary: 'Separate fingerprinting from authentication clearly in every lesson.', analogy: 'A hash is a public checksum; a MAC is a sealed stamp that only key-holders can produce.', warning: 'Students frequently overclaim what a bare hash can provide.' },
  { title: 'AEAD', summary: 'Use AEAD to show that confidentiality and integrity should be designed together, not bolted on.', analogy: 'Not just a locked box — a locked and tamper-evident box where breaking the seal is immediately obvious.', warning: 'Nonce reuse must be framed as a system-level engineering failure, not a minor detail.' }
];

// ── Crypto engine ────────────────────────────────────────────────────────────
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; }

function extendedGCD(a, b) {
  let old_r = a, r = b, old_x = 1, x = 0, old_y = 0, y = 1;
  const table = [];
  while (r !== 0) {
    const q = Math.floor(old_r / r);
    const rem = old_r - q * r;
    table.push({ q, a: old_r, b: r, rem, eq: `${old_r} = ${q}·${r} + ${rem}` });
    [old_r, r] = [r, rem];
    [old_x, x] = [x, old_x - q * x];
    [old_y, y] = [y, old_y - q * y];
  }
  return { gcd: old_r, x: old_x, y: old_y, table };
}

function modpow(base, exp, mod) {
  if (mod === 1) return 0;
  base = ((base % mod) + mod) % mod;
  let result = 1;
  while (exp > 0) {
    if (exp % 2 === 1) result = (result * base) % mod;
    exp = Math.floor(exp / 2);
    base = (base * base) % mod;
  }
  return result;
}

function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
  return true;
}

function computeRSA(p, q, e, m) {
  const n = p * q;
  const phi = (p - 1) * (q - 1);
  if (gcd(e, phi) !== 1) return { error: `gcd(e, φ(n)) = ${gcd(e, phi)} ≠ 1: e non è invertibile mod φ(n).` };
  const eg = extendedGCD(e, phi);
  const d = ((eg.x % phi) + phi) % phi;
  const c = modpow(m, e, n);
  const decrypted = modpow(c, d, n);
  return { p, q, e, m, n, phi, d, c, decrypted, eg };
}

function computeDH(p, g, a, b) {
  const A = modpow(g, a, p);
  const B = modpow(g, b, p);
  const kAlice = modpow(B, a, p);
  const kBob = modpow(A, b, p);
  return { p, g, a, b, A, B, kAlice, kBob, match: kAlice === kBob };
}

// ── Small prime pools for random parameter generation ─────────────────────
const SMALL_PRIMES = [11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71];
const SMALL_SAFE_PRIMES = [11,23,47,59,83,107,167,179,227,239,251,263,347,359,383,467];

function randItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// Generate fresh random RSA parameters (small, exam-friendly).
function randomRSAParams() {
  let p, q, phi, e, m;
  do {
    p = randItem(SMALL_PRIMES);
    q = randItem(SMALL_PRIMES);
  } while (p === q || p * q < 20);
  phi = (p - 1) * (q - 1);
  const candidates = [3, 5, 7, 11, 13, 17, 19, 23].filter(x => x < phi && gcd(x, phi) === 1);
  e = randItem(candidates) || 3;
  const n = p * q;
  m = randInt(2, Math.min(n - 1, 50));
  return { p, q, e, m };
}

// Generate fresh random DH parameters.
function randomDHParams() {
  const p = randItem(SMALL_SAFE_PRIMES);
  const g = randInt(2, Math.min(p - 2, 10));
  const a = randInt(2, p - 2);
  const b = randInt(2, p - 2);
  return { p, g, a, b };
}

// ── Exercise definitions (dynamic, step-by-step) ──────────────────────────
// Each exercise has:
//   params: array of { id, label, default }
//   generateRandom(): returns fresh params object
//   buildSteps(params): returns array of step objects { label, fieldId, hint, compute(params, prev) }
//   run(params): returns full result object

const EXERCISES = {
  rsa: {
    title: 'RSA — genera le chiavi e cifra/decifra',
    goal: 'Dati p, q ed e, calcola passo per passo: n, φ(n), gcd(e,φ(n)), d (con EEA), il cifrato c e il messaggio decifrato.',
    params: [
      { id: 'p', label: 'p (primo)', default: 61 },
      { id: 'q', label: 'q (primo)', default: 53 },
      { id: 'e', label: 'e (esponente pubblico)', default: 17 },
      { id: 'm', label: 'm (messaggio, m < n)', default: 42 }
    ],
    generateRandom: randomRSAParams,
    buildSteps(params) {
      const p = +params.p, q = +params.q, e = +params.e, m = +params.m;
      const n = p * q;
      const phi = (p-1)*(q-1);
      const g = gcd(e, phi);
      const eg = extendedGCD(e, phi);
      const d = ((eg.x % phi) + phi) % phi;
      const c = modpow(m, e, n);
      const dec = modpow(c, d, n);
      return [
        {
          id: 'n',
          label: 'Passo 1 — Calcola n = p · q',
          hint: `Moltiplica i due primi: ${p} · ${q}`,
          answer: String(n),
          explanation: `n = ${p} · ${q} = <strong>${n}</strong> — il modulo RSA (chiave pubblica e privata condividono n).`
        },
        {
          id: 'phi',
          label: 'Passo 2 — Calcola φ(n) = (p−1)(q−1)',
          hint: `(${p}−1) · (${q}−1) = ${p-1} · ${q-1}`,
          answer: String(phi),
          explanation: `φ(n) = (${p}−1)(${q}−1) = ${p-1}·${q-1} = <strong>${phi}</strong> — la funzione di Eulero, necessaria per trovare d.`
        },
        {
          id: 'gcd_check',
          label: `Passo 3 — Verifica gcd(e, φ(n)) = gcd(${e}, ${phi})`,
          hint: 'Usa l\'algoritmo di Euclide. Il risultato deve essere 1 per garantire l\'esistenza dell\'inverso.',
          answer: String(g),
          explanation: `gcd(${e}, ${phi}) = <strong>${g}</strong>${g === 1 ? ' ✓ — e è invertibile mod φ(n).' : ' ✗ — scegli un e diverso!'}`
        },
        {
          id: 'd',
          label: `Passo 4 — Calcola d = e⁻¹ mod φ(n) con l'EEA`,
          hint: `Algoritmo esteso di Euclide su (${e}, ${phi}). Cerca t tale che ${e}·t ≡ 1 (mod ${phi}).`,
          answer: String(d),
          explanation: [
            `EEA su (${e}, ${phi}):`,
            ...eg.table.map(t => `&emsp;${t.eq}`),
            `Coefficiente di Bézout: x = ${eg.x} → d = (${eg.x} mod ${phi} + ${phi}) mod ${phi} = <strong>${d}</strong>`,
            `Verifica: ${e}·${d} mod ${phi} = ${(e*d) % phi} ✓`
          ].join('<br>')
        },
        {
          id: 'c',
          label: `Passo 5 — Cifra: c = m^e mod n = ${m}^${e} mod ${n}`,
          hint: 'Usa l\'esponenziazione modulare (square-and-multiply).',
          answer: String(c),
          explanation: `c = ${m}^${e} mod ${n} = <strong>${c}</strong> — il messaggio cifrato.`
        },
        {
          id: 'decrypted',
          label: `Passo 6 — Decifra: m = c^d mod n = ${c}^${d} mod ${n}`,
          hint: 'Applica di nuovo l\'esponenziazione modulare con l\'esponente privato d.',
          answer: String(dec),
          explanation: `m = ${c}^${d} mod ${n} = <strong>${dec}</strong> ${dec === m ? '✓ — corrisponde al messaggio originale!' : '✗ — errore nel calcolo.'}`
        }
      ];
    },
    run: (p) => computeRSA(+p.p, +p.q, +p.e, +p.m)
  },
  dh: {
    title: 'Diffie–Hellman — deriva il segreto condiviso',
    goal: 'Dati p, g, a (segreto Alice) e b (segreto Bob), calcola passo per passo A, B e il segreto condiviso K da entrambi i lati.',
    params: [
      { id: 'p', label: 'p (primo)', default: 23 },
      { id: 'g', label: 'g (generatore)', default: 5 },
      { id: 'a', label: 'a (segreto Alice)', default: 6 },
      { id: 'b', label: 'b (segreto Bob)', default: 15 }
    ],
    generateRandom: randomDHParams,
    buildSteps(params) {
      const p = +params.p, g = +params.g, a = +params.a, b = +params.b;
      const A = modpow(g, a, p);
      const B = modpow(g, b, p);
      const kAlice = modpow(B, a, p);
      const kBob = modpow(A, b, p);
      return [
        {
          id: 'A',
          label: `Passo 1 — Alice pubblica A = g^a mod p = ${g}^${a} mod ${p}`,
          hint: `Calcola ${g}^${a} mod ${p} con esponenziazione modulare.`,
          answer: String(A),
          explanation: `A = ${g}^${a} mod ${p} = <strong>${A}</strong> — il valore pubblico di Alice.`
        },
        {
          id: 'B',
          label: `Passo 2 — Bob pubblica B = g^b mod p = ${g}^${b} mod ${p}`,
          hint: `Calcola ${g}^${b} mod ${p} con esponenziazione modulare.`,
          answer: String(B),
          explanation: `B = ${g}^${b} mod ${p} = <strong>${B}</strong> — il valore pubblico di Bob.`
        },
        {
          id: 'kAlice',
          label: `Passo 3 — Alice calcola K = B^a mod p = ${B}^${a} mod ${p}`,
          hint: `Alice conosce B (pubblico) e a (suo segreto). Calcola ${B}^${a} mod ${p}.`,
          answer: String(kAlice),
          explanation: `K_Alice = ${B}^${a} mod ${p} = <strong>${kAlice}</strong>.`
        },
        {
          id: 'kBob',
          label: `Passo 4 — Bob calcola K = A^b mod p = ${A}^${b} mod ${p}`,
          hint: `Bob conosce A (pubblico) e b (suo segreto). Calcola ${A}^${b} mod ${p}.`,
          answer: String(kBob),
          explanation: `K_Bob = ${A}^${b} mod ${p} = <strong>${kBob}</strong>${kAlice === kBob ? ' ✓ — i segreti coincidono!' : ' ✗ — errore.'}`
        }
      ];
    },
    run: (p) => computeDH(+p.p, +p.g, +p.a, +p.b)
  }
};

// ── Exam sheet ───────────────────────────────────────────────────────────────
const EXAM_SHEET = [
  { id: 'aes', name: 'AES', confidentiality: 'Sì (in modalità adeguata)', integrity: 'No da sola', authentication: 'No', nonRepudiation: 'No', use: 'Cifratura simmetrica di dati a riposo e in transito (TLS con AES-GCM, dischi cifrati).', threat: 'ECB rivela pattern del plaintext; riuso di IV/nonce in CBC/CTR.', secure: 'AES-GCM o AES-CTR+HMAC; mai ECB per dati strutturati.' },
  { id: 'des', name: 'DES', confidentiality: 'Debole (56 bit)', integrity: 'No', authentication: 'No', nonRepudiation: 'No', use: 'Solo storico/didattico.', threat: 'Ricerca esaustiva della chiave in ore con hardware dedicato.', secure: 'Migrare ad AES-128/256.' },
  { id: 'rsa', name: 'RSA', confidentiality: 'Sì (con OAEP)', integrity: 'No da sola', authentication: 'Sì (firma)', nonRepudiation: 'Sì (firma RSA)', use: 'Trasporto chiavi, firme digitali (RSA-PSS), certificati X.509.', threat: 'Textbook RSA deterministica; chiavi corte fattorizzabili.', secure: 'OAEP per cifratura, PSS per firma, n ≥ 2048 bit.' },
  { id: 'dh', name: 'Diffie-Hellman', confidentiality: 'No (serve cifrare col segreto derivato)', integrity: 'No', authentication: 'No (vulnerabile MITM)', nonRepudiation: 'No', use: 'Key exchange per segreto condiviso (TLS, IPsec).', threat: 'Man-in-the-middle se i valori pubblici non sono autenticati.', secure: 'Autenticare lo scambio (firme/certificati) o usare TLS/STS.' },
  { id: 'elgamal', name: 'ElGamal', confidentiality: 'Sì (randomizzata)', integrity: 'No', authentication: 'No', nonRepudiation: 'No', use: 'Cifratura a chiave pubblica; base per DSA.', threat: 'Riuso del valore effimero k espone la chiave privata.', secure: 'k casuale univoco per ogni cifratura.' },
  { id: 'hash', name: 'Hash functions', confidentiality: 'No', integrity: 'Sì (fingerprint)', authentication: 'No', nonRepudiation: 'No', use: 'Verifica integrità, commitment, base per HMAC e firme.', threat: 'Collisioni su algoritmi deboli (MD5, SHA-1).', secure: 'SHA-256/SHA-3 o famiglie moderne.' },
  { id: 'mac', name: 'MAC / HMAC / CMAC', confidentiality: 'No', integrity: 'Sì', authentication: 'Sì (con chiave condivisa)', nonRepudiation: 'No', use: 'Autenticazione messaggi in protocolli simmetrici.', threat: 'Length-extension su costruzioni naive senza HMAC.', secure: 'Costruzione HMAC standard o CMAC su cifrario a blocco.' },
  { id: 'ae', name: 'Authenticated Encryption', confidentiality: 'Sì', integrity: 'Sì', authentication: 'Sì', nonRepudiation: 'No', use: 'TLS 1.3 (AES-GCM, ChaCha20-Poly1305).', threat: 'Riuso del nonce; decifrare prima di verificare il tag.', secure: 'Nonce univoco per chiave; verificare il tag prima di rilasciare il plaintext.' },
  { id: 'ecc', name: 'ECC / ECDH', confidentiality: 'Sì (ECIES)', integrity: 'No da sola', authentication: 'Sì (ECDSA/EdDSA)', nonRepudiation: 'Sì (ECDSA/EdDSA)', use: 'TLS moderno, firme, scambio chiavi su dispositivi con risorse limitate.', threat: 'Curve non standard o deboli; RNG scarsa nelle firme.', secure: 'Curve standard (P-256, Curve25519); nonce deterministico (RFC 6979) o EdDSA.' }
];

// ── localStorage persistence ─────────────────────────────────────────────────
const STORAGE_KEY = 'cav_state_v2';
function saveState() {
  try {
    const coteachState = (typeof CT_STATE !== 'undefined') ? CT_STATE : null;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      theme: document.documentElement.getAttribute('data-theme'),
      currentAlgo: S.currentAlgo,
      quizAnswers: S.quizAnswers,
      quizIndex: S.quizIndex,
      quizCategory: S.quizCategory,
      coteach: coteachState
    }));
  } catch (err) {}
}

function loadState() {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null; }
  catch (err) { return null; }
}

// ── App state ────────────────────────────────────────────────────────────────
const S = {
  currentAlgo: 0, currentStep: 0, currentAttack: 0, currentExample: 0,
  mode: 'student', exerciseMode: false,
  quizIndex: 0, quizAnswers: Array(QUIZ.length).fill(null),
  quizCategory: 'All', quizTimes: Array(QUIZ.length).fill(0),
  quizQuestionStart: Date.now(), quizSessionStart: Date.now(),
  // exercise state
  exerciseParamsAlgo: null,
  exerciseParams: {},
  exerciseStepIndex: 0,  // current step the student is on
  exerciseSteps: [],     // built steps array for current params
  exerciseAnswers: {},   // { stepId: userInput }
  exerciseRevealed: {},  // { stepId: true } — steps already checked
};

// ── Render helpers ────────────────────────────────────────────────────────────
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
    `<article class="teacher-panel"><h4>${t.title}</h4>
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

// ── Exercise render (dynamic + step-by-step) ─────────────────────────────────
function initExerciseState(algoId) {
  const ex = EXERCISES[algoId];
  if (!ex) return;
  S.exerciseParamsAlgo = algoId;
  if (!S.exerciseParams[algoId]) {
    S.exerciseParams[algoId] = {};
    ex.params.forEach(p => { S.exerciseParams[algoId][p.id] = p.default; });
  }
  S.exerciseSteps = ex.buildSteps(S.exerciseParams[algoId]);
  S.exerciseStepIndex = 0;
  S.exerciseAnswers[algoId] = S.exerciseAnswers[algoId] || {};
  S.exerciseRevealed[algoId] = S.exerciseRevealed[algoId] || {};
}

function resetExerciseProgress() {
  const algoId = ALGORITHMS[S.currentAlgo].id;
  S.exerciseAnswers[algoId] = {};
  S.exerciseRevealed[algoId] = {};
  S.exerciseStepIndex = 0;
  const ex = EXERCISES[algoId];
  if (ex) S.exerciseSteps = ex.buildSteps(S.exerciseParams[algoId]);
}

function randomizeExerciseParams() {
  const algoId = ALGORITHMS[S.currentAlgo].id;
  const ex = EXERCISES[algoId];
  if (!ex || !ex.generateRandom) return;
  S.exerciseParams[algoId] = ex.generateRandom();
  S.exerciseSteps = ex.buildSteps(S.exerciseParams[algoId]);
  S.exerciseAnswers[algoId] = {};
  S.exerciseRevealed[algoId] = {};
  S.exerciseStepIndex = 0;
  renderExercise();
}

function renderExercise() {
  const panel = document.getElementById('exercisePanel');
  const normal = document.getElementById('normalPanel');
  if (!S.exerciseMode) { panel.style.display = 'none'; normal.style.display = ''; return; }
  panel.style.display = ''; normal.style.display = 'none';

  const algoId = ALGORITHMS[S.currentAlgo].id;
  const ex = EXERCISES[algoId];
  const unsupported = document.getElementById('exerciseUnsupported');
  const body = document.getElementById('exerciseBody');
  if (!ex) { unsupported.style.display = ''; body.style.display = 'none'; return; }
  unsupported.style.display = 'none'; body.style.display = '';

  if (S.exerciseParamsAlgo !== algoId) initExerciseState(algoId);

  const params = S.exerciseParams[algoId];
  const answers = S.exerciseAnswers[algoId];
  const revealed = S.exerciseRevealed[algoId];
  const steps = S.exerciseSteps;

  document.getElementById('exerciseTitle').textContent = ex.title;
  document.getElementById('exerciseGoal').textContent = ex.goal;

  // Params row
  document.getElementById('exerciseParams').innerHTML = ex.params.map(p =>
    `<div class="field"><label for="exparam-${p.id}">${p.label}</label>
      <input class="mono" id="exparam-${p.id}" data-exparam="${p.id}" data-algoex="${algoId}" value="${params[p.id]}" inputmode="numeric"/></div>`
  ).join('');

  // Progress indicator
  const completedCount = steps.filter(s => revealed[s.id]).length;
  const pct = steps.length > 0 ? Math.round(completedCount / steps.length * 100) : 0;
  document.getElementById('exerciseProgressBar').style.width = `${pct}%`;
  document.getElementById('exerciseProgressLabel').textContent = `Passaggi completati: ${completedCount} / ${steps.length}`;

  // Steps container — built via helper from exercise_engine.js
  if (typeof buildExerciseStepsHTML === 'function') {
    document.getElementById('exerciseStepsContainer').innerHTML = buildExerciseStepsHTML(steps, answers, revealed, S.exerciseStepIndex);
  }

  // Completion banner
  const allDone = steps.length > 0 && steps.every(s => revealed[s.id]);
  const allCorrect = allDone && steps.every(s => String(answers[s.id] || '').trim() === s.answer);
  const banner = document.getElementById('exerciseCompletionBanner');
  if (allDone) {
    banner.style.display = '';
    banner.innerHTML = allCorrect
      ? `<strong>Ottimo! Tutti i passaggi corretti ✓</strong> Premi "Nuovo esercizio" per una nuova sessione.`
      : `<strong>Esercizio completato.</strong> Riprova con "Nuovo esercizio" per consolidare.`;
    banner.className = allCorrect ? 'callout' : 'callout callout-warn';
  } else { banner.style.display = 'none'; }
}

// ── Quiz rendering and navigation ────────────────────────────────────────────
function renderQuizCategories() {
  const catSel = document.getElementById('quizCategoryFilter');
  if (!catSel) return;
  const cats = ['All', ...Array.from(new Set(QUIZ.map(q => q.category)))];
  catSel.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
  catSel.value = S.quizCategory;
}

function filteredQuiz() {
  if (S.quizCategory === 'All') return QUIZ;
  return QUIZ.filter(q => q.category === S.quizCategory);
}

function renderQuiz() {
  const list = filteredQuiz();
  if (S.quizIndex >= list.length) S.quizIndex = Math.max(0, list.length - 1);
  const q = list[S.quizIndex];
  const globalIndex = QUIZ.indexOf(q);
  document.getElementById('quizQuestionTitle').textContent = `Q${S.quizIndex + 1}`;
  document.getElementById('quizCategory').textContent = q.category;
  document.getElementById('quizQuestionText').textContent = q.q;
  const answered = S.quizAnswers[globalIndex];
  const shuffledOpts = q._shuffledOpts || q.opts;
  document.getElementById('quizOptions').innerHTML = shuffledOpts.map((opt, i) => {
    let cls = 'quiz-option';
    const originalIndex = q._optMap ? q._optMap[i] : i;
    if (answered !== null) {
      if (originalIndex === q.correct) cls += ' correct';
      else if (originalIndex === answered) cls += ' wrong';
    }
    return `<button class="${cls}" data-qopt="${originalIndex}">${opt}</button>`;
  }).join('');
  const answeredCount = S.quizAnswers.filter(x => x !== null).length;
  const correctCount = S.quizAnswers.filter((ans, idx) => ans !== null && ans === QUIZ[idx].correct).length;
  document.getElementById('quizAnswered').textContent = answeredCount;
  document.getElementById('quizCorrect').textContent = correctCount;
  document.getElementById('quizAccuracy').textContent = answeredCount ? `${Math.round(correctCount / answeredCount * 100)}%` : '0%';
  document.getElementById('quizProgress').style.width = `${list.length ? Math.round((S.quizIndex + 1) / list.length * 100) : 0}%`;
  document.getElementById('quizExplanation').textContent = answered !== null ? q.ex : '';
  document.getElementById('quizCompletionMsg').style.display = answeredCount === QUIZ.length ? '' : 'none';
  document.getElementById('quizCompletionMsg').textContent = answeredCount === QUIZ.length ? 'Quiz completo — rivedi le spiegazioni e ripeti le domande più deboli.' : '';
}

function tickQuizTimer() {
  const now = Date.now();
  const totalSeconds = Math.floor((now - S.quizSessionStart) / 1000);
  const timer = document.getElementById('quizTimer');
  if (timer) timer.textContent = `${totalSeconds}s`;
  requestAnimationFrame(tickQuizTimer);
}

// ── Exam sheet render ───────────────────────────────────────────────────────
function renderExamSheet() {
  const grid = document.getElementById('examSheetGrid');
  if (!grid) return;
  grid.innerHTML = EXAM_SHEET.map(row => `
    <article class="card">
      <h3>${row.name}</h3>
      <div class="kpi-row" style="margin-top:.5rem">
        <div class="kpi"><span>Confidentiality</span><strong>${row.confidentiality}</strong></div>
        <div class="kpi"><span>Integrity</span><strong>${row.integrity}</strong></div>
        <div class="kpi"><span>Authentication</span><strong>${row.authentication}</strong></div>
        <div class="kpi"><span>Non-repudiation</span><strong>${row.nonRepudiation}</strong></div>
      </div>
      <p style="margin-top:.5rem;font-size:var(--text-sm)"><strong>Use:</strong> ${row.use}</p>
      <p style="margin-top:.25rem;font-size:var(--text-sm)"><strong>Threat:</strong> ${row.threat}</p>
      <p style="margin-top:.25rem;font-size:var(--text-sm)"><strong>Secure usage:</strong> ${row.secure}</p>
    </article>
  `).join('');
}

// ── Theme toggle ─────────────────────────────────────────────────────────────
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('themeBtn').textContent = theme === 'dark' ? '🌓 Theme' : '🌗 Theme';
}

function initTheme() {
  const stored = loadState();
  const theme = stored && stored.theme ? stored.theme : 'dark';
  applyTheme(theme);
}

// ── Mode toggle ─────────────────────────────────────────────────────────────
function updateModeIndicator() {
  const el = document.getElementById('modeIndicator');
  if (!el) return;
  const t = S.mode === 'teacher' ? 'Mode: Teacher' : 'Mode: Student';
  el.textContent = S.exerciseMode ? 'Mode: Exercise' : t;
  el.className = 'badge ' + (S.exerciseMode ? 'primary' : (S.mode === 'teacher' ? 'success' : ''));
}

// ── App init & event wiring ─────────────────────────────────────────────────
function initApp() {
  const stored = loadState();
  if (stored) {
    S.currentAlgo = stored.currentAlgo || 0;
    S.quizAnswers = Array.isArray(stored.quizAnswers) && stored.quizAnswers.length === QUIZ.length ? stored.quizAnswers : S.quizAnswers;
    S.quizIndex = stored.quizIndex || 0;
    S.quizCategory = stored.quizCategory || 'All';
    if (stored.coteach && typeof CT_STATE !== 'undefined') {
      CT_STATE.topicIdx = stored.coteach.topicIdx || 0;
      CT_STATE.stepIdx = stored.coteach.stepIdx || 0;
      CT_STATE.answered = stored.coteach.answered || {};
      CT_STATE.completed = stored.coteach.completed || {};
    }
  }

  renderLists();
  renderAlgo();
  renderAttack();
  renderExample();
  renderExercise();
  renderQuizCategories();
  renderQuiz();
  renderExamSheet();
  updateModeIndicator();

  S.quizSessionStart = Date.now();
  requestAnimationFrame(tickQuizTimer);

  // Algo navigation
  document.getElementById('algoList').addEventListener('click', e => {
    const btn = e.target.closest('[data-ai]');
    if (!btn) return;
    S.currentAlgo = +btn.dataset.ai;
    S.currentStep = 0;
    renderLists();
    renderAlgo();
    renderExercise();
    saveState();
  });

  document.getElementById('prevStepBtn').addEventListener('click', () => {
    if (S.currentStep > 0) S.currentStep--;
    renderAlgo();
  });

  document.getElementById('nextStepBtn').addEventListener('click', () => {
    const al = ALGORITHMS[S.currentAlgo];
    if (S.currentStep < al.steps.length - 1) S.currentStep++;
    renderAlgo();
  });

  document.getElementById('resetStepBtn').addEventListener('click', () => {
    S.currentStep = 0;
    renderAlgo();
  });

  // Attack/exam/example navigation
  document.getElementById('attackList').addEventListener('click', e => {
    const btn = e.target.closest('[data-at]');
    if (!btn) return;
    S.currentAttack = +btn.dataset.at;
    renderLists();
    renderAttack();
  });

  document.getElementById('exampleList').addEventListener('click', e => {
    const btn = e.target.closest('[data-ex]');
    if (!btn) return;
    S.currentExample = +btn.dataset.ex;
    renderLists();
    renderExample();
  });

  // Mode buttons
  document.getElementById('modeStudent').addEventListener('click', () => {
    S.mode = 'student';
    S.exerciseMode = false;
    renderAlgo();
    renderExercise();
    updateModeIndicator();
  });

  document.getElementById('modeTeacher').addEventListener('click', () => {
    S.mode = 'teacher';
    S.exerciseMode = false;
    renderAlgo();
    renderExercise();
    updateModeIndicator();
  });

  document.getElementById('modeExercise').addEventListener('click', () => {
    S.exerciseMode = true;
    updateModeIndicator();
    renderExercise();
  });

  // Theme toggle
  document.getElementById('themeBtn').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
    saveState();
  });

  // Quiz events
  document.getElementById('quizCategoryFilter').addEventListener('change', e => {
    S.quizCategory = e.target.value;
    S.quizIndex = 0;
    renderQuiz();
    saveState();
  });

  document.getElementById('quizOptions').addEventListener('click', e => {
    const btn = e.target.closest('[data-qopt]');
    if (!btn) return;
    const list = filteredQuiz();
    const q = list[S.quizIndex];
    const globalIndex = QUIZ.indexOf(q);
    S.quizAnswers[globalIndex] = +btn.dataset.qopt;
    renderQuiz();
    saveState();
  });

  document.getElementById('prevQuizBtn').addEventListener('click', () => {
    const list = filteredQuiz();
    if (S.quizIndex > 0) S.quizIndex--;
    renderQuiz();
  });

  document.getElementById('nextQuizBtn').addEventListener('click', () => {
    const list = filteredQuiz();
    if (S.quizIndex < list.length - 1) S.quizIndex++;
    renderQuiz();
  });

  document.getElementById('restartQuizBtn').addEventListener('click', () => {
    QUIZ.forEach(q => {
      const indices = q.opts.map((_, i) => i);
      const shuffledIdx = shuffleArray(indices);
      q._shuffledOpts = shuffledIdx.map(i => q.opts[i]);
      q._optMap = shuffledIdx;
    });
    S.quizAnswers = Array(QUIZ.length).fill(null);
    S.quizIndex = 0;
    S.quizSessionStart = Date.now();
    renderQuiz();
    saveState();
  });

  // Exercise events (dynamic panel and standalone section share logic)
  document.getElementById('exerciseRandomBtn').addEventListener('click', () => {
    randomizeExerciseParams();
  });

  document.getElementById('exerciseResetBtn').addEventListener('click', () => {
    resetExerciseProgress();
    renderExercise();
  });

  document.getElementById('exerciseBody').addEventListener('click', e => {
    const algoId = ALGORITHMS[S.currentAlgo].id;
    const ex = EXERCISES[algoId];
    if (!ex) return;
    const answers = S.exerciseAnswers[algoId];
    const revealed = S.exerciseRevealed[algoId];
    const steps = S.exerciseSteps;

    const checkBtn = e.target.closest('[data-checkstep]');
    if (checkBtn) {
      const idx = +checkBtn.dataset.checkstep;
      const step = steps[idx];
      const inputEl = document.getElementById(`exstep-input-${idx}`);
      const val = inputEl ? inputEl.value : '';
      answers[step.id] = val;
      revealed[step.id] = true;
      const correct = String(val).trim() === step.answer;
      if (correct && S.exerciseStepIndex === idx) S.exerciseStepIndex = Math.min(idx + 1, steps.length - 1);
      renderExercise();
      return;
    }

    const showBtn = e.target.closest('[data-showstep]');
    if (showBtn) {
      const idx = +showBtn.dataset.showstep;
      const step = steps[idx];
      answers[step.id] = step.answer;
      revealed[step.id] = true;
      if (S.exerciseStepIndex === idx) S.exerciseStepIndex = Math.min(idx + 1, steps.length - 1);
      renderExercise();
      return;
    }
  });

  document.getElementById('exerciseBody').addEventListener('input', e => {
    const stepInput = e.target.closest('[data-stepidx]');
    if (stepInput) {
      const algoId = ALGORITHMS[S.currentAlgo].id;
      const step = S.exerciseSteps[+stepInput.dataset.stepidx];
      if (step) S.exerciseAnswers[algoId][step.id] = stepInput.value;
    }
    const paramInput = e.target.closest('[data-exparam]');
    if (paramInput) {
      const algoId = paramInput.dataset.algoex;
      S.exerciseParams[algoId][paramInput.dataset.exparam] = paramInput.value;
      const ex = EXERCISES[algoId];
      if (ex) { S.exerciseSteps = ex.buildSteps(S.exerciseParams[algoId]); S.exerciseAnswers[algoId] = {}; S.exerciseRevealed[algoId] = {}; S.exerciseStepIndex = 0; }
      renderExercise();
    }
  });
}

// ── Bootstrap ───────────────────────────────────────────────────────────────
initTheme();
window.addEventListener('load', initApp);
