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

// Main exercise render — extends renderExercise() in app.js.
// Overrides exerciseBody with step-by-step rendering.
const _origRenderExercise = window._origRenderExercise || (() => {});

function renderExerciseFull() {
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

  // Params
  document.getElementById('exerciseParams').innerHTML = ex.params.map(p =>
    `<div class="field"><label for="exparam-${p.id}">${p.label}</label>
      <input class="mono" id="exparam-${p.id}" data-exparam="${p.id}" data-algoex="${algoId}" value="${params[p.id]}" inputmode="numeric"/></div>`
  ).join('');

  // Progress bar
  const completedCount = steps.filter(s => revealed[s.id]).length;
  const progressPct = steps.length > 0 ? Math.round(completedCount / steps.length * 100) : 0;
  const progressBar = document.getElementById('exerciseProgressBar');
  if (progressBar) progressBar.style.width = `${progressPct}%`;
  const progressLabel = document.getElementById('exerciseProgressLabel');
  if (progressLabel) progressLabel.textContent = `Passaggi completati: ${completedCount} / ${steps.length}`;

  // Step-by-step cards
  const stepsContainer = document.getElementById('exerciseStepsContainer');
  if (stepsContainer) {
    stepsContainer.innerHTML = buildExerciseStepsHTML(steps, answers, revealed, S.exerciseStepIndex);
  }

  // Final success banner
  const allDone = steps.length > 0 && steps.every(s => revealed[s.id]);
  const allCorrect = allDone && steps.every(s => String(answers[s.id] || '').trim() === s.answer);
  const banner = document.getElementById('exerciseCompletionBanner');
  if (banner) {
    if (allDone) {
      banner.style.display = '';
      banner.innerHTML = allCorrect
        ? `<strong>Ottimo! Tutti i passaggi corretti ✓</strong> Premi "Nuovo esercizio" per una nuova sessione con parametri diversi.`
        : `<strong>Esercizio completato.</strong> Alcuni passaggi erano da rivedere — controlla le spiegazioni sopra e riprova con "Nuovo esercizio".`;
      banner.className = allCorrect ? 'callout' : 'callout callout-warn';
    } else {
      banner.style.display = 'none';
    }
  }
}

// Wire up step-level buttons via delegation on exerciseBody.
document.getElementById('exerciseBody').addEventListener('click', e => {
  const algoId = ALGORITHMS[S.currentAlgo].id;
  const ex = EXERCISES[algoId];
  if (!ex) return;
  const answers = S.exerciseAnswers[algoId];
  const revealed = S.exerciseRevealed[algoId];
  const steps = S.exerciseSteps;

  // Verifica button
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
    renderExerciseFull();
    return;
  }

  // Mostra risposta button
  const showBtn = e.target.closest('[data-showstep]');
  if (showBtn) {
    const idx = +showBtn.dataset.showstep;
    const step = steps[idx];
    answers[step.id] = step.answer;
    revealed[step.id] = true;
    if (S.exerciseStepIndex === idx) S.exerciseStepIndex = Math.min(idx + 1, steps.length - 1);
    renderExerciseFull();
    return;
  }
});

// Live input capture
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
    renderExerciseFull();
  }
});

// Randomize button
document.getElementById('exerciseRandomBtn') && document.getElementById('exerciseRandomBtn').addEventListener('click', () => {
  randomizeExerciseParams();
  renderExerciseFull();
});

// Reset button
document.getElementById('exerciseResetBtn') && document.getElementById('exerciseResetBtn').addEventListener('click', () => {
  resetExerciseProgress();
  renderExerciseFull();
});

// Override renderExercise globally
window.renderExercise = renderExerciseFull;

// Boot exercise panel
renderExerciseFull();
