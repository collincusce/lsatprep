# LG — Advanced Linear

**Coverage target:** 212 Qs across ~33 games (45 / 96 / 71 for 1★ / 2★ / 3★ per `generation/coverage-matrix.json`). Each game carries 5–7 questions including any question-local rules.

## Scenario pattern

Advanced linear keeps the 1:1 slot-to-entity spine of basic linear but adds a second dimension per slot: every slot has both an **ordinal position** and an **attribute** the entity at that slot carries (dossier §5.2, lines 355–360). Effectively a 2D grid — one axis is the sequence, the other axis is the attribute. Common shapes: day AND time (morning/afternoon); position AND color; finishing place AND jersey number; station AND inspector. One-line sketch: "Six paintings — Aurora, Banyan, Chorus, Dune, Ember, and Forge — will be hung along a gallery wall in six consecutive positions numbered 1 through 6. Each painting is either framed in oak or in walnut."

## Entities & positions

- Typical entity count: **5–7** (often 6)
- Typical position count: same as entity count (1:1 on the ordinal axis)
- Attribute dimension: **2 values** (e.g., morning/afternoon, oak/walnut, senior/junior) is most common; occasional 3-value attributes
- Common scenario topics: paintings hung along a wall with two frame types; conference talks scheduled by slot AND track (A-track / B-track); a week of clinic appointments with morning vs. afternoon slots; runners with bib colors finishing in order; a relay where each leg has both a sequence position and a vehicle type; bakery production by time AND station; dog-show ring order with breed category; flight takeoffs by gate AND hour; lab-bench assignments by seat number AND shift

## Rule types used (must be supported by `lg-solver.mjs`)

The solver only tracks a single assignment per entity. Advanced linear therefore encodes the two dimensions by **modeling each (ordinal, attribute) pair as a distinct position label** — e.g., positions `["1-oak", "2-oak", "3-oak", "1-walnut", "2-walnut", "3-walnut"]` — and letting the solver enumerate assignments. Generators must apply rule types from the supported set:

- **`at`** — "Aurora is at 3-oak." (fixes both dimensions at once)
- **`not_at`** — "Banyan is not at 1-oak."
- **`before`** / **`after`** — compare ordinal position, but the solver compares position labels with `<` / `>`. **This only works when positions are pure integers.** If a generator encodes two dimensions as compound labels like `"1-oak"`, `before`/`after` will compare strings and misbehave. **Workaround:** use integer positions that encode both dimensions (e.g., 1–6 for ordinal-1-through-6, reserving odd=oak and even=walnut is brittle; prefer splitting advanced linear into two solver calls — one for the ordinal axis, one for the attribute axis — and cross-product the solutions).
- **`adjacent`** / **`not_adjacent`** — same caveat; only meaningful when positions are integers.
- **`conditional`** — "If Aurora is at 3, then Banyan is framed in walnut."
- **`exactly_one_of`** — "Exactly one of Aurora, Banyan is in the morning half."

Practical recipe: pick **integer positions 1..N for the ordinal axis**, add the attribute as a second parallel assignment solved via a second pass. When the attribute is binary and fixed by ordinal position (e.g., "slot 1 is always oak"), encode it as a lookup on the solution rather than as a solver rule.

`same_group` / `different_group` / `exactly_n_in_group` can be re-used to constrain the attribute dimension when modeled as groups (e.g., oak-group and walnut-group).

## Difficulty drivers

- **1★ (≈80–100% correct):** 5–6 entities; attribute fully determined by ordinal (or vice versa), so the "second dimension" barely does work. 3–4 rules, most of them `at`/`before`/`after` on the ordinal axis; attribute rules are simple ("Aurora is framed in oak"). Solution count small.
- **2★ (≈50–79% correct):** 6 entities; attribute genuinely free (multiple valid oak/walnut patterns). 4–5 rules including at least one cross-dimensional rule ("Whoever is at position 3 is framed in walnut"). One conditional. Solution count moderate (10–30).
- **3★ (≈under 50% correct):** 6–7 entities; 5–6 rules including 2+ cross-dimensional rules and at least one conditional that triggers across dimensions ("If Aurora is in the morning, then Banyan is immediately after Chorus"). Dossier §2 (line 93) flags cross-dimensional inference as a top LG difficulty driver. Solution count large.

## Authentic style tells

- Scenario opens with both dimensions stated up front in the first paragraph: "six paintings... six consecutive positions... each is framed in oak or walnut." No dimension is introduced mid-rules.
- Attribute terms are **concrete, domain-appropriate nouns**, not colors-as-labels: "framed in oak or walnut," "assigned to the morning or afternoon session," "a senior attorney or a junior attorney." Avoid "type X / type Y" — that reads generic.
- Rules that span dimensions use "whoever" or "the painting that": "Whoever speaks third is assigned to the afternoon session." This is an authentic LSAT cadence.
- Question stems often isolate a single dimension: "Which one of the following could be the order of paintings from first to last?" (ordinal only) vs. "Which one of the following must be framed in oak?" (attribute only). Orientation items give both.
- Conditional stems sometimes combine dimensions: "If the third painting is framed in walnut, then which one of the following must be true?"

## Question types for this family

Typical distribution per 6-question game:

- 1 `orientation_question` — full assignment across both dimensions; each wrong choice violates exactly one rule.
- 2 `could_be_true` / `must_be_true` with a `localRules` hypothetical that usually pins one dimension and asks about the other.
- 1 unconditional `must_be_true` or `cannot_be_true` — what the base rules force across dimensions.
- 1 EXCEPT item — "could be framed in oak EXCEPT" or similar.
- 0–1 `rule_substitution` — same recipe as basic_linear but more informative when the substituted rule is cross-dimensional.

## MANDATORY solver verification

**Every generated game must include a `verifiedSolutions` array produced by running `generation/scripts/lg-solver.mjs`.**

Generator workflow:

1. Compose scenario + rules. Choose the solver encoding: (a) integer ordinal positions, and (b) either compound position labels where the attribute is tightly coupled to ordinal, or a **second solver pass** on the attribute dimension modeled as a grouping (groups = attribute values, groupSize = slots per attribute).
2. Import `solveGame` from `generation/scripts/lg-solver.mjs`.
3. Run the solver; if two passes, cross-product the results.
4. If zero valid combined worlds → unsatisfiable; regenerate.
5. Store the full cross-product as `verifiedSolutions` (each entry records both dimensions per entity).
6. For each question, apply `localRules`, filter `verifiedSolutions`, and verify the stated `correctAnswer` per the question-type semantics in `verifyAnswer`.
7. If any question fails verification → regenerate that question (keep the game).

Games shipped without `verifiedSolutions` are discarded by the Task 28/29 critic. This is a hard gate.

## Domain / scenario diversity (REQUIRED)

Vary scenarios. Reasonable pairings of axis + attribute: delivery truck stops × package-size (small/large); symposium talks × room (red/blue); clinic appointments × practitioner (Dr. X / Dr. Y); bakery production runs × oven (deck/convection); parade floats × sponsor (civic/commercial); racing heats × lane (inner/outer); farmers' market booths × weekend day (Sat/Sun); courtroom cases × judge (A/B); museum lectures × floor (upstairs/downstairs); shop-floor shifts × team (blue/gold).

No more than 2 games on the same scenario topic per 8-game batch.

## Thin spots

The dossier is skinny on advanced_linear (§5.2 is only 6 lines; no authentic LG sample of this shape in `docs/research/lsac-samples/`). Generators should lean on the basic_linear anchor for scenario voice and rule cadence and introduce the second dimension by reading 7sage / LSAT Trainer public guides. Flag all advanced_linear outputs for Stage-5 critic review with `criticNotes.flagsRaised = ["advanced_linear_synthetic_pattern"]` until a verified anchor exists (dossier §8, line 494: "A fully-verified LG game with verified solutions and a real LSAT-style question set" is listed as a known backfill).

## References

- Dossier: `docs/research/lsat-research-dossier.md` §5.2 (lines 355–360), §5.5 (lines 377–383), §2 LG difficulty drivers (line 93), §8 backfill gaps (line 494).
- Solver: `generation/scripts/lg-solver.mjs`.
- Authentic anchor: none specific to advanced_linear. Use `docs/research/lsac-samples/lg-june2007-game1-product-codes.json` (which has a linear-plus-relation feel) for rule cadence only.
