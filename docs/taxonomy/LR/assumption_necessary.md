# LR — Assumption (Necessary)

**Coverage target:** 159 questions across difficulties 1 / 2 / 3 (38 / 70 / 51 per `generation/coverage-matrix.json`).

## Structure

The stimulus is a short argument — typically 40–90 words — that moves from one or two premises to a conclusion. There is an unstated gap between the premises and the conclusion; the correct answer is a proposition the argument **must** assume in order for the conclusion to be supported. The diagnostic tool is the negation test: if negating the answer choice destroys the argument, it is necessary. The correct answer is usually modest in scope — it removes a specific alternative or links two concepts already in the stimulus rather than proving the conclusion outright. (See dossier §3.1, lines 101–114.)

## Common stem templates

- "Which one of the following is an assumption required by the argument?" (dossier §3.1, line 104)
- "The argument depends on assuming which one of the following?" (§3.1, line 105)
- "Which one of the following is an assumption on which the argument relies?" (§3.1, line 106)
- "The [speaker]'s argument requires the assumption that"

## Difficulty anchors

- **1★ (≈80–100% correct):** Single-premise argument with one obvious gap. E.g., "Dr. Kwon concludes that the new antibiotic works because every patient in her trial recovered; she assumes the patients would not have recovered on their own." Negation test snaps the conclusion.
- **2★ (≈50–79% correct):** Two-premise argument with several topically-related distractors. The hippopotamus case (`lr-lsac-largeprint-02.json`) is the prototype: curator infers religious function from broken legs; required assumption is that the legs didn't break by natural post-burial accident. One or two traps are close cousins of the correct answer.
- **3★ (under 50% correct):** Argument with a chronological or conditional subtlety (see `lr-lsac-sample-08.json`, lake-sediment bones). The necessary assumption concerns *when* or *how* an evidentiary fact was produced, not *what* it states. Negation test requires re-reading the stimulus to see what the argument was actually doing.

## Trap patterns

- **Too strong / sufficient:** Answer proves the conclusion outright instead of merely enabling it. A giveaway is universal language ("all," "no," "always") when the argument needed only a narrow bridge. (Dossier §3.1, line 109; §6.5.)
- **Out of scope:** Topically continuous with the stimulus but untouched by the reasoning. In the hippo stimulus, "tomb was not reentered" is scope-drift — entry history is not a link in the broken-legs inference. (§6.2, line 403.)
- **Reversed direction:** States the assumption backwards — `B → A` when the argument needs `A → B`. Especially common when the stimulus contains a conditional premise. (§3.1, line 111.)
- **Defender disguised as strengthener:** Looks like an argument-booster rather than a gap-filler. Necessary assumptions are often defensive (ruling out a specific alternative), so students pass them over for something "stronger-sounding."
- **Shift in subject:** Swaps the stimulus's exact subject for a close relative (§6.10, line 447). E.g., stimulus is about "this hippopotamus"; trap is about "earthenware figures in general."

## Style tells (how to sound authentic)

- Stimuli often open with a framed speaker ("Museum curator:", "Economist:"). Conclusions land last, marked by "therefore," "thus," "so," or "we conclude."
- Premises are stated flatly; the stimulus hedges the conclusion ("probably," "likely," "must have been"), not the evidence.
- Every sentence either delivers a premise, ties premises, or states the conclusion. No filler.
- The necessary assumption is phrasable defensively: "not that X is proven, only that Y is not the case." Negation should flip the conclusion from plausible to unsupported.
- Distractors should match stimulus subject matter closely enough that topic-scanning won't eliminate them.

## Domain diversity instruction (REQUIRED in every generator prompt)

When generating this subtype, vary stimulus domains across the batch. Choose from: medicine, ethics, economics, law, environmental science, technology, linguistics, history, policy, arts. **No more than 2 stimuli per domain in any 40-question batch.**

## References

- Dossier: `docs/research/lsat-research-dossier.md` §3.1 (lines 101–114); trap catalog §6.2 (lines 399–403), §6.5 (lines 417–421), §6.10 (lines 447–451).
- Authentic anchors: `docs/research/lsac-samples/lr-lsac-sample-08.json` (lake sediments, 3★); `lr-lsac-largeprint-02.json` (hippopotamus, 2★).
