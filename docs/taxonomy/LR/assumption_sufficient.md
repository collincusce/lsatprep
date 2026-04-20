# LR — Assumption (Sufficient)

**Coverage target:** 147 questions across difficulties 1 / 2 / 3 (32 / 64 / 51 per `generation/coverage-matrix.json`).

## Structure

The stimulus is an argument with an obvious unbridged gap between premises and conclusion. The correct answer, added to the premises, **forces the conclusion as a matter of logical necessity** — not merely makes it plausible. Unlike necessary-assumption items, the sufficient answer is often strong, universal, and conditional in form. Stimuli almost always contain formalizable language ("only if," "unless," "every," "any"), and the correct answer is frequently the missing conditional link of a chain. Peacock/Hacker (`lr-lsac-sample-07.json`) is the paradigm. (Dossier §3.2, lines 116–128.)

## Common stem templates

- "The conclusion follows logically if which one of the following is assumed?" (dossier §3.2, line 120)
- "Which one of the following, if assumed, enables the conclusion above to be properly drawn?"
- "The conclusion drawn above follows logically if which one of the following is assumed?" (anchor stem in `lr-lsac-sample-07.json`)
- "Which one of the following principles, if valid, would most help to justify the reasoning above?" — overlaps principle_justify; use the bare "assumed" stem when the gap is logical, not ethical. (§3.2, line 121.)

## Difficulty anchors

- **1★ (≈80–100% correct):** One-step gap. Stimulus: "Everyone on the committee voted yes. Kuroda is on the committee. Therefore Kuroda voted yes." Wait — that's already valid. Easier stimuli have a transparent conditional gap like "Everyone on the committee is over 40; Kuroda is on the committee; therefore Kuroda votes conservatively." Correct answer: "Everyone over 40 votes conservatively."
- **2★ (≈50–79% correct):** Two-concept gap with modest distractor density. Stimulus bridges, e.g., "eligible → certified" and "certified → licensed"; conclusion is about licensing; student must supply the missing "eligible → licensed" or equivalent chain link.
- **3★ (under 50% correct):** Five conditional answer choices, any of which plausibly strengthens but only one of which forces the conclusion. Scope shift buried in the stimulus (as in Peacock/Hacker: "politically conservative act" vs. "politically conservative person"). Reversed-conditional trap is almost always present.

## Trap patterns

- **Reversed conditional:** Stimulus concludes `A → B`; trap offers `B → A`. The Peacock stimulus baits this with choice (D) running the conditional backwards. (§3.2, line 123.)
- **Too weak:** The answer increases likelihood but does not close the gap to certainty. Sufficient-assumption questions punish answers with "tends to," "most," "often," "usually." The correct answer almost always uses "all," "no," "every," or "only." (§3.2, line 124.)
- **Partial bridge:** Closes one premise's gap but leaves another unclosed. If the stimulus needs two links (`A → B`, `B → C`), a trap supplies only one.
- **Principle-wrapping:** Trap is phrased as a broad principle that *sounds* strong but trades in different vocabulary than the stimulus (see Peacock's (E): "the content of a poet's work...is the most decisive factor" — intuitive but insufficient).
- **Shift in subject:** Answer applies to a near-neighbor of the stimulus's subject (feminist vs. progressive in Peacock's (A)). Always verify the answer uses the same terms as the stimulus's conclusion. (§6.10.)

## Style tells (how to sound authentic)

- Conclusions often read as a direct refutation ("This is plainly false," "The critic is mistaken"). When so, the sufficient assumption must fully invalidate the implied opposing view.
- Use terms-of-art and named actors ("Molly Peacock and Marilyn Hacker"). No first-person narration.
- Correct answers almost always use universal quantifiers ("No one who is X is also Y," "Anyone who Xs never Ys") — a stark contrast to necessary-assumption items.
- Answer choices should be parallel in length and syntactic shape; three-to-five lines each.
- Avoid wrapping the key conditional in vague qualifiers. "If X, then sometimes Y" rarely forces a conclusion; "If X, then never Y" often does.

## Domain diversity instruction (REQUIRED in every generator prompt)

When generating this subtype, vary stimulus domains across the batch. Choose from: medicine, ethics, economics, law, environmental science, technology, linguistics, history, policy, arts. **No more than 2 stimuli per domain in any 40-question batch.**

## References

- Dossier: `docs/research/lsat-research-dossier.md` §3.2 (lines 116–128); difficulty driver §2 (line 91, "conditional nesting"); trap catalog §6.1 (lines 393–397), §6.10 (lines 447–451).
- Authentic anchors: `docs/research/lsac-samples/lr-lsac-sample-07.json` (Peacock/Hacker, 3★).
