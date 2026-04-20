# LR — Principle (Conform)

**Coverage target:** 103 questions across difficulties 1 / 2 / 3 (26 / 45 / 32 per `generation/coverage-matrix.json`).

## Structure

The stimulus states a **principle** — a general rule about when some action is appropriate, some judgment is justified, or some outcome follows. The five answer choices describe concrete scenarios; exactly one **conforms to** the principle (its facts satisfy the principle's antecedent and its outcome matches the principle's consequent). Principles take forms like: "An action is X only if it Y," "Anyone who does A should do B," "When C obtains, D is justified." Stimulus and answers are usually ethical, legal, or policy-flavored. (Dossier §3.14, lines 270–279.)

## Common stem templates

- "Which one of the following judgments most closely conforms to the principle above?" (dossier §3.14, line 273)
- "Which one of the following conforms most closely to the principle stated above?" (§3.14, line 274)
- "The principle above, if valid, most helps to justify which one of the following judgments?"
- "Which one of the following situations most closely conforms to the principle stated by the [speaker]?"

## Difficulty anchors

- **1★ (≈80–100% correct):** Single-antecedent principle. "An apology is called for only when one has caused harm." Correct answer describes someone who caused harm and apologized; distractors miss the antecedent, skip the consequent, or invert the conditional.
- **2★ (≈50–79% correct):** Two-part antecedent. "A consumer should receive compensation if (a) the product failed within warranty and (b) the failure was not caused by misuse." Correct answer satisfies both parts; traps satisfy only one.
- **3★ (under 50% correct):** Principle with exception or nested clause. "Scientists should publish negative findings unless publication would cause disproportionate harm, except when the finding contradicts a broadly-held view." Correct answer threads the full logical path. Distractors take wrong turns at each branch.

## Trap patterns

- **Reversed application:** Applies the principle's contrapositive incorrectly, or applies the converse. If the principle is "if X, then Y," a trap describes "if Y, then X" conformance. (Dossier §3.14, line 276.)
- **Partial fit:** Satisfies only the antecedent or only the consequent, not both. In a "should be compensated if both A and B" principle, a trap describes someone meeting A but not B. (§3.14, line 277.)
- **Outside the principle's scope:** Answer describes a scenario that the principle doesn't address at all (principle is about public officials; answer is about private citizens).
- **Violates the principle:** Answer describes conduct the principle would condemn. If the principle says "only if X is Y justified," a trap shows Y justified without X.
- **Extra fact misdirection:** Answer introduces irrelevant facts that create noise; student gets distracted and misses that the core conditional isn't satisfied.

## Style tells (how to sound authentic)

- Frame the principle as normative, not statistical. "Should," "is justified in," "ought," "must," "is entitled to" are the LSAT's preferred principle verbs.
- Answer scenarios are self-contained vignettes of 25–45 words each — person, action, context, outcome. Conform rewards concreteness.
- Vary answer-scenario domains from the principle's domain. Principle about doctors → scenarios about teachers, landlords, contractors.
- The scenario should match the principle's terms exactly — "caused harm" should map to a clear "caused harm," not a near-synonym like "inconvenienced."
- For 3★, embed exceptions or "unless" clauses in the principle.

## Thin spots

The dossier's §3.14 is brief and **no authentic anchor exists** (line 495 flags "0 principle_conform"). Generators should draft the principle with careful conditional structure and ensure the correct answer strictly implements it.

## Domain diversity instruction (REQUIRED in every generator prompt)

When generating this subtype, vary stimulus domains across the batch. Choose from: medicine, ethics, economics, law, environmental science, technology, linguistics, history, policy, arts. **No more than 2 stimuli per domain in any 40-question batch.**

## References

- Dossier: `docs/research/lsat-research-dossier.md` §3.14 (lines 270–279); known-gap meta-note line 495; difficulty driver §2 (line 91, conditional nesting).
- Authentic anchors: none. Flagged as a thin-coverage subtype.
