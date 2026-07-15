// exercise_engine.js — step-by-step render logic and event wiring for dynamic exercises
// Loaded after app.js. All functions rely on globals: S, EXERCISES, ALGORITHMS, renderExercise.

// Called by renderExercise() to build the step-by-step HTML.
function buildExerciseStepsHTML(steps, answers, revealed, stepIndex) {
  return steps.map((step, i) => {
    const isActive = i === stepIndex;
    const isDone = !!revealed[step.id];
    const isLocked = i > stepIndex && !isDone;
    const userVal = answers[step.id] || '';
    const correct = isDone ? String(userVal).trim() === step.answer : null;

    let statusBadge = '';
    if (isDone) statusBadge = correct
      ? `<span class="badge success">Corretto ✓</span>`
      : `<span class="badge warn">Riveduto ✗</span>`;
    else if (isActive) statusBadge = `<span class="badge primary">In corso</span>`;
    else if (isLocked) statusBadge = `<span class="badge" style="opacity:.45">Bloccato</span>`;

    const inputDisabled = (isDone || isLocked) ? 'disabled' : '';
    const cardClass = isDone ? (correct ? 'step step-ok' : 'step step-err') : (isActive ? 'step current' : 'step');

    let explanationHTML = '';
    if (isDone) {
      explanationHTML = `<div class="callout" style="margin-top:.6rem;font-size:var(--text-sm)">
        <strong>Spiegazione:</strong> ${step.explanation}
      </div>`;
    } else if (isActive) {
      explanationHTML = `<p style="font-size:var(--text-sm);color:var(--color-text-muted)"><em>Suggerimento:</em> ${step.hint}</p>`;
    }

    return `<div class="${cardClass}" id="exstep-${i}">
      <div class="step-top">
        <strong>${step.label}</strong>
        ${statusBadge}
      </div>
      ${isLocked ? '' : `
        <div class="field" style="margin-top:.5rem">
          <input class="mono" id="exstep-input-${i}" data-stepidx="${i}" data-stepid="${step.id}"
            value="${userVal}" placeholder="Inserisci il risultato…" ${inputDisabled}
            style="max-width:18rem"/>
          ${!isDone && isActive ? `<button class="btn btn-primary" data-checkstep="${i}" style="margin-left:.5rem">Verifica</button>` : ''}
          ${!isDone && isActive ? `<button class="btn btn-secondary" data-showstep="${i}" style="margin-left:.25rem">Mostra risposta</button>` : ''}
        </div>
      `}
      ${explanationHTML}
    </div>`;
  }).join('');
}

// Standalone Exercises section (sec-exercises) logic — shares EXERCISES and helpers.
const SEC_EX = {
  algoId: 'rsa',
  params: {},
  steps: [],
  stepIndex: 0,
  answers: {},
  revealed: {}
};

function initSecEx(algoId) {
  SEC_EX.algoId = algoId;
  const ex = EXERCISES[algoId];
  if (!ex) return;
  if (!SEC_EX.params[algoId]) {
    SEC_EX.params[algoId] = {};
    ex.params.forEach(p => { SEC_EX.params[algoId][p.id] = p.default; });
  }
  SEC_EX.steps = ex.buildSteps(SEC_EX.params[algoId]);
  SEC_EX.stepIndex = 0;
  SEC_EX.answers[algoId] = SEC_EX.answers[algoId] || {};
  SEC_EX.revealed[algoId] = SEC_EX.revealed[algoId] || {};
}

function renderExerciseSection() {
  const algoId = SEC_EX.algoId;
  const ex = EXERCISES[algoId];
  if (!ex) return;
  if (!SEC_EX.steps || SEC_EX.steps.length === 0) initSecEx(algoId);

  const params = SEC_EX.params[algoId];
  const answers = SEC_EX.answers[algoId];
  const revealed = SEC_EX.revealed[algoId];
  const steps = SEC_EX.steps;

  document.getElementById('exerciseTitleSec').textContent = ex.title;
  document.getElementById('exerciseGoalSec').textContent = ex.goal;
  document.getElementById('exerciseAlgoSelect').value = algoId;

  document.getElementById('exerciseParamsSec').innerHTML = ex.params.map(p =>
    `<div class="field"><label for="exparamsec-${p.id}">${p.label}</label>
      <input class="mono" id="exparamsec-${p.id}" data-secparam="${p.id}" value="${params[p.id]}" inputmode="numeric"/></div>`
  ).join('');

  const completedCount = steps.filter(s => revealed[s.id]).length;
  const pct = steps.length > 0 ? Math.round(completedCount / steps.length * 100) : 0;
  document.getElementById('exerciseProgressBarSec').style.width = `${pct}%`;
  document.getElementById('exerciseProgressLabelSec').textContent = `Passaggi completati: ${completedCount} / ${steps.length}`;

  document.getElementById('exerciseStepsContainerSec').innerHTML = buildExerciseStepsHTML(steps, answers, revealed, SEC_EX.stepIndex)
    .replace(/data-checkstep=/g, 'data-checkstepsec=')
    .replace(/data-showstep=/g, 'data-showstepsec=')
    .replace(/data-stepidx=/g, 'data-secstepidx=')
    .replace(/id="exstep-input-/g, 'id="exstepsecinput-')
    .replace(/id="exstep-/g, 'id="exstepsec-');

  const allDone = steps.length > 0 && steps.every(s => revealed[s.id]);
  const allCorrect = allDone && steps.every(s => String(answers[s.id] || '').trim() === s.answer);
  const banner = document.getElementById('exerciseCompletionBannerSec');
  if (allDone) {
    banner.style.display = '';
    banner.innerHTML = allCorrect
      ? `<strong>Ottimo! Tutti i passaggi corretti ✓</strong> Premi "Nuovo esercizio" per una nuova sessione.`
      : `<strong>Esercizio completato.</strong> Riprova con "Nuovo esercizio" per consolidare.`;
    banner.className = allCorrect ? 'callout' : 'callout callout-warn';
  } else { banner.style.display = 'none'; }
}

document.getElementById('exerciseBodySec').addEventListener('click', e => {
  const algoId = SEC_EX.algoId;
  const steps = SEC_EX.steps;
  const answers = SEC_EX.answers[algoId];
  const revealed = SEC_EX.revealed[algoId];

  const checkBtn = e.target.closest('[data-checkstepsec]');
  if (checkBtn) {
    const idx = +checkBtn.dataset.checkstepsec;
    const step = steps[idx];
    const inputEl = document.getElementById(`exstepsecinput-${idx}`);
    const val = inputEl ? inputEl.value : '';
    answers[step.id] = val;
    revealed[step.id] = true;
    const correct = String(val).trim() === step.answer;
    if (correct && SEC_EX.stepIndex === idx) SEC_EX.stepIndex = Math.min(idx + 1, steps.length - 1);
    renderExerciseSection();
    return;
  }
  const showBtn = e.target.closest('[data-showstepsec]');
  if (showBtn) {
    const idx = +showBtn.dataset.showstepsec;
    const step = steps[idx];
    answers[step.id] = step.answer;
    revealed[step.id] = true;
    if (SEC_EX.stepIndex === idx) SEC_EX.stepIndex = Math.min(idx + 1, steps.length - 1);
    renderExerciseSection();
    return;
  }
});

document.getElementById('exerciseBodySec').addEventListener('input', e => {
  const inp = e.target.closest('[data-secstepidx]');
  if (inp) {
    const algoId = SEC_EX.algoId;
    const step = SEC_EX.steps[+inp.dataset.secstepidx];
    if (step) SEC_EX.answers[algoId][step.id] = inp.value;
  }
  const pInp = e.target.closest('[data-secparam]');
  if (pInp) {
    const algoId = SEC_EX.algoId;
    SEC_EX.params[algoId][pInp.dataset.secparam] = pInp.value;
    const ex = EXERCISES[algoId];
    if (ex) { SEC_EX.steps = ex.buildSteps(SEC_EX.params[algoId]); SEC_EX.answers[algoId] = {}; SEC_EX.revealed[algoId] = {}; SEC_EX.stepIndex = 0; }
    renderExerciseSection();
  }
});

document.getElementById('exerciseAlgoSelect').addEventListener('change', e => {
  initSecEx(e.target.value);
  renderExerciseSection();
});

document.getElementById('exerciseRandomBtnSec').addEventListener('click', () => {
  const algoId = SEC_EX.algoId;
  const ex = EXERCISES[algoId];
  if (!ex || !ex.generateRandom) return;
  SEC_EX.params[algoId] = ex.generateRandom();
  SEC_EX.steps = ex.buildSteps(SEC_EX.params[algoId]);
  SEC_EX.answers[algoId] = {}; SEC_EX.revealed[algoId] = {}; SEC_EX.stepIndex = 0;
  renderExerciseSection();
});

document.getElementById('exerciseResetBtnSec').addEventListener('click', () => {
  const algoId = SEC_EX.algoId;
  const ex = EXERCISES[algoId];
  SEC_EX.answers[algoId] = {}; SEC_EX.revealed[algoId] = {}; SEC_EX.stepIndex = 0;
  if (ex) SEC_EX.steps = ex.buildSteps(SEC_EX.params[algoId]);
  renderExerciseSection();
});

// ── Section navigation extension ──────────────────────────────────────────
const SECTIONS = ['visualizer','attacks','examples','exercises','quiz','teacher','examsheet'];
document.querySelectorAll('.nav a').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const sec = a.dataset.section;
    document.querySelectorAll('.nav a').forEach(x => x.classList.remove('active'));
    a.classList.add('active');
    SECTIONS.forEach(s => {
      const el = document.getElementById('sec-' + s);
      if (el) el.classList.toggle('active', s === sec);
    });
    if (sec === 'exercises') renderExerciseSection();
  });
});

// Initialize standalone exercises for both supported algorithms
initSecEx('rsa');
initSecEx('dh');
