# RC — Comparative (paired passages)

**Coverage target:** 169 Qs across ~24 passage pairs (38 / 85 / 46 for 1★ / 2★ / 3★ per `generation/coverage-matrix.json`). Each paired unit is two short passages (A and B) of roughly equal length; together they total 400–500 words, with each individual passage running ~200–250 words. Each pair carries ~7 questions.

## Passage characteristics

Comparative passages present two short texts on the same topic, typically from different disciplines, eras, or stances. LSAC's own RC overview names three structural relationships the pair can instantiate: **generalization / instance**, **principle / application**, and **point / counterpoint** (dossier §4.1, line 316). The global-warming anchor (`rc-lsac-global-warming-comparative.json`) is a point/counterpoint: passage A asserts human-caused warming is established; passage B argues the case is overstated and natural variability matters more. Pairs can also mix genres — a humanities passage paired with a social-sciences one on the same subject, or a natural-science passage paired with a law/policy one. The hallmark is that both passages are aware of the shared topic even if they don't explicitly reference each other.

## Structural norms

- **Two passages**, each 2–4 paragraphs; together 400–500 words total.
- Passage A and passage B are **not labeled as responses to each other** — they are independent texts the student must compare. Neither should quote or cite the other.
- Topic sentence placement: passage A opens with its framing of the shared topic; passage B opens with its own framing, which the reader retrospectively recognizes as tension with A. The global-warming anchor's passage B opens "Over the past two decades, an extreme view of global warming has developed" — that opening alone signals the oppositional structure.
- Transition markers typical of this genre: within each passage, the standard markers of its genre; across passages, the comparison is the **reader's inference**. Question stems ("Which one of the following questions is central to both passages?", "The authors would be most likely to disagree over...") make the cross-passage structure explicit.

## Difficulty drivers

- **1★:** Generalization/instance or principle/application pairs where the relationship is transparent — passage A states a general account, passage B offers a concrete case that instantiates it. Minimal tension between the authors.
- **2★:** Point/counterpoint pairs where the disagreement is stated clearly and bounded (authors agree on the facts, disagree on interpretation, as in the global-warming pair). Student must distinguish what both authors accept from what each adds.
- **3★:** Pairs where the authors talk past each other — different framings of the same topic that require the student to identify a question that neither explicitly asks but both implicitly answer differently. Or pairs where the passages share vocabulary but use key terms with subtly different senses (e.g., "equality" means "formal legal equality" in A and "substantive equality of outcome" in B).

## Style tells (authentic LSAT RC voice for this genre)

- Each passage is a miniature of its own genre — a comparative pair made of a humanities passage and a natural-science passage should read as a humanities passage and a natural-science passage, not as two generic paragraphs. Generators should pick the two constituent genres first, then write each to the standards of that genre's rubric card.
- Passage B often **signals its oppositional role** with a categorizing opener: "Over the past two decades, an extreme view of X has developed," "A popular account of X holds...," "While it is widely believed that...". This is the genre's most reliable tell.
- Authors argue from evidence they each bring in, not by rebutting specific sentences of the other passage. Each passage should stand alone; the cross-passage interaction lives in the questions, not in the prose.
- Shared terminology is introduced independently in each passage — both passages can define the same term, sometimes differently, without acknowledging they are doing so.
- Length parity matters: the two passages should be within ~50 words of each other. Obvious asymmetry (A: 300 words, B: 150 words) reads as inauthentic.

## Domain sub-topic diversity (REQUIRED in every generator prompt)

Within this genre, vary the shared-topic domain **and** the relationship type across the batch. Acceptable topic domains:

- Climate science and policy (point/counterpoint, natural science + law/policy)
- Free speech and its limits (law paired with philosophy)
- Urban vs. rural historiography (two social-sciences passages, different methods)
- Authorship and attribution disputes (humanities + statistical/quantitative analysis)
- Evolutionary explanations of behavior (natural science + social science)
- Traditional vs. revisionist reading of a historical figure or movement
- Market regulation (economics + legal doctrine)
- Bilingualism / language policy (linguistics + policy)
- Science vs. intuition in medicine or psychology
- Art-historical canon formation (humanities + social-sciences sociology of taste)
- Indigenous legal traditions vs. common-law frameworks (two law passages)
- Genetic privacy and bioethics (natural science + law)

Across a 10-pair batch, include **at least 3 point/counterpoint**, **at least 2 generalization/instance**, and **at least 2 principle/application** relationships. No more than 2 pairs on the same shared topic per batch.

## References

- Dossier: `docs/research/lsat-research-dossier.md` §4.1 (line 316), §4.3 (lines 333–339), §2 RC difficulty drivers (line 92).
- Authentic anchor: `docs/research/lsac-samples/rc-lsac-global-warming-comparative.json` (IPCC vs. skeptic on global warming, 3★, point/counterpoint).
