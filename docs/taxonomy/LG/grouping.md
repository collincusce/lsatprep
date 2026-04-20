# LG — Grouping (Distribution / Selection)

**Coverage target:** 237 Qs across ~36 games (58 / 115 / 64 for 1★ / 2★ / 3★ per `generation/coverage-matrix.json`). Each game carries 5–7 questions including any question-local rules.

## Scenario pattern

Grouping games distribute entities into two or more named groups (or partition a pool into "chosen" / "not chosen") rather than sequencing them (dossier §5.3, lines 362–367). Unlike linear, there is no ordinal relationship between groups — "Firm A" and "Firm B" aren't before or after each other. Each group typically has a fixed size, sometimes a min/max range. One-line sketch: "Eight lawyers — Abad, Belgrave, Cho, Diaz, Ehrlich, Fong, Greer, and Hyatt — will be assigned to exactly one of three law firms: Nimbus, Orion, and Pike. Nimbus takes three lawyers, Orion takes three, and Pike takes two."

## Entities & positions

- Typical entity count: **6–10**
- Typical group count: **2–4** groups
- Group sizes: often fixed (e.g., 3/3/2); sometimes constrained by min/max on each group; the solver requires an exact `groupSize` when you want the groups to have uniform size, and the generator must ensure `entities.length === groups.length * groupSize`
- Common scenario topics: lawyers to law firms; volunteers to project teams; panelists to discussion panels; books to library shelves (subject sections); students to tutorial groups; crops to fields in a rotation year; vendors to farmers-market sections; jury panels; paintings grouped by wing of a museum; clubs to meeting rooms; relay runners grouped by team

Selection-style games (pick k of n) can be modeled in the solver by defining groups `["in", "out"]` with appropriate `groupSize` for each.

## Rule types used (must be supported by `lg-solver.mjs`)

From the solver's supported set the natural grouping rule types are:

- **`same_group`** — "Abad and Belgrave are assigned to the same firm."
- **`different_group`** — "Cho and Diaz are assigned to different firms."
- **`at`** — "Ehrlich is assigned to Nimbus." (Uses the group name as the "position" value.)
- **`not_at`** — "Fong is not assigned to Orion."
- **`conditional`** — "If Greer is assigned to Nimbus, then Hyatt is assigned to Pike." The `ifRule` and `thenRule` are themselves rule objects (e.g., `at`, `same_group`).
- **`exactly_n_in_group`** — "Exactly two of {Abad, Belgrave, Cho} are assigned to Nimbus." Requires `{ type: "exactly_n_in_group", entities: [...], group: "Nimbus", n: 2 }`.
- **`exactly_one_of`** — "Exactly one of {Diaz, Ehrlich} is assigned to Orion." (Same schema as exactly_n_in_group with n=1 is equivalent, but `exactly_one_of` is idiomatic.)

`before`, `after`, `adjacent`, `not_adjacent` make no sense across unordered groups and must not appear in pure grouping games.

## Difficulty drivers

- **1★ (≈80–100% correct):** 6 entities, 2–3 groups of uniform fixed size; 3–4 rules, mostly `at` / `different_group` / `same_group`. At most one conditional, and it fires obviously. Solution count small (3–10).
- **2★ (≈50–79% correct):** 7–8 entities, 3 groups; 4–5 rules with one or two conditionals. One `exactly_n_in_group` rule. Numerical distribution mostly fixed but with one floating slot. Solution count moderate (10–40).
- **3★ (≈under 50% correct):** 8–10 entities, 3–4 groups; 5–6 rules with 2+ chained conditionals and `exactly_n_in_group` rules whose consequences cascade ("if X in Nimbus, then Nimbus must also include Y, which forces Z out of Orion"). The dossier (§2 line 93, §5.3 line 367) flags conditional rules that force whole groups as a top difficulty driver. Solution count large.

**Important numerical-distribution caveat:** the solver supports **exact** group sizes (via the game-level `groupSize` or via `exactly_n_in_group` rules) but does **not** directly support "at least 2 but no more than 4 per group" as a single rule primitive. If a scenario needs range-bounded group sizes, the generator must enumerate each valid exact distribution as a separate `verifiedSolutions` pass (run the solver once per integer distribution in range, union the solution sets). Games that cannot be modeled this way should be downgraded or reshaped.

## Authentic style tells

- Crisp one-paragraph scenario opener: lists all entities, lists all groups, states the per-group head-count up front. No motive or flavor.
- Rules are a numbered list, each a single short declarative sentence. Authentic phrasings: "Abad and Belgrave must be assigned to the same firm." "Cho and Diaz cannot be assigned to the same firm." "If Ehrlich is assigned to Nimbus, then Fong is assigned to Pike."
- Conditional stems: "If Greer is assigned to Orion, then which one of the following must be true?"
- Orientation stem: "Which one of the following could be a complete and accurate assignment of lawyers to firms?" (Wrong choices each break one rule.)
- Numeric stems appear here more than in linear: "What is the minimum number of lawyers who could be assigned to Pike?" (Answers range over integers.)

## Question types for this family

Typical distribution per 6–7-question game:

- 1 `orientation_question` — full assignment; each wrong choice violates exactly one rule.
- 2 `must_be_true` / `could_be_true` with `localRules` adding one hypothetical placement.
- 1 unconditional `must_be_true` or `cannot_be_true`.
- 1 "minimum/maximum" item framed as `must_be_true` — e.g., "The maximum number of lawyers that could be assigned to Pike is..." answered by running the solver over all valid worlds and taking max/min of the group counts. Choices are integers.
- 0–1 EXCEPT item — "Each of the following could be true EXCEPT."
- 0–1 `rule_substitution` / `equivalent`.

## MANDATORY solver verification

**Every generated game must include a `verifiedSolutions` array produced by running `generation/scripts/lg-solver.mjs`.**

Generator workflow:

1. Compose scenario + rules using only supported rule types. Confirm `entities.length === groups.length * groupSize` for uniform-size games (solver requires this).
2. Import `solveGame` from `generation/scripts/lg-solver.mjs`.
3. Run `solveGame({ entities, groups, groupSize, rules })`.
4. If zero solutions → unsatisfiable; regenerate.
5. If there are solutions, store them as `verifiedSolutions` on the game.
6. For each question, apply any `localRules`, call `verifyAnswer(game, localRules, { kind, assertion })`, and confirm the stated `correctAnswer` is valid. Mapping: `must_be_true` → ALL filtered solutions satisfy; `could_be_true` → AT LEAST ONE; `cannot_be_true` / `must_be_false` → NONE.
7. For min/max questions, compute the statistic over the filtered solution set directly; confirm the integer the correct choice names matches.
8. If `correctAnswer` fails verification → regenerate the question (keep the game).

Games shipped without `verifiedSolutions` are discarded by the Task 28/29 critic. This is a hard gate.

## Domain / scenario diversity (REQUIRED)

Vary scenarios. Avoid the clichéd "8 students in 3 study groups" default. Consider: produce assigned to farmers-market stalls, volunteers to neighborhood cleanup crews, paintings to gallery rooms, clinicians to on-call rotations, jurors to two trial pools, delivery drivers to routes, relay runners to four-person teams, crops to three rotation fields, panelists to conference sessions, servers to restaurant sections, interns to hospital departments, books to library genre shelves, puppies to adoption cohorts, vehicles to ferry holds.

No more than 2 games on the same scenario topic per 8-game batch.

## References

- Dossier: `docs/research/lsat-research-dossier.md` §5.3 (lines 362–367), §5.5 (lines 377–383), §2 LG difficulty drivers (line 93).
- Solver: `generation/scripts/lg-solver.mjs` (rule types in `linearRuleCheckers`; grouping enumeration in `enumerateGroupingAssignments`).
- Authentic anchor: none pure-grouping in `docs/research/lsac-samples/`. Use `lg-june2007-game2-film-festival.json` for rule-list cadence; it is hybrid but its per-day "exactly one of {Greed, Limelight}" rules exemplify the `exactly_one_of` primitive.
