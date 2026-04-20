# LG — Hybrid

**Coverage target:** 226 Qs across ~34 games (39 / 116 / 71 for 1★ / 2★ / 3★ per `generation/coverage-matrix.json`). Each game carries 5–7 questions including any question-local rules.

## Scenario pattern

Hybrid games combine two families in a single scenario, most commonly **grouping-plus-sequencing** (dossier §5.4, lines 369–375). Canonical shapes: (a) assign entities to groups AND order them within each group (e.g., three teams of runners, where each team is also ordered first/second/third); (b) order entities into a sequence where each slot also carries a group-membership label; (c) the film-festival anchor's "three days, each day has a 'last shown' slot, and each film appears at least once across the festival" — a sequencing skeleton with grouping-style multi-assignment permitted within each day. One-line sketch: "A museum will display five sculptures — Anchor, Briar, Cove, Dune, and Elm — across three consecutive wings (North, Center, South). Each wing holds at least one sculpture, at most two, and within each wing the sculptures are arranged left-to-right in a visible order."

## Entities & positions

- Typical entity count: **6–9** (often 7)
- Typical structure: one sequencing axis (3–6 slots) AND one grouping axis (2–4 groups), or both applied to the same N entities
- Common scenario topics: film festival schedule (multiple films per day, each day has a distinguished slot like "last shown"); track meet with three relay teams, each of three runners running in order; conference with two parallel session tracks, each with its own timeslot sequence; bakery producing two product lines, each line batched through the day in order; a parade with two floats per district, arranged in marching order within each district; a museum with sculptures grouped by wing, ordered left-to-right within wing; courtroom docket split between two judges, each judge's cases ordered by time

## Rule types used (must be supported by `lg-solver.mjs`)

Because hybrid games combine two structures, the generator chooses one structure as the "primary" solver encoding and encodes the other structure as either (a) compound labels (e.g., `"North-1"`, `"North-2"`, `"Center-1"`), or (b) a second solver pass whose solutions are cross-producted with the first. The full usable rule set from the solver:

- **`at`** / **`not_at`** — pin or forbid an entity from a specific compound position ("Anchor is at North-1").
- **`before`** / **`after`** — compare integer positions. For compound labels, `before`/`after` compare labels with `<` / `>` and will **only work correctly when positions are actual integers**. For cross-structure ordering (e.g., "all North sculptures are to the left of all Center sculptures"), encode with integer positions where the generator has manually placed the grouping boundary.
- **`adjacent`** / **`not_adjacent`** — integer positions only; used for the sequencing axis of the hybrid.
- **`same_group`** / **`different_group`** — for the grouping axis when encoded as groups in a second solver pass, or as equality/inequality tests on the "group component" of a compound label.
- **`conditional`** — cross-structure conditionals are the signature of hybrid games: "If Anchor is in the North wing, then Briar is the leftmost sculpture in the Center wing."
- **`exactly_one_of`** — "Exactly one of {Anchor, Briar} is in the South wing" (express against the group axis).
- **`exactly_n_in_group`** — "Exactly two of {Anchor, Briar, Cove} are displayed in the North wing."

Not all hybrid scenarios fit the solver cleanly. The film-festival anchor (`lg-june2007-game2-film-festival.json`) uses the meta-rules `each_entity_at_least_once_across_festival` and `no_film_repeated_in_single_day` — **neither is supported by the solver**. For scenarios with those kinds of meta-constraints, the generator must either (a) reshape to a shape the solver can enumerate (e.g., model only the "last shown on day X" slots as the 3 solver positions and handle the at-least-once meta-constraint at scenario-design time by ensuring every film appears in at least one of those slots), or (b) extend `verifiedSolutions` with a hand-written enumeration that the Stage-5 critic will re-verify. Prefer (a) — do not invent new rule types.

## Difficulty drivers

- **1★ (≈80–100% correct):** Small hybrid — 5–6 entities, one axis trivially determined (e.g., every group has exactly two members and one is fixed). 3–4 rules with at most one cross-structure rule. Solution count small.
- **2★ (≈50–79% correct):** 6–8 entities across both structures; 4–6 rules, including 1–2 cross-structure rules that couple group membership to position. At least one conditional, possibly cross-structure. Dossier §5.4 (line 374) calls out "rules that interact across the two structures" as the signature 2★ driver. Solution count moderate (10–40).
- **3★ (≈under 50% correct):** 7–9 entities; 5–7 rules including 2+ cross-structure conditionals; numerical distribution partially free ("each group has 2 or 3 members, totaling 7"); rules that chain through both structures. Dossier §2 (line 93) flags hybrid games themselves as a top LG difficulty driver. Solution count large, and the correct answer often requires reasoning about which of many worlds are excluded by the combined constraints.

## Authentic style tells

- Scenario paragraph is slightly longer than basic_linear (3–5 sentences) because both structures must be established. The film-festival anchor runs 74 words and establishes three days, three films, the "each shown at least once" meta-rule, the "never more than once on a given day" meta-rule, and three per-day "last shown" constraints.
- Both structures named using concrete domain vocabulary — "wings" not "groups," "left-to-right order" not "sequence," "Thursday" not "day 1" where the real-world term lands naturally.
- Rules mix structures fluently: some rules reference only group membership, some only ordering, and 1–2 reference both. Authentic cadence: "On Thursday Harvest is shown, and no film is shown after it on that day."
- Question stems often specify the dimension of interest: "Which one of the following could be the complete list of films shown last on Thursday, Friday, and Saturday, respectively?" (sequence of labels tied to axis positions).
- Conditional stems: "If Anchor is displayed in the Center wing, then which one of the following must be true?"
- Orientation items for hybrid games are longer than for basic_linear because a full assignment names both axes for every entity.

## Question types for this family

Typical distribution per 6–7-question game:

- 1 `orientation_question` — full assignment across both axes; each wrong choice violates exactly one rule.
- 2–3 `must_be_true` / `could_be_true` with `localRules` pinning one axis and asking about the other (the characteristic hybrid question shape).
- 1 unconditional `must_be_true` or `cannot_be_true`.
- 0–1 EXCEPT item.
- 0–1 min/max numerical — "What is the maximum number of sculptures that could be displayed in the North wing?"
- 0–1 `rule_substitution` / `equivalent` — higher value in hybrid because cross-structure rules are easy to state two different ways.

## MANDATORY solver verification

**Every generated game must include a `verifiedSolutions` array produced by running `generation/scripts/lg-solver.mjs`.**

Generator workflow:

1. Choose an encoding: compound-position-labels OR two-pass-with-cross-product. Write it down in the game's design notes.
2. Translate every scenario rule into a solver-supported rule type from the list above. If you cannot translate a rule (e.g., "each film appears at least once"), reshape the scenario until every remaining rule is solver-native.
3. Import `solveGame` from `generation/scripts/lg-solver.mjs`.
4. Run the solver (one pass for compound encoding; two passes for cross-product encoding, then intersect).
5. If zero valid worlds → unsatisfiable; regenerate.
6. Store the enumerated worlds (each recording both-axis values per entity) as `verifiedSolutions`.
7. For each question, apply `localRules`, re-run or filter, and call `verifyAnswer` on the stated `correctAnswer`. Same semantics as other families.
8. If `correctAnswer` fails → regenerate the question (keep the game).

Games shipped without `verifiedSolutions` are discarded by the Task 28/29 critic. This is a hard gate.

## Domain / scenario diversity (REQUIRED)

Vary scenarios. Mix the two axes freshly: museum wings × in-wing left-to-right order; relay teams × leg-order within team; conference tracks × timeslot sequence; bakery product-lines × production batch order; parade districts × float order within district; courtroom judges × case-hearing time; hospital units × shift schedule; ferry holds × loading order within hold; library wings × shelf order within wing; school recitals with grade × performance order.

No more than 2 games on the same scenario topic per 8-game batch.

## Thin spots

The dossier is skinny on hybrid (§5.4 is only 7 lines). The one authentic anchor, `lg-june2007-game2-film-festival.json`, relies on meta-constraints (`each_entity_at_least_once_across_festival`, `no_film_repeated_in_single_day`) that the solver does not support and that the sample's `verifiedSolutions` field itself flags as requiring "grouping+sequencing hybrid solver" attention. Generators must not invent new rule types to match the anchor literally; they must reshape hybrid scenarios into solver-native rule sets. Flag all hybrid outputs for Stage-5 critic review with `criticNotes.flagsRaised = ["hybrid_requires_careful_encoding"]` for the first cohort; once a handful pass critic cleanly the flag can be dropped.

## References

- Dossier: `docs/research/lsat-research-dossier.md` §5.4 (lines 369–375), §5.5 (lines 377–383), §2 LG difficulty drivers (line 93), §8 backfill gaps (line 494).
- Solver: `generation/scripts/lg-solver.mjs`.
- Authentic anchor: `docs/research/lsac-samples/lg-june2007-game2-film-festival.json` (film festival, 2★) — scenario + rule cadence only; its meta-rules cannot be passed to the solver as-is.
