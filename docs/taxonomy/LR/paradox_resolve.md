# LR — Paradox / Resolve

**Coverage target:** 140 questions across difficulties 1 / 2 / 3 (38 / 64 / 38 per `generation/coverage-matrix.json`).

## Structure

The stimulus presents **two seemingly-conflicting facts** — observations, statistics, or outcomes that appear inconsistent with one another. There is no argument and no conclusion; just a surprising juxtaposition. The correct answer, if true, **explains how both facts can be true** by introducing a confounding variable, a selection effect, a hidden third factor, a temporal-scope difference, or a definitional distinction. The headlights paradox (`lr-lsac-sample-09.json`) is the canonical 1★/2★: voluntary headlight users have fewer collisions, yet mandatory headlights don't reduce collisions. Resolution (C): only careful drivers voluntarily use headlights — self-selection. (Dossier §3.16, lines 292–302.)

## Common stem templates

- "Which one of the following, if true, most helps to resolve the apparent discrepancy in the information above?" (dossier §3.16, line 295; anchor stem in `lr-lsac-sample-09.json`)
- "Which one of the following, if true, would most help to explain the surprising phenomenon?" (§3.16, line 296)
- "Which one of the following, if true, most helps to reconcile the apparent conflict above?"
- "Which one of the following, if true, would most help to explain why [apparent conflict]?"

## Difficulty anchors

- **1★ (≈80–100% correct):** Two facts with one obvious confounder. E.g., a town's park attendance fell despite the park being expanded; correct answer notes a competing attraction opened the same year. Only one answer addresses both halves of the apparent conflict.
- **2★ (≈50–79% correct):** Statistical or policy paradox with a self-selection or reverse-causation explanation. Headlights stimulus is here: the correct answer (C) identifies that voluntary users are a biased sample. Distractors explain one half of the paradox but leave the other unexplained.
- **3★ (under 50% correct):** Paradox involving multiple interacting mechanisms. Correct resolution requires a compound explanation (e.g., a demographic shift plus a policy change). Distractors include a "deepens the paradox" (worsens rather than resolves) and one "resolves one horn only."

## Trap patterns

- **Deepens the paradox:** Answer adds information that makes the conflict worse, not better. Headlights' (E) — mandatory-headlight jurisdictions have poor visibility — would make mandatory headlights more useful, sharpening rather than dissolving the paradox. (Dossier §3.16, line 298.)
- **Irrelevant:** True-sounding fact that doesn't touch the conflict. (§3.16, line 299.)
- **Resolves one horn only:** Explains one of the two facts but leaves the other unexplained. A good resolution has to account for both. (§3.16, line 300.)
- **Opposite-direction resolution:** Explains the inverse of the observed pattern. E.g., stimulus notes "A is up while B is down"; trap explains why "A is down while B is up."
- **Presupposes what needs to be resolved:** Answer assumes the very inconsistency it's meant to dissolve (circular resolution).

## Style tells (how to sound authentic)

- Stimuli should use a contrast marker: "Yet," "However," "Nonetheless," "Despite this," "Even so," "On the other hand." The contrast marker is what flags that a paradox is present.
- Pair concrete data in each half: numbers, percentages, rates, or documented outcomes. Authentic paradox stimuli quantify both horns (e.g., "less likely to be involved in a collision" + "does nothing to reduce the overall number of collisions").
- Keep stimulus length to 40–80 words. Paradox stimuli are tight by nature.
- Correct answer often begins with "Only," "When...", or "The ...in question are." These point to the confounding subpopulation or hidden condition that dissolves the conflict.
- Avoid stimuli where the "paradox" is merely surprising but not actually inconsistent. A good paradox has the structure "if X, then we'd expect Y, yet we observe ¬Y."
- Mix resolution mechanisms across a batch: self-selection, reverse causation, confounding variable, temporal/contextual difference, measurement artifact, definitional mismatch.

## Domain diversity instruction (REQUIRED in every generator prompt)

When generating this subtype, vary stimulus domains across the batch. Choose from: medicine, ethics, economics, law, environmental science, technology, linguistics, history, policy, arts. **No more than 2 stimuli per domain in any 40-question batch.**

## References

- Dossier: `docs/research/lsat-research-dossier.md` §3.16 (lines 292–302); difficulty anchor §7.1 (lines 465–469); trap catalog §6.7 (lines 429–433, reversed causation).
- Authentic anchors: `docs/research/lsac-samples/lr-lsac-sample-09.json` (headlights paradox, 1★/2★).
