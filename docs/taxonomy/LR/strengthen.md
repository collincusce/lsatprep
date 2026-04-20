# LR — Strengthen

**Coverage target:** 192 questions across difficulties 1 / 2 / 3 (51 / 90 / 51 per `generation/coverage-matrix.json`).

## Structure

The stimulus is a causal, analogical, or predictive argument — premises pointing to a conclusion that the author presents as probable rather than certain. The correct answer, assumed true, makes the conclusion **more likely** to hold: it rules out an alternative explanation, confirms a load-bearing premise, supports an implicit mechanism, or closes an analogical gap. The correct answer does not have to make the argument airtight; it only has to move the needle in the right direction. Strengthen stimuli are often scientific (supernovas, clinical studies), policy-flavored (jury instructions), or methodological. (Dossier §3.3, lines 130–142.)

## Common stem templates

- "Which one of the following, if true, most strengthens the argument?" (dossier §3.3, line 133)
- "Which one of the following, if true, provides the most support for the argument?" (§3.3, line 134)
- "Which one of the following, if true, most helps to support the [speaker]'s reasoning?"
- **EXCEPT variant:** "Each of the following, if true, strengthens the argument EXCEPT:" (see `lr-lsac-largeprint-03.json` for a 3★ example)

## Difficulty anchors

- **1★ (≈80–100% correct):** Single causal inference with one visible alternative. Adding "the alternative doesn't hold" trivially strengthens. E.g., an argument that a new fertilizer caused increased yields; correct answer rules out a weather explanation.
- **2★ (≈50–79% correct):** Scientific/methodological argument where the correct answer confirms a load-bearing assumption. The 1987 supernova (`lr-lsac-sample-04.json`) is canonical: argument assumes instruments would have detected a neutron star if one existed; correct (B) confirms their sensitivity at longer ranges than 1987's site. Four distractors are topical.
- **3★ (under 50% correct):** EXCEPT-format (`lr-lsac-largeprint-03.json`) or a multi-step causal chain where the correct strengthener addresses a non-obvious link. Answer choices often include a plausible-sounding fact that strengthens a neighboring claim rather than the actual conclusion.

## Trap patterns

- **Introduces alternative cause (disguised weakener):** The choice reads like support but actually supplies a rival explanation, weakening rather than strengthening. Common in causal stimuli. (Dossier §3.3, line 137.)
- **Accurate but irrelevant:** A factually plausible addition that neither rules out an alternative nor bridges a premise-to-conclusion gap. (§3.3, line 138.)
- **Strengthens a different conclusion:** The choice would strengthen a sister argument (about "scientific theories in general" rather than "this theory about this supernova"). The supernova item's (D) illustrates. (§3.3, line 139.)
- **Opposite answer:** Directly weakens instead of strengthening — watch for causal direction reversal or concessions to alternatives. (§6.4, lines 411–415.)
- **Unwarranted comparison:** Introduces a comparison the stimulus doesn't make (§6.9, lines 441–445), which can feel supportive without actually anchoring the stimulus's claim.
- **EXCEPT-trap: a strengthener, not the odd-one-out:** In EXCEPT stems, four choices should all strengthen and exactly one should fail to. Students in time pressure pick the first answer that looks like a strengthener instead of scanning for the one that *doesn't*.

## Style tells (how to sound authentic)

- The conclusion uses probabilistic language: "probably," "most likely," "therefore [the causal claim]." Avoid the word "must" in strengthen stimuli — that belongs to must-be-true items.
- Premises should introduce one piece of observed data plus the author's inference. Authentic stimuli resist over-explaining; the unstated mechanism is the space the correct answer occupies.
- Use named studies, researchers, or institutions sparingly and only where the register benefits ("Highway Safety Department records show..."). Never invent statistics that aren't needed.
- Answer choices should each be a single declarative sentence, typically 15–30 words. A good strengthen answer reads as a new fact, not as an editorial ("it is true that..." is a tell of AI drafting).
- Avoid uniform strengtheners across a batch. Mix: rule-out-alternative, confirm-mechanism, close-analogy, bolster-premise.

## Domain diversity instruction (REQUIRED in every generator prompt)

When generating this subtype, vary stimulus domains across the batch. Choose from: medicine, ethics, economics, law, environmental science, technology, linguistics, history, policy, arts. **No more than 2 stimuli per domain in any 40-question batch.**

## References

- Dossier: `docs/research/lsat-research-dossier.md` §3.3 (lines 130–142); trap catalog §6.4 (lines 411–415), §6.9 (lines 441–445).
- Authentic anchors: `docs/research/lsac-samples/lr-lsac-sample-04.json` (supernova, 2★); `lr-lsac-largeprint-03.json` (jury instructions, 3★ EXCEPT).
