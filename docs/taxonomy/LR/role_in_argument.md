# LR — Role in Argument

**Coverage target:** 103 questions across difficulties 1 / 2 / 3 (26 / 45 / 32 per `generation/coverage-matrix.json`).

## Structure

The stimulus is an argument containing a specifically-quoted or paraphrased claim (the target claim). The correct answer describes the **function** that claim plays in the argument's structure: is it the main conclusion, a subsidiary/intermediate conclusion, a premise supporting the main conclusion, a premise supporting an intermediate conclusion, a concession the author then rebuts, background context, or an opposing view the author is arguing against? The hardest stimuli feature an intermediate conclusion — a claim that is both supported by some premises *and* supports the main conclusion. (Dossier §3.9, lines 209–218.)

## Common stem templates

- "The claim that [X] plays which one of the following roles in the argument?" (dossier §3.9, line 212)
- "The reference to [X] functions in the argument to..." (§3.9, line 213)
- "Which one of the following most accurately describes the role played in the [speaker]'s argument by the statement that [X]?"

## Difficulty anchors

- **1★ (≈80–100% correct):** Two-sentence argument. Target claim is either the main conclusion (in which case "therefore" or "thus" precedes it) or a single supporting premise. Only one answer choice fits the textual position.
- **2★ (≈50–79% correct):** Argument with a concession ("some argue that X, but in fact Y because Z"). Target claim is the concession — neither pure premise nor pure conclusion. Student must recognize the author is acknowledging and rebutting.
- **3★ (under 50% correct):** Argument with a main conclusion + intermediate conclusion + evidence for the intermediate. Target claim is the intermediate conclusion, which simultaneously serves as a conclusion (supported by evidence) and a premise (supporting the main conclusion). Two answer choices partially fit; only one captures both functions.

## Trap patterns

- **Confuses premise with conclusion (or with subsidiary conclusion):** Calls the target a premise when it's an intermediate conclusion, or calls it the main conclusion when it's subsidiary. (Dossier §3.9, line 216.)
- **Accurate content, wrong function:** Describes what the target claim *says* rather than how it's *used*. (§3.9, line 217.)
- **Partial function:** Correctly identifies one function the target serves but misses that it serves another (e.g., "it is a premise" — true but incomplete if the claim is also an intermediate conclusion).
- **Opposing view confusion:** Trap says "a view the author accepts" when the author is rebutting it, or vice versa. Flags: "some argue," "critics claim," "it is often said" typically introduce views the author will dispute.
- **Background vs. support:** Trap calls a scene-setting statement a "premise that supports the conclusion" when it's merely contextual.

## Style tells (how to sound authentic)

- Include at least one explicit signal word: "therefore," "thus," "hence," "so," "however," "nonetheless," "but." These markers make structure recoverable.
- Use concession-rebuttal structures for 2★: "Admittedly X; however Y. Since W, we should conclude Z."
- For 3★, build two-level chains: "Evidence → intermediate conclusion → main conclusion." Target claim sits in the middle.
- The quoted target claim in the stem must be verbatim from the stimulus.
- Correct-answer phrasings pull from LSAT's catalog: "it is the main conclusion," "it is a premise offered in support of the main conclusion," "it is a conclusion for which support is provided, and which is itself used to support another conclusion," "it is a position the argument is designed to discredit," "it is a claim the author acknowledges but rejects."

## Thin spots

The dossier's §3.9 has **no authentic anchor** in the sample corpus — the meta-note at line 495 explicitly flags "0 role_in_argument" anchors. Generators will need to lean on the stem templates and structural patterns above. Flag for Task 23: synthetic exemplars are necessary here.

## Domain diversity instruction (REQUIRED in every generator prompt)

When generating this subtype, vary stimulus domains across the batch. Choose from: medicine, ethics, economics, law, environmental science, technology, linguistics, history, policy, arts. **No more than 2 stimuli per domain in any 40-question batch.**

## References

- Dossier: `docs/research/lsat-research-dossier.md` §3.9 (lines 209–218); known-gap meta-note line 495.
- Authentic anchors: none. Flagged as a thin-coverage subtype.
