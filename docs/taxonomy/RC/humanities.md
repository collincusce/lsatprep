# RC — Humanities

**Coverage target:** 247 Qs across ~35 passages (62 / 116 / 69 for 1★ / 2★ / 3★ per `generation/coverage-matrix.json`). Passages average 400–500 words; each passage carries ~7 questions.

## Passage characteristics

Humanities passages treat arts, literature, literary criticism, philosophy of art, music history, aesthetics, and kindred topics (dossier §4.1, lines 312). The author is typically an interpretive critic: not reporting raw data but adjudicating between rival readings of a work, movement, or artist. A canonical shape is "the received view holds X; on closer inspection, the truth is more nuanced" — the Lichtenstein anchor (`rc-lsac-lichtenstein.json`) does exactly this with "Standard art history holds that pop art emerged as an impersonal alternative... The truth is that by the time pop art first appeared..." The author often praises a subject while complicating simplistic praise of them.

## Structural norms

- Typical paragraph count: **3–4**.
- Typical passage length: **400–500 words**.
- Topic sentence placement: the thesis often appears at the **end of paragraph 1** (as in Lichtenstein: "while poking fun... also managed to convey a seriousness of theme"), with each subsequent paragraph nuancing one strand.
- Transition markers typical of this genre: "but," "however," "the truth is," "at first... but," "beneath its [surface] methods," "in contrast to some [other practitioners]," "more than merely." Adversative turns dominate; causal connectives are rarer than in natural science.

## Difficulty drivers

- **1★:** A single artist/work/movement, a clearly-stated "traditional view vs. author's view" contrast, accessible vocabulary (no technical aesthetics terminology). One thesis, one nuance.
- **2★:** Two critical frames held in tension (e.g., "parody" vs. "realism" for Lichtenstein). Author's attitude revealed in stacked qualifiers ("not merely X, but also Y"). Vocabulary includes period- or movement-specific terms defined only implicitly.
- **3★:** Three or more interpretive frames, author's stance only resolvable by assembling hints across paragraphs 2 and 3. Dense pronoun chains ("its," "their" referring to abstractions like "the movement" or "this impulse"). Unfamiliar aesthetic terminology (e.g., "diegesis," "ekphrasis," "histrionic," "anagogic") used in-passage without gloss.

## Style tells (authentic LSAT RC voice for this genre)

- Long, clause-stacked sentences — the Lichtenstein passage's final sentence is 24 words and chains three prepositional phrases ("a faith in reconciliation, not only between cartoons and fine art, but between parody and true feeling"). Expect multiple clauses per sentence.
- Adjective-rich vocabulary describing tone and effect: "histrionic," "impersonal," "lyrical," "airy," "jaded," "naive," "sweet," "bravado," "stilted." Emotionally evaluative but precise.
- Author signals own stance with phrases like "the truth is," "but if X were all that characterized...," "it would possess only...," "the urge to say that...". Reporting others' views uses "standard art history holds," "has been argued," "some have claimed."
- Humanities authors often set up a **"traditional reading"** (shallow, widely-held) then introduce a **"fuller reading"** (theirs) — and almost never fully reject the traditional reading; they say it captures something but misses the deeper point.
- Named disputants appear less than in social sciences; when they do, they are critics or theorists (Panofsky, Greenberg, Frye) rather than empirical researchers.

## Domain sub-topic diversity (REQUIRED in every generator prompt)

Within this genre, vary sub-topic across the batch. Acceptable sub-topics for humanities:

- 20th-century literary criticism (New Criticism, reader-response, deconstruction)
- Medieval or Renaissance visual art
- Modernist poetry or the novel
- Comparative mythology / folklore studies
- Non-Western literary traditions (e.g., Japanese haiku, West African griot traditions)
- Music history (baroque, romantic, jazz, minimalism)
- Philosophy of aesthetics (the sublime, formalism, intentionalism)
- Architecture and design history
- Film theory (auteur theory, genre criticism)
- Theatre / performance studies
- Translation studies and the ethics of translation
- Art-historical revisionism (re-evaluating a marginalized figure)

No more than 2 passages on the same sub-topic per 10-passage batch.

## References

- Dossier: `docs/research/lsat-research-dossier.md` §4.1 (line 312), §4.3 (lines 333–339), §2 RC difficulty drivers (line 92).
- Authentic anchor: `docs/research/lsac-samples/rc-lsac-lichtenstein.json` (Lichtenstein / pop art, 2★).
