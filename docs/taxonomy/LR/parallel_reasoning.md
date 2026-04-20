# LR — Parallel Reasoning

**Coverage target:** 115 questions across difficulties 1 / 2 / 3 (26 / 51 / 38 per `generation/coverage-matrix.json`).

## Structure

The stimulus is a short, **valid** argument — one, two, or three premises leading to a conclusion in a clean logical shape (conditional chain, disjunctive syllogism, analogy, or universal-to-particular). Each of the five answer choices is a mini-argument; the correct one matches the stimulus's structure regardless of subject matter. Topic, tone, and strength markers must align, but the decisive criterion is structure. Hard items punish students who match on content. (Dossier §3.6, lines 171–181.)

## Common stem templates

- "The reasoning in the argument above is most similar to the reasoning in which one of the following?" (dossier §3.6, line 174)
- "Which one of the following arguments is most similar in its reasoning to the argument above?" (§3.6, line 175)
- "The pattern of reasoning in which one of the following is most parallel to that in the argument above?"

## Difficulty anchors

- **1★ (≈80–100% correct):** Transparent conditional stimulus. E.g., "If the shipment arrives, the warehouse will be stocked; the shipment arrived; therefore the warehouse is stocked." Answer choices differ obviously in structure — only one does modus ponens.
- **2★ (≈50–79% correct):** Disjunctive or contrapositive stimulus with a few distractors that share topic but not form. Student must formalize the stimulus as, e.g., `A ∨ B; ¬A; ∴ B` and scan for the matching answer.
- **3★ (under 50% correct):** Dense quantified or nested-conditional stimulus. Answer choices are each five lines of prose, several with surface-similar structure; the correct answer matches on (a) conclusion strength, (b) premise count, (c) conditional direction, (d) quantifier type. Students who only check one or two of these dimensions miss.

## Trap patterns

- **Same topic, different structure:** The choice echoes the stimulus's subject matter but uses a different argument form. The lure is content familiarity. (Dossier §3.6, line 178.)
- **Same conclusion strength, wrong premise count:** Three-premise stimulus vs. two-premise answer, or vice versa. (§3.6, line 179.)
- **Valid but not parallel:** A valid argument with a different logical shape (modus ponens vs. modus tollens vs. universal-instantiation). (§3.6, line 180.)
- **Invalid answer paired with a valid stimulus:** Parallel-reasoning stimuli are almost always valid; a flawed answer choice never matches a valid stimulus. (If the stimulus is flawed, it becomes a parallel_flaw item — do not blur subtypes.)
- **Strength-shift:** Stimulus concludes with "must be"; trap concludes with "probably is" (or vice versa). The conclusion's modal force should match exactly.

## Style tells (how to sound authentic)

- Pick stimulus shapes from this canon: (a) universal → particular ("All A are B; x is A; ∴ x is B"); (b) conditional chain ("A → B; B → C; A; ∴ C"); (c) contrapositive ("A → B; ¬B; ∴ ¬A"); (d) disjunctive syllogism ("A or B; ¬A; ∴ B"); (e) analogy ("X is like Y in P and Q; Y has R; ∴ X has R").
- Answer choices should be distinctly different in subject matter from the stimulus — biology, law, cooking. Forcing abstraction is the point.
- Keep answer choices uniform in length (15–35 words each). Wildly uneven lengths give the game away.
- Match marker words across stimulus and correct answer: if the stimulus says "some," the correct answer should not say "all."
- Never use flawed reasoning — stimulus and correct answer must both be valid.

## Thin spots

The dossier's §3.6 coverage is brief (no authentic LSAC anchor for pure parallel_reasoning in our sample corpus). Generators should lean heavily on the formal shape canon listed above and cross-check each stimulus against a manual validity proof before committing.

## Domain diversity instruction (REQUIRED in every generator prompt)

When generating this subtype, vary stimulus domains across the batch. Choose from: medicine, ethics, economics, law, environmental science, technology, linguistics, history, policy, arts. **No more than 2 stimuli per domain in any 40-question batch.**

## References

- Dossier: `docs/research/lsat-research-dossier.md` §3.6 (lines 171–181); difficulty driver §2 (line 91, "abstract answer choices that describe reasoning in formal logic terms").
- Authentic anchors: none (thin). See §8 meta-note line 495 for acknowledgment of thin coverage.
