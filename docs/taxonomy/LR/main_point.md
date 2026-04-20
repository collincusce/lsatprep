# LR — Main Point

**Coverage target:** 83 questions across difficulties 1 / 2 / 3 (26 / 38 / 19 per `generation/coverage-matrix.json`).

## Structure

The stimulus is an argument with a clear main conclusion. The correct answer is a faithful paraphrase of that conclusion — neither a premise, nor a subsidiary/intermediate conclusion, nor an overstatement, nor a restatement of background context. The main conclusion is the claim everything else in the argument supports. Most stimuli have explicit markers ("therefore," "thus," "hence"); the tricky ones bury the conclusion at the start of the argument or between two intermediate claims. (Dossier §3.11, lines 234–243.)

## Common stem templates

- "Which one of the following most accurately expresses the main conclusion of the argument?" (dossier §3.11, line 237)
- "Which one of the following most accurately expresses the main point of the [speaker]'s argument?"
- "The main point of the argument is that..."

## Difficulty anchors

- **1★ (≈80–100% correct):** Short stimulus (30–50 words) with "therefore" or "thus" followed directly by the main conclusion. The correct answer paraphrases that sentence. Distractors restate premises.
- **2★ (≈50–79% correct):** Stimulus with an intermediate conclusion. The main conclusion is either the first or last sentence; an intermediate conclusion sits in the middle with "thus" in front of it. Trap answer paraphrases the intermediate.
- **3★ (under 50% correct):** Stimulus opens with the conclusion and then provides multiple tiers of support, some of which use their own conclusion markers. The correct answer reaches back to the opening sentence. Two or three distractors pull from the middle of the argument; one overstates the conclusion's strength.

## Trap patterns

- **Restates a premise as if it were the conclusion:** The choice captures something the author says is true but uses it as support, not as the conclusion. (Dossier §3.11, line 239.)
- **Verbatim but wrong:** Quotes wording from the stimulus but from the wrong sentence — often an intermediate conclusion. (§3.11, line 240.)
- **Overstates / understates:** Strengthens the author's hedged claim to an absolute, or weakens the author's firm claim to a "maybe." Main-point answers must preserve the original modal force.
- **Mis-scoped:** Generalizes the conclusion beyond its stated scope, or narrows it. E.g., stimulus concludes "this policy failed"; trap says "all such policies fail" or "the policy failed for this reason."
- **Opposing view misread:** If the stimulus opens with "some argue that X," students may read X as the conclusion. The conclusion is always the author's view, not the view the author is rebutting.

## Style tells (how to sound authentic)

- Place the main conclusion either first or last; avoid burying it in the middle. (Dossier style note §8 line 491: "conclusion usually comes at the very start or the very end, rarely in the middle." Adapted from the LR voice tells.)
- Use one of the standard conclusion markers: "therefore," "thus," "hence," "so," "it follows that," "we should conclude." For the harder variants, use rhetorical signposts like "the real question is..." or "what this shows is..." without the literal "therefore."
- Include a concession or opposing view ("Some have argued...") in ~30% of stimuli to set up the "opposing view misread" trap.
- Correct answers should paraphrase, not quote. If the stimulus ends with "thus, the commission should reconsider," the correct answer reads "the commission should reconsider," not "commissioners should study the matter further."
- Do not introduce new vocabulary in the correct answer. Stick to the stimulus's terms, reorganized.

## Thin spots

The dossier's §3.11 is brief and **no authentic anchor exists** in the sample corpus (line 495 flags "0 main_point"). Generators should draft 3 synthetic exemplars covering conclusion-first, conclusion-last, and opposing-view-first structures for calibration.

## Domain diversity instruction (REQUIRED in every generator prompt)

When generating this subtype, vary stimulus domains across the batch. Choose from: medicine, ethics, economics, law, environmental science, technology, linguistics, history, policy, arts. **No more than 2 stimuli per domain in any 40-question batch.**

## References

- Dossier: `docs/research/lsat-research-dossier.md` §3.11 (lines 234–243); known-gap meta-note line 495; structural-signal note §8 (line 491).
- Authentic anchors: none. Flagged as a thin-coverage subtype.
