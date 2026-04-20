// Renders one question: stimulus (LR), passage (RC — delegated upstream),
// scenario (LG — delegated upstream), stem, 5 choice buttons. Calls
// onSelect(label) when a choice is picked.

export function renderQuestionCard(parentEl, { question, disabled = false, initialSelection = null, onSelect }) {
  const card = document.createElement('div');
  card.className = 'card question-card';

  if (question.section === 'LR' && question.stimulus) {
    const stim = document.createElement('div');
    stim.className = 'stimulus';
    stim.textContent = question.stimulus;
    card.appendChild(stim);
  }

  const stem = document.createElement('p');
  stem.className = 'question-stem';
  stem.style.marginTop = 'var(--space-4)';
  stem.style.fontWeight = '500';
  stem.textContent = question.questionStem;
  card.appendChild(stem);

  const list = document.createElement('div');
  list.className = 'choices stack';
  list.setAttribute('role', 'radiogroup');
  let selected = initialSelection;
  const buttons = new Map();

  for (const choice of question.choices) {
    const b = document.createElement('button');
    b.className = 'choice';
    b.type = 'button';
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-pressed', selected === choice.label ? 'true' : 'false');
    b.dataset.label = choice.label;
    b.innerHTML = `<strong style="margin-right: var(--space-3)">${choice.label}.</strong>${escapeHtml(choice.text)}`;
    if (disabled) b.disabled = true;
    b.addEventListener('click', () => {
      if (disabled) return;
      selected = choice.label;
      for (const [lbl, btn] of buttons) {
        btn.setAttribute('aria-pressed', lbl === selected ? 'true' : 'false');
      }
      if (onSelect) onSelect(selected);
    });
    buttons.set(choice.label, b);
    list.appendChild(b);
  }
  card.appendChild(list);
  parentEl.appendChild(card);

  return {
    setDisabled(v) { for (const b of buttons.values()) b.disabled = v; },
    markCorrectness(correctLabel, userLabel) {
      for (const [lbl, btn] of buttons) {
        btn.classList.remove('correct', 'incorrect');
        if (lbl === correctLabel) btn.classList.add('correct');
        else if (lbl === userLabel) btn.classList.add('incorrect');
      }
    },
    getSelection() { return selected; }
  };
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
