# LR — Point at Issue

**Coverage target:** 83 questions across difficulties 1 / 2 / 3 (19 / 38 / 26 per `generation/coverage-matrix.json`).

## Structure

The stimulus is a **dialogue between two named speakers** (Laird and Kim, Moreno and Peña, Dr. Chen and Dr. Okonkwo). Each speaker takes a position. The correct answer is a proposition that one speaker **explicitly or implicitly affirms** and the other **explicitly or implicitly denies**. Both speakers must take a position on the proposition; if only one does, or if both agree, the answer is wrong. The Laird/Kim dialogue on pure research (`lr-lsac-sample-01.json`) is the canonical anchor: they disagree on whether pure research's most valuable achievements are medical (priority-ranking, not mere value). (Dossier §3.10, lines 220–232.)

## Common stem templates

- "A and B disagree over whether..." (dossier §3.10, line 223)
- "The dialogue provides the most support for the claim that A and B disagree about..." (§3.10, line 224)
- "On the basis of their statements, A and B are committed to disagreeing about which one of the following?"
- "A and B's statements provide the most support for the claim that they would disagree about whether..."
- (Disagree-variant and agree-variant both exist; the common stem is the disagree form.)

## Difficulty anchors

- **1★ (≈80–100% correct):** Short dialogue, sharply opposed positions, one central topic. Speakers use the same vocabulary and clearly contradict each other. Four distractors are out-of-scope; one is correct.
- **2★ (≈50–79% correct):** Speakers overlap on much, disagree on one specific axis. The correct answer identifies that axis; one trap offers a point of **agreement**; another is an out-of-scope issue that only one speaker addresses. Laird/Kim is this level: both agree pure research has life-saving value, but disagree on whether its *most valuable* role is medical.
- **3★ (under 50% correct):** Speakers have nuanced partially-overlapping views. The disagreement may be about degree (who assigns more weight to what), about a presupposition (a claim one assumes but the other rejects), or about a conditional (if P then Q for one, if P then not Q for the other). Three answer choices are near-misses.

## Trap patterns

- **One-sided:** Only one speaker takes a position; the other doesn't address the proposition. Most common trap type. (Dossier §3.10, line 226.)
- **Agreement in disguise:** Both speakers would actually accept the proposition. The Laird/Kim trap (A) "derives significance in part from providing new technologies" is an agreement. (§3.10, line 227; §6.10, line 451.)
- **Out of scope:** Neither speaker addresses it, or it's a tangential point. (§3.10, line 228.)
- **Shift in subject:** The proposition swaps a near-neighbor of what the speakers debate (Laird/Kim's (E) shifts from "most valuable" to "any value"). (§6.10, lines 447–451.)
- **One-side explicit, other-side unclear:** Speaker A clearly affirms; Speaker B's statement is ambiguous. If B's view is not derivable with confidence, the answer isn't defensible as a point at issue.

## Style tells (how to sound authentic)

- Two named speakers separated by colons ("Laird:" / "Kim:"), roughly equal in length (2–4 sentences each).
- Each speaker needs a clear thesis and at least one reason. Positions should be derivable from reasoning, not just declared.
- Speakers engage the same topic from different angles. The second often opens with a disagreement marker ("Your priorities are mistaken," "I disagree").
- For 2★ and 3★, share some common ground — that's what creates the "agreement in disguise" trap. Authentic LSAT dialogues are rarely total opposites.
- The correct answer should be phrasable as a yes/no proposition — one says yes, one says no.

## Domain diversity instruction (REQUIRED in every generator prompt)

When generating this subtype, vary stimulus domains across the batch. Choose from: medicine, ethics, economics, law, environmental science, technology, linguistics, history, policy, arts. **No more than 2 stimuli per domain in any 40-question batch.**

## References

- Dossier: `docs/research/lsat-research-dossier.md` §3.10 (lines 220–232); difficulty anchor §7.2 (lines 471–475); trap catalog §6.10 (lines 447–451).
- Authentic anchors: `docs/research/lsac-samples/lr-lsac-sample-01.json` (Laird/Kim, 2★).
