# RC — Natural Science

**Coverage target:** 231 Qs across ~33 passages (54 / 108 / 69 for 1★ / 2★ / 3★ per `generation/coverage-matrix.json`). Passages average 400–500 words; each passage carries ~7 questions.

## Thin spots

The Stage-1 research corpus contains **no pure natural-science RC anchor** (dossier §1, line 47 and §4.1, line 314). The closest authentic exemplar is passage A of the global-warming comparative pair (`rc-lsac-global-warming-comparative.json`), which is climate-science-flavored but framed as a policy-adjacent argument. Task 23 (few-shot bundles) will need to backfill: the few-shot bundle for this genre should supplement the single partial anchor with synthesized exemplars drawn from the stem templates and stylistic markers in dossier §4 and the structural norms below. Stage-5 critic review should scrutinize natural-science output more aggressively than other genres on "does this sound like LSAC, or like a textbook?"

## Passage characteristics

Natural-science passages cover biology, chemistry, physics, geology, ecology, astronomy, and neuroscience (dossier §4.1, line 314). The author's stance is typically **explanatory**: they describe an experimental finding or a theoretical model, situate it against a prior hypothesis, and often note a limitation or open question. A common shape is **"phenomenon observed → prior explanation → new evidence / mechanism → remaining uncertainty."** The author is not a partisan; they are a knowledgeable expositor who occasionally editorializes in the final paragraph. LSAC natural-science passages are noticeably less technical than a Scientific American article — terms are defined inline and mathematics is described in prose, never in symbols.

## Structural norms

- Typical paragraph count: **3–4**.
- Typical passage length: **400–500 words**.
- Topic sentence placement: the phenomenon or question appears in **sentence 1 of paragraph 1**; the leading hypothesis is usually introduced at the end of paragraph 1 or start of paragraph 2; paragraph 3 introduces the complication or alternative; paragraph 4 (if present) editorializes or flags what remains unknown.
- Transition markers typical of this genre: "recently," "however," "subsequent research has shown," "according to this hypothesis," "if this is correct, then," "one implication is," "nonetheless," "a key limitation is." More causal and conditional connectives than humanities or law.

## Difficulty drivers

- **1★:** Single phenomenon, single mechanism explained step by step. One technical term per paragraph, defined on first use. Experimental reasoning is explicit ("because X was observed, researchers concluded Y").
- **2★:** Two competing hypotheses with differing predictions; the author walks through evidence bearing on each. Some technical vocabulary used without re-definition after its introduction. Distinction between correlation and causation implicit in the methodology discussion.
- **3★:** Nested mechanisms (a process at one scale explained by a process at another scale — e.g., a population-level pattern explained by a cellular mechanism). Multiple confounds mentioned. The editorial paragraph separates what the evidence establishes from what the author infers. Dense noun phrases ("the rate of stellar nucleosynthesis," "an enzymatic cascade initiated by...") the student must parse quickly.

## Style tells (authentic LSAT RC voice for this genre)

- Third-person impersonal register, passive voice common for method descriptions ("were measured," "is thought to be") but active voice for the author's own assessments ("this suggests," "a more plausible account holds").
- Technical terms introduced with minimal ceremony and immediately glossed: "homeothermy (the ability to maintain a constant internal temperature)." The gloss is almost always a dependent clause or parenthetical, not a whole sentence.
- Hedged claims about causation: "appears to be associated with," "is consistent with," "suggests but does not prove." Authors rarely claim "proves."
- Reported studies use time-anchored phrasing: "In a 1995 study...," "More recently, researchers have shown...," "Since the 1980s, the standard view has been..." Dates ground the claims without being overused.
- Avoid real-world numerical claims that a test-taker could dispute from background knowledge (e.g., don't say "the human genome contains exactly 23,000 genes"). Use qualitative scale ("several thousand," "approximately a million-fold difference"), or stylized round numbers consistent with the passage's internal model.

## Domain sub-topic diversity (REQUIRED in every generator prompt)

Within this genre, vary sub-topic across the batch. Acceptable sub-topics for natural science:

- Evolutionary biology (speciation, adaptation, evo-devo)
- Ecology (trophic cascades, keystone species, population dynamics)
- Cell / molecular biology (enzymes, gene regulation — described in prose)
- Neuroscience (memory consolidation, sensory processing)
- Astronomy / astrophysics (stellar evolution, exoplanets, cosmology)
- Geology (plate tectonics, paleoclimate, mineralogy)
- Chemistry (catalysis, polymers, biochemistry crossover)
- Physics (condensed matter described accessibly, optics, thermodynamics)
- Paleontology (extinction events, fossil interpretation)
- Climate science (paleoclimate, ocean circulation — avoid overlap with comparative)
- Scientific methodology (replicability, meta-analysis, uncertainty quantification)
- History of science (a scientific revolution or paradigm shift, told from a science-first angle rather than a humanities-first angle)

No more than 2 passages on the same sub-topic per 10-passage batch.

## References

- Dossier: `docs/research/lsat-research-dossier.md` §4.1 (line 314), §4.3 (lines 333–339), §1 known gaps (line 47), §8 known-gaps backfill (lines 492–495).
- Authentic partial anchor: `docs/research/lsac-samples/rc-lsac-global-warming-comparative.json` (passage A only — IPCC / climate science framing).
