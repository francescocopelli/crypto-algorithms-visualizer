// Suggestions per topic per l'AI Tutor
// Collegate al TOPIC_CONTEXT esistente in ai_tutor.js.

export const TOPIC_SUGGESTIONS = {
  rsa: [
    'Spiegami passo per passo come scelgo e, d e φ(n) in RSA.',
    'Perché non dovrei usare RSA direttamente per cifrare file grandi?',
    'Qual è la differenza tra firma digitale RSA e cifratura RSA?'
  ],
  aes: [
    'Perché MixColumns aiuta a ottenere diffusione in AES?',
    'Spiegami perché AES in ECB è insicuro con un esempio intuitivo.',
    'Che ruolo hanno SubBytes e ShiftRows nella sicurezza di AES?'
  ],
  dh: [
    'Perché Diffie-Hellman è vulnerabile al man-in-the-middle senza autenticazione?',
    'Mostrami un esempio numerico semplice di scambio chiavi Diffie-Hellman.',
    'Cosa significa che Diffie-Hellman si basa sulla discrete log?' 
  ],
  hash: [
    'Spiegami la differenza tra pre-image resistance e collision resistance.',
    'Perché un MAC è diverso da una semplice funzione hash?',
    'Come funziona HMAC ad alto livello?' 
  ],
  aead: [
    'Perché è grave riutilizzare lo stesso nonce in AEAD?',
    'Cosa sono i dati associati (AAD) in AES-GCM?',
    'Perché si dice "verify-then-decrypt" per AEAD?' 
  ],
};
