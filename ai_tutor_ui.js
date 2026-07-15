// Wiring del pannello AI Tutor con AiTutor e Co-Teaching
import { TOPIC_SUGGESTIONS } from './topic_suggestions.js';

export function initAiTutorUI(getCurrentTopicId) {
  const loadBtn = document.getElementById('ai-tutor-load-btn');
  const progressEl = document.getElementById('ai-tutor-progress');
  const topicLabelEl = document.getElementById('ai-tutor-topic-label');
  const suggestionListEl = document.getElementById('ai-tutor-suggestion-list');
  const messagesEl = document.getElementById('ai-tutor-messages');
  const formEl = document.getElementById('ai-tutor-form');
  const inputEl = document.getElementById('ai-tutor-input');

  if (!loadBtn || !formEl || !inputEl) return;

  // Progress bar wiring
  AiTutor.onProgress(({ progress, text }) => {
    if (progress < 0) {
      progressEl.textContent = text;
      progressEl.classList.add('error');
      return;
    }
    progressEl.textContent = `${progress}% — ${text}`;
  });

  loadBtn.addEventListener('click', async () => {
    if (AiTutor.isReady()) return;
    loadBtn.disabled = true;
    progressEl.textContent = 'Avvio download modello…';
    try {
      await AiTutor.init();
    } catch (err) {
      console.error(err);
    } finally {
      loadBtn.disabled = false;
    }
  });

  // Suggerimenti per topic
  function renderSuggestions(topicId) {
    const suggestions = TOPIC_SUGGESTIONS[topicId] || [];
    topicLabelEl.textContent = topicId || 'cryptography';
    suggestionListEl.innerHTML = '';
    suggestions.slice(0, 3).forEach((text) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ai-tutor-suggestion';
      btn.textContent = text;
      btn.addEventListener('click', () => {
        inputEl.value = text;
        inputEl.focus();
      });
      suggestionListEl.appendChild(btn);
    });
  }

  // Agganciati al Co-Teaching: chiama renderSuggestions ogni volta che cambia il topic
  const initialTopic = getCurrentTopicId && getCurrentTopicId();
  renderSuggestions(initialTopic || 'rsa');

  // Chat streaming
  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = inputEl.value.trim();
    if (!msg) return;

    const topicId = getCurrentTopicId && getCurrentTopicId();

    const userBubble = document.createElement('div');
    userBubble.className = 'ai-tutor-message user';
    userBubble.textContent = msg;
    messagesEl.appendChild(userBubble);

    const assistantBubble = document.createElement('div');
    assistantBubble.className = 'ai-tutor-message assistant';
    messagesEl.appendChild(assistantBubble);

    inputEl.value = '';

    try {
      if (!AiTutor.isReady()) {
        progressEl.textContent = 'Il modello non è ancora pronto. Premi "Carica modello AI".';
        return;
      }

      let fullText = '';
      for await (const chunk of AiTutor.ask(msg, topicId)) {
        fullText += chunk;
        assistantBubble.textContent = fullText;
        messagesEl.scrollTop = messagesEl.scrollHeight;
      }
    } catch (err) {
      assistantBubble.textContent = `Errore: ${err.message}`;
    }
  });
}
