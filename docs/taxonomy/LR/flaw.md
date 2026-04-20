# LR — Flaw

**Coverage target:** 166 questions across difficulties 1 / 2 / 3 (38 / 77 / 51 per `generation/coverage-matrix.json`).

## Structure

The stimulus is a flawed argument. The correct answer names or describes that error in abstract terms ("mistakes a necessary condition for a sufficient one," "treats what is true of the group as necessarily true of each member"). Classic flaw categories: false dichotomy, necessary/sufficient swap, unrepresentative sample, correlation-causation, ad hominem, equivocation, overgeneralization, circular reasoning, scope shift. The mayor's expressway (`lr-lsac-largeprint-01.json`) is a clean false-dichotomy; the democracy stimulus (`lr-lsac-sample-05.json`) illustrates the harder "overlooks that X promotes Y without being necessary or sufficient" pattern. (Dossier §3.5, lines 156–169.)

## Common stem templates

- "The reasoning in the argument is most vulnerable to criticism on the grounds that the argument..." (dossier §3.5, line 159)
- "The argument is flawed in that it..." (§3.5, line 160)
- "The reasoning above is questionable because it..." (§3.5, line 161)
- "The [speaker]'s argument is flawed because it fails to..." / "takes for granted that..."
- **EXCEPT variant:** "Each of the following describes a flaw in the argument EXCEPT:"

## Difficulty anchors

- **1★ (≈80–100% correct):** Classic named flaw in pure form. Ad hominem, circular reasoning, or false dichotomy stated in plain terms. The mayor's expressway (`lr-lsac-largeprint-01.json`) is at the easier end: "either we build it or do nothing" sets up exactly one move.
- **2★ (≈50–79% correct):** A standard flaw with two or three plausible mis-descriptions in the answer set. One trap describes a flaw that *could* apply to a similar argument; student must verify the actual move in the stimulus.
- **3★ (under 50% correct):** The flaw is a subtle confusion of relations ("neither necessary nor sufficient" vs. "does not promote" in `lr-lsac-sample-05.json`), an equivocation on a term used in two senses, or a scope shift. Answer choices use abstract logical vocabulary ("treats a sufficient condition as necessary," "infers from the absence of evidence for X the presence of evidence against X").

## Trap patterns

- **Misdescribes the argument:** The choice names a real flaw type but doesn't match what the stimulus actually did. In the democracy item, (A) "confuses necessary and sufficient" sounds like the right kind of flaw but mis-locates what the political scientist actually does. (Dossier §3.5, line 164.)
- **Plausible but absent:** A flaw that could be made about a related argument but isn't in this one. Tempting if the student has pre-primed on a flaw taxonomy.
- **Right flaw, reversed:** Describes the flaw backwards — "treats a sufficient condition as necessary" when the author did the opposite. (§3.5, line 166.)
- **Too charitable:** Describes a minor weakness (an unsupported premise, an extraneous statement) rather than the structural error. Flaw questions reward picking the central structural fault, not a peripheral one.
- **Accurate but harmless:** The choice describes something the argument technically does but which is not a flaw in context.

## Style tells (how to sound authentic)

- Stimuli should present the flawed move **cleanly**; the author should sound confident, not hedged. The confidence is what makes the flaw visible.
- Use named speakers with titles that telegraph authority ("Mayor," "Political scientist," "Advertising executive"). Flaw items often stage someone overreaching from a position of expertise.
- Correct answers use the LSAT's catalog of abstract flaw phrases: "takes for granted that," "presumes without warrant that," "treats X as if it were Y," "fails to consider," "overlooks the possibility that," "draws a general conclusion from a potentially unrepresentative sample," "mistakes a correlation for a causal relationship."
- Do not write flaw answer choices as restatements of what the argument said. The answer should describe the reasoning, not paraphrase the content.
- Keep stimulus length tight (40–90 words).

## Domain diversity instruction (REQUIRED in every generator prompt)

When generating this subtype, vary stimulus domains across the batch. Choose from: medicine, ethics, economics, law, environmental science, technology, linguistics, history, policy, arts. **No more than 2 stimuli per domain in any 40-question batch.**

## References

- Dossier: `docs/research/lsat-research-dossier.md` §3.5 (lines 156–169); flaw-catalog context §2 (line 91); trap catalog §6.1 (lines 393–397, sufficient/necessary), §6.7 (lines 429–433, reversed causation).
- Authentic anchors: `docs/research/lsac-samples/lr-lsac-sample-05.json` (democracy, 3★); `lr-lsac-largeprint-01.json` (mayor/expressway, 2★).
