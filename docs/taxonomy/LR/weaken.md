# LR — Weaken

**Coverage target:** 191 questions across difficulties 1 / 2 / 3 (51 / 89 / 51 per `generation/coverage-matrix.json`).

## Structure

The stimulus is an argument — almost always causal, predictive, or analogical — whose conclusion overreaches its premises. The correct answer, if true, **undermines** the conclusion by offering an alternative explanation, a counterexample, a disanalogy, or evidence that a load-bearing premise is unreliable. The correct answer does not have to disprove; it only has to reduce confidence. Multi-step causal stimuli are hardest because the weakening can attack any link in the chain. (Dossier §3.4, lines 144–154.)

## Common stem templates

- "Which one of the following, if true, most weakens the argument?" (dossier §3.4, line 147)
- "Which one of the following, if true, most seriously undermines the argument's conclusion?" (§3.4, line 148)
- "Which one of the following, if true, most calls into question the [speaker]'s reasoning?"
- **EXCEPT variant:** "Each of the following, if true, weakens the argument EXCEPT:"

## Difficulty anchors

- **1★ (≈80–100% correct):** Single causal claim with one obvious alternative. Stimulus: "After the bakery switched to local flour, sales rose 15%; therefore local flour drove the increase." Correct answer introduces the confounder (a new storefront opened the same week).
- **2★ (≈50–79% correct):** Two-step causal chain or a predictive argument where the weakener attacks the move from evidence to conclusion rather than either item in isolation. Distractors include one strengthener and one out-of-scope fact about the same topic.
- **3★ (under 50% correct):** Methodological argument whose conclusion depends on an unstated assumption buried in a premise. Correct weakener attacks the hidden link. Answer choices are dense with qualifiers; student must distinguish "weakens the conclusion" from "weakens a neighboring claim" or "weakens one premise trivially."

## Trap patterns

- **Opposite answer (strengthens):** The choice actually bolsters the argument. Especially seductive when the stimulus is controversial and the choice aligns with the student's intuition. (Dossier §3.4, line 151; §6.4, lines 411–415.)
- **Accurate but irrelevant:** True-sounding factual detail that doesn't bear on the premise-to-conclusion move. (§3.4, line 152.)
- **Too narrow:** Weakens one link in a multi-step chain while leaving the conclusion standing. If the stimulus argues "A caused B which caused C," attacking A→B only weakens the conclusion if B→C is otherwise intact. (§3.4, line 153.)
- **Reversed causation (misapplied):** Reverses the stimulus's cause and effect (§6.7, lines 429–433). This is *correct* for pure-causal weakens, but a trap when the stimulus's conclusion is about correlation rather than direct causation.
- **Shift in subject:** Weakens a claim adjacent to the conclusion. E.g., stimulus concludes the new drug is effective; trap shows another drug has side effects. (§6.10, lines 447–451.)
- **Unwarranted comparison:** Introduces a comparative that the stimulus didn't license (§6.9). "Drug X is less effective than drug Y" doesn't weaken "drug X is effective" unless the stimulus hinged on relative efficacy.

## Style tells (how to sound authentic)

- Conclusions in weaken stimuli tend to overreach by: (a) declaring a cause, (b) predicting a future event, or (c) generalizing from a sample. Match one of those three patterns.
- Avoid conclusions already hedged to immunity. "The policy may have contributed, among other factors" leaves nothing to weaken.
- The five answer choices should span the spectrum: one clear weakener (correct), one strengthener (opposite-answer trap), one out-of-scope, one attacking a premise without touching the conclusion, one irrelevant.
- Prefer past-tense empirical framings ("A study found...") over speculation. LSAT weakens are grounded in stated observations.
- Name the actor. Executives, researchers, journalists, and officials populate weaken stimuli more often than anonymous narrators.

## Domain diversity instruction (REQUIRED in every generator prompt)

When generating this subtype, vary stimulus domains across the batch. Choose from: medicine, ethics, economics, law, environmental science, technology, linguistics, history, policy, arts. **No more than 2 stimuli per domain in any 40-question batch.**

## References

- Dossier: `docs/research/lsat-research-dossier.md` §3.4 (lines 144–154); trap catalog §6.4 (lines 411–415), §6.7 (lines 429–433), §6.9 (lines 441–445), §6.10 (lines 447–451).
- Authentic anchors: none in LR sample set directly labeled weaken; use strengthen anchors (`lr-lsac-sample-04.json`) inverted for voice calibration only — do not copy structure.
