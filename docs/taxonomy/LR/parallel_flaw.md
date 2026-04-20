# LR — Parallel Flaw

**Coverage target:** 89 questions across difficulties 1 / 2 / 3 (19 / 38 / 32 per `generation/coverage-matrix.json`).

## Structure

The stimulus is a **flawed** argument. The correct answer is another argument that commits the **same kind of flaw** — the logical error, not merely a related error or a flaw of the same general family. The student must first diagnose the stimulus's error (necessary/sufficient swap, base-rate reversal, compositional fallacy, etc.) and then match it against five similarly-flawed mini-arguments. Parallel-flaw items are among the hardest LR questions because they fuse flaw identification with structural matching. The Carpaccio / sumptuous reds item (`lr-lsac-sample-10.json`) is the paradigm: "most X's have Y; this thing has Y; therefore it's probably an X" — base-rate reversal. The correct answer (D) replicates that exact move with different content. (Dossier §3.7, lines 183–195.)

## Common stem templates

- "The flawed reasoning in which one of the following is most similar to the flawed reasoning in the argument above?" (dossier §3.7, line 186)
- "Which one of the following arguments exhibits flawed reasoning most similar to that exhibited by the argument above?" (§3.7, line 187)
- "Which one of the following contains a pattern of flawed reasoning most similar to that in the argument above?" (anchor stem in `lr-lsac-sample-10.json`)

## Difficulty anchors

- **1★ (≈80–100% correct):** Transparent flaw (ad hominem, circular reasoning, false dichotomy). Only one answer matches both the structure and the flaw; other answers are valid or commit obviously different errors.
- **2★ (≈50–79% correct):** Named logical flaw (necessary/sufficient confusion, correlation→causation). Two or three answer choices have surface plausibility; student must track which one reverses the same conditional or shares the same causal overreach.
- **3★ (under 50% correct):** Base-rate or compositional flaw where answer choices share topic or vocabulary. Carpaccio-tier: each choice is a dense five-line mini-argument; one replicates the flaw precisely, one is valid, one has a different flaw but similar topic, one is off-by-a-dimension (absolute vs. percentage).

## Trap patterns

- **Valid analog:** An answer whose topic and structure feel parallel but which contains no flaw. The stimulus is flawed; the correct answer must also be flawed. (Dossier §3.7, line 190.)
- **Different flaw, same topic:** Answer commits a distinct reasoning error dressed in familiar subject matter. (§3.7, line 191.)
- **Close but off-by-one:** The flaw rhymes with the stimulus's but differs in a specific dimension — percentage vs. absolute number (§6.8, lines 435–439), relative vs. comparative, universal vs. existential quantifier. (§3.7, line 192.)
- **Right flaw, wrong conclusion strength:** Stimulus concludes "probably X"; trap concludes "certainly X" or "X in all cases." The flaw must be replicated at matching strength.
- **Misidentification premium:** If the student misdiagnoses the stimulus's flaw (e.g., calls base-rate reversal a correlation-causation flaw), they will pick an answer matching the wrong flaw category.

## Style tells (how to sound authentic)

- Stimulus author should sound confident — no hedging on the conclusion. The confidence is what makes the flaw extractable.
- Use concrete named things in the stimulus: a specific painter, drug, species. Abstract stimuli are harder to keep legible.
- Each answer choice must be a **complete** mini-argument: at least one premise and a clearly marked conclusion. Fragments are disqualifying.
- Vary answer-choice domains widely (art history, biology, economics) to prevent topic-matching as a shortcut.
- Use LSAT's probabilistic vocabulary: "probably," "most," "likely," "tends to." The flaw usually lives in how these quantifiers interact across premises and conclusion.

## Thin spots

The dossier has one anchor (`lr-lsac-sample-10.json`) and §3.7 is moderately detailed but leans on one exemplar. Flag for Task 23 few-shot bundling: ideally 3–5 parallel-flaw exemplars spanning different flaw families would ground the generator better.

## Domain diversity instruction (REQUIRED in every generator prompt)

When generating this subtype, vary stimulus domains across the batch. Choose from: medicine, ethics, economics, law, environmental science, technology, linguistics, history, policy, arts. **No more than 2 stimuli per domain in any 40-question batch.**

## References

- Dossier: `docs/research/lsat-research-dossier.md` §3.7 (lines 183–195); difficulty driver §2 (line 91, Parallel Flaw with five dense answers); trap catalog §6.3 (lines 405–410, half-right), §6.8 (lines 435–439, relative vs. absolute).
- Authentic anchors: `docs/research/lsac-samples/lr-lsac-sample-10.json` (Carpaccio, 3★).
