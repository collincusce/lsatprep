# LR — Principle (Justify)

**Coverage target:** 83 questions across difficulties 1 / 2 / 3 (19 / 38 / 26 per `generation/coverage-matrix.json`).

## Structure

The stimulus is a short argument — often a judgment, recommendation, or normative claim with a specific reason. The correct answer is a **general principle** that, if accepted, most helps to justify the argument's reasoning. The direction here is opposite to principle_conform: instead of applying a stated principle to a scenario, the student infers the principle that licenses the reasoning. Sufficient-assumption overlap is real; the difference is that principle_justify answers are phrased as broad normative rules, not narrow logical bridges. The journalist/pharma-pricing stimulus (`lr-lsac-sample-06.json`) is the canonical example: the journalist critiques nation-based drug pricing, and the correct principle (C) — consideration depends on individual needs, not society-level characteristics — underwrites that critique. (Dossier §3.15, lines 281–290.)

## Common stem templates

- "Which one of the following principles, if valid, most helps to justify the reasoning above?" (dossier §3.15, line 284)
- "Which one of the following principles, if valid, most helps to justify the [speaker]'s reasoning?"
- "The [speaker]'s argument most closely conforms to which one of the following principles?"
- "The reasoning above most closely conforms to which one of the following general principles?"

## Difficulty anchors

- **1★ (≈80–100% correct):** Clear one-move argument with an obvious principle gap. "Mei didn't plagiarize; she cited every source. Therefore she did nothing wrong." Correct principle: "If an author cites every source, the author has not plagiarized."
- **2★ (≈50–79% correct):** Argument with a normative claim + a specific reason. Correct principle licenses that move; distractors are plausible-sounding but over-broad or under-specific. Pharma-pricing is this level.
- **3★ (under 50% correct):** Argument with multiple normative steps. Correct principle must cover all of them without over-covering. Distractors include one too-broad principle that would also license unrelated conclusions, and one too-narrow principle that would justify only part of the argument.

## Trap patterns

- **Too narrow:** The principle doesn't cover the full argument. It justifies one step but leaves another unsupported. (Dossier §3.15, line 287.)
- **Too broad:** The principle covers the argument but also licenses conclusions the argument doesn't draw — and may even contradict other parts of the stimulus. (§3.15, line 288.)
- **Reversed:** The principle implies the opposite conclusion. Pharma-pricing's (D) "people in wealthy nations should not have better access" inverts the journalist's critique. (§3.15, line 289.)
- **Tangential principle:** Addresses a topically related issue that isn't the argument's core. Pharma-pricing's (A) concerns illness vs. health; (B) concerns institutional obligation — both feel ethical and related, but neither underwrites *this* argument.
- **Principle ⇒ premise mismatch:** The principle could justify a different argument with similar vocabulary but doesn't match the stimulus's actual claim structure.

## Style tells (how to sound authentic)

- Stimuli should include a normative conclusion: "this is unjustified," "the commission should...," "X is wrong to...," "Y is entitled to....". The presence of a normative claim is the signal the stem will ask for a justifying principle.
- Speakers are typically identified by role: "Journalist," "Ethicist," "Professor," "Columnist." The role reinforces the normative register.
- Correct principles are framed as general claims about what determines normative status: "X is justified only when Y," "the criterion for A is B," "C depends on D, not on E." Pharma-pricing's correct (C) fits this mold precisely.
- Avoid principles phrased as empirical generalizations ("most X are Y") — those belong to strengthen or must_be_true territory.
- Keep each principle to one sentence of 15–30 words. If a principle needs nested clauses to fit the argument, the question design is probably off.

## Domain diversity instruction (REQUIRED in every generator prompt)

When generating this subtype, vary stimulus domains across the batch. Choose from: medicine, ethics, economics, law, environmental science, technology, linguistics, history, policy, arts. **No more than 2 stimuli per domain in any 40-question batch.**

## References

- Dossier: `docs/research/lsat-research-dossier.md` §3.15 (lines 281–290); trap catalog §6.2 (out of scope), §6.10 (shift in subject).
- Authentic anchors: `docs/research/lsac-samples/lr-lsac-sample-06.json` (pharma pricing, 2★).
