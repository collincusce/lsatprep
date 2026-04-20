# LR — Most Strongly Supported

**Coverage target:** 115 questions across difficulties 1 / 2 / 3 (32 / 51 / 32 per `generation/coverage-matrix.json`).

## Structure

The stimulus is a set of facts, not an argument. The correct answer is the claim the facts most strongly support — the **most defensible inference**, even if not entailed with certainty. This subtype differs from must_be_true in its bar: must_be_true demands logical entailment; most_strongly_supported demands strong inductive support. Correct answers almost always use hedged language ("some," "in some cases," "at least one," "tends to"). Extreme answers are nearly always wrong. Stimuli are frequently scientific, statistical, or observational. (Dossier §3.13, lines 259–268.)

## Common stem templates

- "Which one of the following is most strongly supported by the information above?" (dossier §3.13, line 262)
- "The statements above, if true, most support which one of the following?" (§3.13, line 263)
- "The information above most strongly supports which one of the following claims?"
- "Which one of the following inferences is most supported by the information above?"

## Difficulty anchors

- **1★ (≈80–100% correct):** Three or four related facts with one clear implication. E.g., a study found X correlates with Y; correct answer draws a hedged conclusion about the correlation. Distractors are either irrelevant or clearly overreach.
- **2★ (≈50–79% correct):** Stimulus presents a mix of data and qualifications. The correct answer is a modest inference that respects the qualifications. Trap answers either drop a qualifier or add one the stimulus doesn't justify.
- **3★ (under 50% correct):** Stimulus contains multiple datapoints in tension; the correct answer resolves the tension in a specific direction without overclaiming. Distractors include a "too strong" near-miss, a "plausible worldly truth" not actually supported, and a claim that inverts the direction of support.

## Trap patterns

- **Too strong:** The choice uses absolute language where the stimulus justifies only hedged language. This is the dominant trap for this subtype — extreme answers nearly always lose. (Dossier §3.13, line 265.)
- **Plausible but unsupported:** Appealing worldly truth that a student recognizes as generally accurate but which is not derivable from the stimulus. (§3.13, line 266.)
- **Opposite direction:** Correct answer would move in one direction; trap moves in the other. E.g., stimulus supports "X is less effective than previously believed"; trap says "X is more effective."
- **Scope creep:** Applies a claim about a specific group to a larger one, or about a specific period to all periods. (§6.6, lines 423–427, temporal confusion.)
- **Relative/absolute confusion:** Stimulus supports a comparative claim; trap reads as absolute. (§6.8, lines 435–439.)

## Style tells (how to sound authentic)

- Stimuli should read as flat, neutral reportage: "A recent survey of registered voters in..." or "Data from the Department of Fisheries show...". No argument, no conclusion marker.
- Include a mix of quantitative and qualitative hedges: "approximately half," "more often than not," "roughly twice as many," "in most cases," "tends to."
- Correct answers almost always begin or include one of: "some X are Y," "at least some," "not all," "many X are not Y," "X is not sufficient for Y." Avoid "all" and "none" in correct answers.
- Introduce one controlled twist per stimulus: a counterintuitive correlation, an exception to a broader trend, a specific subgroup that diverges. This gives the inference something to anchor on.
- Distractors should span: one too-strong, one out-of-scope, one opposite-direction, one mis-scoped, one plausible-but-unsupported.

## Thin spots

The dossier's §3.13 is concise and **no authentic anchor exists** (line 495 flags "0 most_strongly_supported"). Distinguishing MSS from must_be_true is the key calibration challenge. Flag for Task 23: synthetic anchors in both weak- and strong-support styles would help.

## Domain diversity instruction (REQUIRED in every generator prompt)

When generating this subtype, vary stimulus domains across the batch. Choose from: medicine, ethics, economics, law, environmental science, technology, linguistics, history, policy, arts. **No more than 2 stimuli per domain in any 40-question batch.**

## References

- Dossier: `docs/research/lsat-research-dossier.md` §3.13 (lines 259–268); known-gap meta-note line 495; trap catalog §6.5 (lines 417–421, too strong), §6.6 (lines 423–427), §6.8 (lines 435–439).
- Authentic anchors: none. Flagged as a thin-coverage subtype.
