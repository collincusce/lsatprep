# RC — Law

**Coverage target:** 215 Qs across ~31 passages (46 / 100 / 69 for 1★ / 2★ / 3★ per `generation/coverage-matrix.json`). Passages average 400–500 words; each passage carries ~7 questions.

## Passage characteristics

Law passages cover legal reasoning, case analysis, statutory interpretation, jurisprudence, legal history, and policy-as-law (dossier §4.1, line 315). The author is typically **argumentative and exacting**: they identify a legal question, explain how courts or theorists have addressed it, and assess whether the doctrine is coherent, adequate, or appropriately applied. The aboriginal-rights anchor (`rc-lsac-aboriginal-rights.json`) exemplifies this: it names a constitutional provision, describes the burden it places on provincial courts, illustrates with a 1984 Ontario case, and editorializes at the end ("the provincial court's ruling was excessively conservative," "one hopes"). Law passages often distinguish **descriptive claims** (what the law says, what courts have done) from **prescriptive claims** (what the author thinks ought to happen).

## Structural norms

- Typical paragraph count: **3–4**.
- Typical passage length: **400–500 words**.
- Topic sentence placement: the legal question or doctrinal tension is usually stated in **paragraph 1**, often in the opening two sentences. Subsequent paragraphs trace the doctrine's application, introduce illustrative cases or statutory provisions, and culminate in the author's assessment.
- Transition markers typical of this genre: "for this reason," "however," "but difficulties arise in applying," "for example," "consider," "furthermore," "even if [X is established], it is frequently difficult to determine...," "regrettably." Concessive language is heavy — law authors constantly acknowledge the force of a counter-position before qualifying it.

## Difficulty drivers

- **1★:** Single legal question, one jurisdiction, one illustrative case. Terminology (e.g., "constitutional protection," "provincial courts") is legally ordinary and requires no specialist background.
- **2★:** One doctrine applied to two or more situations with different outcomes; the author points out the inconsistency and locates its cause. Legal terms used precisely: "indigenous customs," "sovereignty," "private property." The author's editorial stance appears in a qualifying sentence rather than a standalone claim. The aboriginal-rights anchor sits here.
- **3★:** A doctrine spanning multiple regimes (federal/provincial, common law/civil law, domestic/international) or eras (pre- and post-reform). Unfamiliar technical terms ("escheat," "per curiam," "ultra vires," "jus cogens," "lex specialis") used without full definition. Distinguishing what a court held from what the author infers from that holding requires careful re-reading.

## Style tells (authentic LSAT RC voice for this genre)

- Long, cautious sentences with multiple subordinate clauses — the aboriginal-rights passage opens "The struggle to obtain legal recognition of aboriginal rights is a difficult one, and even if a right is written into the law there is no guarantee that the future will not bring changes to the law that undermines the right." That accumulating, qualifying rhythm is the genre's signature.
- Formal register: no contractions, no colloquialisms, careful use of modal verbs ("may," "might," "should," "ought to"). "Regrettably" and "unfortunately" are admissible editorial adverbs; "shockingly" or "outrageously" would be out of register.
- Named statutes, cases, or eras anchor claims: "the federal government of Canada in 1982 extended...," "In a 1984 case in Ontario...," "the Supreme Court of Canada." Generators should cite a year and jurisdiction for legal events. Invent plausible jurisdictions and dates; never cite real case names verbatim (avoid confabulation risk).
- Author's own voice tends to appear late — a single sentence per paragraph editorializing, with the rest of the paragraph devoted to doctrinal exposition. The closing sentence often carries the strongest evaluative weight ("one hopes, more insistent upon a satisfactory application of the constitutional reforms").
- Distinguish **descriptive** reporting ("provincial courts therefore require...") from **prescriptive** assessment ("this requirement makes it difficult"). A hallmark of law passages is that the descriptive scaffolding is much larger than the prescriptive assessment.

## Domain sub-topic diversity (REQUIRED in every generator prompt)

Within this genre, vary sub-topic across the batch. Acceptable sub-topics for law:

- Constitutional interpretation (textualism, originalism, living-tree doctrine)
- Indigenous / aboriginal legal rights and land claims
- Criminal-procedure doctrine (evidence, standing, due process)
- Contract-law doctrine (unconscionability, reliance, promissory estoppel)
- Tort-law reform (product liability, negligence standards)
- International law (human rights treaties, customary international law)
- Legal history (common-law evolution, Roman-law influence)
- Administrative law (agency deference, rulemaking)
- Intellectual-property doctrine (fair use, patent scope)
- Environmental and regulatory law
- Legal ethics and professional responsibility
- Comparative legal systems (common law vs. civil law)
- Jurisprudence (positivism, natural law, legal realism, critical legal studies)

No more than 2 passages on the same sub-topic per 10-passage batch.

## References

- Dossier: `docs/research/lsat-research-dossier.md` §4.1 (line 315), §4.3 (lines 333–339), §2 RC difficulty drivers (line 92).
- Authentic anchor: `docs/research/lsac-samples/rc-lsac-aboriginal-rights.json` (Canadian aboriginal rights, 2★).
