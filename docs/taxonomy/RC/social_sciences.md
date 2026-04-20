# RC — Social Sciences

**Coverage target:** 238 Qs across ~34 passages (54 / 115 / 69 for 1★ / 2★ / 3★ per `generation/coverage-matrix.json`). Passages average 400–500 words; each passage carries ~7 questions.

## Passage characteristics

Social-sciences passages cover history, political science, sociology, anthropology, economics, and psychology (dossier §4.1, line 313). The author is typically **analytic rather than interpretive**: they introduce a puzzle or phenomenon, report how one or more scholars have explained it, and assess the explanations. A frequent shape is **thesis / dissenting view / synthesis**, as in the Dutch tulip anchor (`rc-lsac-dutch-tulip.json`): Mackay's speculative-bubble account is introduced, Garber's fundamentals-based challenge is presented at length, and the author's own stance is left partly implicit — the passage takes Garber seriously without fully endorsing him. Unlike humanities, the author usually maintains clear distance from the views reported.

## Structural norms

- Typical paragraph count: **3–4**.
- Typical passage length: **400–500 words**.
- Topic sentence placement: the puzzle or phenomenon is usually introduced in **sentence 1 or 2** of paragraph 1. The competing explanations then occupy the remaining paragraphs, one per view.
- Transition markers typical of this genre: "according to," "however," "by contrast," "furthermore," "but [Scholar X] challenges this view, arguing that...," "this suggests," "given that." Authors signal epistemic structure ("argues," "acknowledges," "challenges") more explicitly than in humanities.

## Difficulty drivers

- **1★:** One scholar or school of thought, a single phenomenon, explanation given directly. Quantitative content is minimal or walked through in plain numbers.
- **2★:** Two scholars with competing accounts (the canonical Mackay-vs-Garber structure). Technical terminology defined inline but used throughout (e.g., "speculative bubble," "fundamentals," "descendent bulbs," "reproduction cost"). The author's own stance requires inference from which view receives more supportive elaboration.
- **3★:** Three or more positions, nested comparisons across time periods or regions, quantitative reasoning the student must track (e.g., "prices fell to 10 percent... by 1739, to one two-hundredth of 1 percent..."). Correlational vs. causal claims distinguished only implicitly. Technical models stated compactly (one or two sentences of setup carrying the rest of the passage).

## Style tells (authentic LSAT RC voice for this genre)

- Sentences of mixed length: a short declarative setup ("In economics, the term 'speculative bubble' refers to...") followed by a longer unpacking sentence. Average sentence length ~22 words; some specific ones run to 40+ when chaining "not A, but B" constructions.
- **Named disputants** are typical: "According to Charles Mackay's classic nineteenth-century account..." / "But the economist Peter Garber challenges Mackay's view, arguing that..." This is a hallmark move — generators should include at least one named scholar per social-sciences passage.
- Author tends to use **reporting verbs** that track epistemic stance: "argues," "acknowledges," "claims," "maintains," "concedes," "contends." Reserve "establishes" and "demonstrates" for claims the author endorses.
- Quantitative content presented in round approximations with hedges ("an amount of gold worth about U.S. $11,000 in 1999," "no more than one two-hundredth of 1 percent"), never as false precision.
- Definitions of terms appear inline with em-dashes or parentheticals: "the asset's fundamentals—that is, by the earnings derivable from the asset—but rather by mere speculation." Generators should mimic this dash-gloss pattern.

## Domain sub-topic diversity (REQUIRED in every generator prompt)

Within this genre, vary sub-topic across the batch. Acceptable sub-topics for social sciences:

- Economic history (pre-industrial markets, financial crises, labor history)
- Political theory (democracy, constitutionalism, representation)
- Cultural anthropology (kinship systems, ritual, material culture)
- Sociology of institutions (bureaucracy, professions, organizations)
- Historiography (how historians have reinterpreted a period)
- Psychology (memory, attention, bias — with a methodological angle)
- Behavioral economics (decision-making under uncertainty)
- Urban history / geography
- Social movements (labor, civil rights, suffrage)
- Development economics and post-colonial political economy
- Demography and migration studies
- Methodological debates (quantitative vs. qualitative, ethnography)

No more than 2 passages on the same sub-topic per 10-passage batch.

## References

- Dossier: `docs/research/lsat-research-dossier.md` §4.1 (line 313), §4.3 (lines 333–339), §2 RC difficulty drivers (line 92).
- Authentic anchor: `docs/research/lsac-samples/rc-lsac-dutch-tulip.json` (Mackay vs. Garber on Dutch tulip mania, 3★).
