# LR — Must Be True

**Coverage target:** 128 questions across difficulties 1 / 2 / 3 (32 / 58 / 38 per `generation/coverage-matrix.json`).

## Structure

The stimulus is **not an argument** but a set of factual statements. The correct answer is a proposition that is **logically entailed** by those statements — if the stimulus is true, the correct answer must also be true with certainty. Tendency, probability, and "could" answers are wrong; the bar is entailment, not plausibility. Stimuli often contain conditional statements where the correct deduction is a contrapositive, a chain, or a transitive inference. The Quebec Bridge passage (`lr-lsac-sample-03.json`) sits here as a 2★: the correct answer (E) — pre-1907 rules of thumb were insufficient to fully assure bridge safety — is entailed by the stimulus's history; trap (A) overstates it to "unsafe for public use." (Dossier §3.12, lines 245–257.)

## Common stem templates

- "Which one of the following must also be true?" (dossier §3.12, line 248)
- "If the statements above are true, which one of the following must also be true?" (§3.12, line 249)
- "The statements above, if true, most strongly support which one of the following conclusions?" — **Note:** this phrasing is actually most_strongly_supported, not must_be_true. The distinguishing word is "must."
- "Which one of the following can be properly inferred from the passage?" (anchor stem on `lr-lsac-sample-03.json`)
- **EXCEPT variant:** "Each of the following must be true on the basis of the statements above EXCEPT:"

## Difficulty anchors

- **1★ (≈80–100% correct):** Two or three facts with one obvious consequence. E.g., "All oaks are deciduous. The tree in the quad is an oak." Correct answer: "The tree in the quad is deciduous." No trap requires inference beyond one step.
- **2★ (≈50–79% correct):** Historical or descriptive passage (Quebec Bridge style) where the correct answer is a modest, hedged inference. Traps overreach by adding "therefore unsafe" or "therefore the only cause."
- **3★ (under 50% correct):** Conditional chain with three or more links. Correct answer is a contrapositive or transitive inference requiring formal reasoning. EXCEPT-format is standard at this level. Distractors include a "could be true" and a "too strong" overshoot.

## Trap patterns

- **Could be true but not must:** Answer is consistent with the stimulus but not forced by it. Students accept it because it sounds plausible given what they know about the world. (Dossier §3.12, line 252.)
- **Too strong / overreach:** Extends the stimulus's claim beyond what is supported — adds "all," "never," "only," or unjustified causal language (Quebec Bridge's (A) and (D) both overreach). (§3.12, line 253; §6.5, lines 417–421.)
- **Contradicted by the stimulus:** Answer is refuted by what the stimulus actually says. Rarer, but appears when a student misreads a double negative or "unless."
- **Scope shift:** Correct inference would be about one specific subject; answer applies it to a broader or narrower one. Quebec Bridge's (C) shifts from "bridges built via rules of thumb" to "bridge engineers' analytical capability."
- **Temporal confusion:** Answer attributes a property to the wrong time period (§6.6, lines 423–427). Stimulus says "in the 1960s, X"; trap says "X" flatly.

## Style tells (how to sound authentic)

- Must-be-true stimuli are not arguments — **do not include a conclusion**. Three-to-six declarative sentences stating facts or conditionals.
- Correct answers use hedged language: "at least some," "not all," "some... that." Absolute language in an answer choice is almost always overreach.
- Use the contrapositive rule: if the stimulus says "All A are B," the correct answer can say "No non-B is A."
- Mix stimulus types: historical narratives (Quebec Bridge style), scientific descriptions, numerical facts, conditional rule statements.
- Do not use first-person or emotive language; read as a factual record.

## Domain diversity instruction (REQUIRED in every generator prompt)

When generating this subtype, vary stimulus domains across the batch. Choose from: medicine, ethics, economics, law, environmental science, technology, linguistics, history, policy, arts. **No more than 2 stimuli per domain in any 40-question batch.**

## References

- Dossier: `docs/research/lsat-research-dossier.md` §3.12 (lines 245–257); trap catalog §6.5 (lines 417–421), §6.6 (lines 423–427).
- Authentic anchors: `docs/research/lsac-samples/lr-lsac-sample-03.json` (Quebec Bridge, 2★). Dossier line 495 notes `must_be_true` anchors are thin overall.
