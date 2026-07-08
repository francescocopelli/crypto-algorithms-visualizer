// ─────────────────────────────────────────────────
// Crypto Algorithms Visualizer — app.js
// ─────────────────────────────────────────────────

const DATA = {};

async function loadData() {
  const [algs, labs, quiz] = await Promise.all([
    fetch('data/algorithms.json').then(r => r.json()),
    fetch('data/labs.json').then(r => r.json()),
    fetch('data/quiz.json').then(r => r.json()),
  ]);
  DATA.algorithms = algs;
  DATA.labs = labs;
  DATA.quiz = quiz;
}

// ── State ────────────────────────────────────────
const state = {
  currentAlgo: 'des',
  currentLab: 'rsa-malleable',
  currentQuizIdx: 0,
  quizAnswered: {},
  teacherMode: false,
  theme: 'dark',
  animStep: 0,
  animPlaying: false,
};

// ── DOM refs ─────────────────────────────────────
const $ = id => document.getElementById(id);

// ── Render helpers ───────────────────────────────
function chip(text, cls = '') {
  return `<span class="chip ${cls}">${text}</span>`;
}

function severityClass(s) {
  return s === 'critical' ? 'severity-critical' : s === 'high' ? 'severity-high' : 'severity-medium';
}

// ── Sidebar nav ──────────────────────────────────
function renderNav() {
  const nav = $('nav');
  if (!nav) return;
  nav.innerHTML = DATA.algorithms.map(a => `
    <button class="nav-btn ${a.id === state.currentAlgo ? 'active' : ''}" data-id="${a.id}">
      <strong>${a.name}</strong>
      <small>${a.family}</small>
    </button>
  `).join('');
  nav.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.currentAlgo = btn.dataset.id;
      state.animStep = 0;
      state.animPlaying = false;
      renderAll();
    });
  });
}

// ── Algorithm viewer ─────────────────────────────
function renderViewer() {
  const el = $('viewer');
  if (!el) return;
  const a = DATA.algorithms.find(x => x.id === state.currentAlgo);

  // Flow row
  const flowHtml = a.flow.map((f, i) =>
    `${i ? '<span class="arrow">→</span>' : ''}<span class="node">${f}</span>`
  ).join('');

  // Animated steps
  const stepsHtml = a.steps.map((s, i) => {
    const active = i === state.animStep ? 'step-active' : i < state.animStep ? 'step-done' : '';
    const teacherNote = state.teacherMode
      ? `<div class="teacher-note">${s.teacher}</div>` : '';
    return `
      <div class="step-card ${active}" data-step="${i}">
        <div class="step-num">${i + 1}</div>
        <div class="step-body">
          <h4>${s.title}</h4>
          <p>${s.body}</p>
          ${teacherNote}
        </div>
      </div>`;
  }).join('');

  // Attacks
  const attacksHtml = a.attacks.map(att => `
    <div class="attack-card">
      <span class="attack-type ${severityClass(att.severity)}">${att.type} · ${att.severity}</span>
      <h4>${att.name}</h4>
      <p>${att.text}</p>
      <div class="countermeasure">✓ ${att.countermeasure}</div>
    </div>
  `).join('');

  // Numeric example
  const exHtml = a.example.lines.map(l =>
    l === '' ? '<br>' : `<div class="ex-line">${l}</div>`
  ).join('');

  el.innerHTML = `
    <div class="algo-header">
      <h2>${a.name}</h2>
      <p class="algo-sub">${a.subtitle}</p>
      <div class="chips">${a.concepts.map(c => chip(c)).join('')}</div>
    </div>

    <div class="flow-row">${flowHtml}</div>

    <section>
      <div class="section-hd">
        <h3>Animazione passo-passo</h3>
        <div class="anim-controls">
          <button id="btnPrev" ${state.animStep === 0 ? 'disabled' : ''}>← Prec</button>
          <button id="btnPlay">${state.animPlaying ? '⏸ Pausa' : '▶ Play'}</button>
          <button id="btnNext" ${state.animStep >= a.steps.length - 1 ? 'disabled' : ''}>Succ →</button>
          <button id="btnReset">↺ Reset</button>
        </div>
      </div>
      <div class="steps">${stepsHtml}</div>
    </section>

    <section>
      <h3>Attacchi possibili</h3>
      <div class="attacks">${attacksHtml}</div>
    </section>

    <section>
      <h3>${a.example.title}</h3>
      <div class="example-box">${exHtml}</div>
    </section>
  `;

  // Anim controls
  $('btnPrev').addEventListener('click', () => { if (state.animStep > 0) { state.animStep--; renderViewer(); } });
  $('btnNext').addEventListener('click', () => { if (state.animStep < a.steps.length - 1) { state.animStep++; renderViewer(); } });
  $('btnReset').addEventListener('click', () => { state.animStep = 0; state.animPlaying = false; clearInterval(state._animTimer); renderViewer(); });
  $('btnPlay').addEventListener('click', () => {
    state.animPlaying = !state.animPlaying;
    if (state.animPlaying) {
      state._animTimer = setInterval(() => {
        if (state.animStep < a.steps.length - 1) { state.animStep++; renderViewer(); }
        else { state.animPlaying = false; clearInterval(state._animTimer); renderViewer(); }
      }, 1800);
    } else {
      clearInterval(state._animTimer);
    }
    $('btnPlay').textContent = state.animPlaying ? '⏸ Pausa' : '▶ Play';
  });
}

// ── Attack Lab ───────────────────────────────────
function renderLab() {
  const el = $('labContent');
  if (!el) return;
  const l = DATA.labs.find(x => x.id === state.currentLab);

  const btns = DATA.labs.map(lab => `
    <button class="lab-tab ${lab.id === state.currentLab ? 'active' : ''}" data-id="${lab.id}">${lab.name}</button>
  `).join('');

  const stepsHtml = l.steps.map((s, i) => `
    <div class="lab-step">
      <span class="lab-step-num">${i + 1}</span>
      <span>${s}</span>
    </div>
  `).join('');

  el.innerHTML = `
    <div class="lab-tabs">${btns}</div>
    <div class="lab-scenario">
      <span class="attack-type ${l.category === 'Protocol' ? 'severity-critical' : l.category === 'Implementation' ? 'severity-high' : 'severity-medium'}">${l.category}</span>
      <h3>${l.title}</h3>
      <p class="scenario-desc">${l.scenario}</p>
      <div class="lab-steps">${stepsHtml}</div>
      <div class="lab-lesson"><strong>Lezione chiave:</strong> ${l.lesson}</div>
      <div class="lab-fix"><strong>Fix:</strong> ${l.fix}</div>
    </div>
  `;

  el.querySelectorAll('.lab-tab').forEach(btn => {
    btn.addEventListener('click', () => { state.currentLab = btn.dataset.id; renderLab(); });
  });
}

// ── Mini flows ───────────────────────────────────
function renderMiniFlows() {
  const el = $('miniFlows');
  if (!el) return;
  el.innerHTML = DATA.algorithms.map(a => `
    <div class="mini-flow-card ${a.id === state.currentAlgo ? 'active' : ''}" data-id="${a.id}">
      <strong>${a.name}</strong>
      <div class="flow-row mini">
        ${a.flow.map((f, i) => `${i ? '<span class="arrow">→</span>' : ''}<span class="node sm">${f}</span>`).join('')}
      </div>
    </div>
  `).join('');
  el.querySelectorAll('.mini-flow-card').forEach(card => {
    card.addEventListener('click', () => { state.currentAlgo = card.dataset.id; state.animStep = 0; renderAll(); });
  });
}

// ── Quiz ─────────────────────────────────────────
function renderQuiz() {
  const el = $('quizArea');
  if (!el) return;
  const q = DATA.quiz[state.currentQuizIdx];
  const answered = state.quizAnswered[q.id];

  const choicesHtml = q.choices.map((c, i) => {
    let cls = '';
    if (answered !== undefined) {
      if (i === q.correct) cls = 'correct';
      else if (i === answered) cls = 'wrong';
    }
    return `<button class="quiz-choice ${cls}" data-i="${i}" ${answered !== undefined ? 'disabled' : ''}>${c}</button>`;
  }).join('');

  const feedbackHtml = answered !== undefined
    ? `<div class="quiz-feedback ${answered === q.correct ? 'correct' : 'wrong'}">
        ${answered === q.correct ? '✓ Corretto.' : '✗ Non corretto.'} ${q.explanation}
       </div>` : '';

  el.innerHTML = `
    <div class="quiz-progress">${state.currentQuizIdx + 1} / ${DATA.quiz.length} — ${q.algorithm}</div>
    <div class="quiz-q">${q.question}</div>
    <div class="quiz-choices">${choicesHtml}</div>
    ${feedbackHtml}
    <div class="quiz-nav">
      <button id="qPrev" ${state.currentQuizIdx === 0 ? 'disabled' : ''}>← Prec</button>
      <button id="qNext" ${state.currentQuizIdx === DATA.quiz.length - 1 ? 'disabled' : ''}>Succ →</button>
    </div>
  `;

  el.querySelectorAll('.quiz-choice').forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.quizAnswered[q.id] !== undefined) return;
      st