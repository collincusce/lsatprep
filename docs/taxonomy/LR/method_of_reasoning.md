# LR — Method of Reasoning

**Coverage target:** 103 questions across difficulties 1 / 2 / 3 (26 / 45 / 32 per `generation/coverage-matrix.json`).

## Structure

The stimulus is a short argument (usually attributed to a named speaker). The correct answer **describes the argument's technique** in abstract terms — the way the author moves from premise to conclusion, not what the conclusion is. Typical techniques: drawing an analogy between two cases, generalizing from a specific instance, citing a counterexample to an opposing view, appealing to a definition, arguing by elimination, applying a principle to a case. The executive's print-ad stimulus (`lr-lsac-sample-02.json`) is the clean 2★ example: correct (D) says the executive "uses a case in which direct evidence is available to draw a conclusion about an analogous case in which direct evidence is unavailable." (Dossier §3.8, lines 197–207.)

## Common stem templates

- "The argument proceeds by..." (dossier §3.8, line 200)
- "The [speaker]'s reasoning does which one of the following?" (§3.8, line 201)
- "Which one of the following describes a technique of reasoning used in the argument?" (§3.8, line 202)
- "The [speaker]'s argument derives its conclusion by..."

## Difficulty anchors

- **1★ (≈80–100% correct):** One-move argument. Author cites an authority, draws an analogy, gives a counterexample, or appeals to a definition. Only one answer choice describes that technique; the rest describe techniques the argument plainly does not use.
- **2★ (≈50–79% correct):** Two-move argument. Author sets up an opposing position, then attacks it. The correct answer captures the full move ("rejects a claim by showing it is inconsistent with a generally accepted principle"). Print-ad stimulus is this level.
- **3★ (under 50% correct):** Multi-step argument with an intermediate conclusion and an embedded concession. Answer choices use dense formal vocabulary ("argues that a phenomenon is a counterexample to a universal claim by providing a single verifiable instance"). Student must track what each part of the argument does.

## Trap patterns

- **Partially true:** Describes one move the argument makes but not the main technique. A student in a hurry sees a sentence that sounds accurate and stops. (Dossier §3.8, line 205.)
- **Extreme verbs:** "Proves," "disproves," "refutes," "establishes" when the argument only suggests or supports. Authentic LSAT method answers prefer "offers evidence that," "suggests," "uses" over absolute verbs. (§3.8, line 206.)
- **Accurate description of a different argument:** The choice describes a plausible technique, but one from a hypothetical sister argument, not this one.
- **Content over technique:** Trap paraphrases *what the argument says* rather than *how it reasons*. Method-of-reasoning answers should describe the logical operation, never the topic.
- **Mis-scaled:** Describes the argument as a generalization when it's a specific inference, or vice versa.

## Style tells (how to sound authentic)

- Use named speakers with professional titles — they carry the register. "Economist," "Executive," "Historian," "Physician."
- The argument should contain **exactly one** main reasoning move. Multi-move arguments belong in role_in_argument territory.
- Correct answer verbs: "draws an analogy," "applies a general principle to a specific case," "cites a counterexample to a universal claim," "rejects a position by deriving an absurd consequence," "infers a cause from a correlation," "argues from a sample to a population."
- Avoid content-echoing answers. An answer like "claims that print ads underperformed because the website ads underperformed" is a paraphrase, not a method description.
- Keep answer choices structurally parallel: all should begin with a verb phrase describing the move (e.g., "bases," "infers," "uses," "argues").

## Thin spots

The dossier provides one anchor (`lr-lsac-sample-02.json`) and §3.8 is brief. For 3★ generation, generators should draft the abstract-verb vocabulary carefully and mirror LSAT patterns rather than inventing new phrasings.

## Domain diversity instruction (REQUIRED in every generator prompt)

When generating this subtype, vary stimulus domains across the batch. Choose from: medicine, ethics, economics, law, environmental science, technology, linguistics, history, policy, arts. **No more than 2 stimuli per domain in any 40-question batch.**

## References

- Dossier: `docs/research/lsat-research-dossier.md` §3.8 (lines 197–207); difficulty driver §2 (line 91, "abstract answer choices that describe reasoning in formal logic terms").
- Authentic anchors: `docs/research/lsac-samples/lr-lsac-sample-02.json` (print-vs-web ads, 2★).
