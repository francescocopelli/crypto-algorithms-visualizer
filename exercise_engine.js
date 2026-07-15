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

// NOTE: Standalone Exercises section logic (SEC_EX, renderExerciseSection, nav wiring)
// has been removed from this file to avoid duplicate identifier declarations.
// The section-specific state and navbar wiring live in the inline script inside index.html.
