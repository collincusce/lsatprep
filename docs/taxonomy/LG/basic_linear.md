# LG — Basic Linear (Sequencing)

**Coverage target:** 225 Qs across ~35 games (71 / 103 / 51 for 1★ / 2★ / 3★ per `generation/coverage-matrix.json`). Each game carries 5–7 questions including any question-local rules.

## Scenario pattern

Basic linear games assign exactly N entities into N ordered slots, 1:1 (dossier §5.1, lines 347–353). The slot sequence is almost always a natural ordering the reader already understands: days of the week, rooms in a hallway, speakers at a conference, finishing places in a race. No second attribute per slot. No "chosen from a larger pool" trick — every entity appears exactly once, every slot holds exactly one entity. One-line sketch: "Seven speakers — Farrell, Gupta, Huang, Ibanez, Jain, Kirsch, and Lee — will each deliver one keynote on one of seven consecutive days, Monday through Sunday."

## Entities & positions

- Typical entity count: **5–8** (sweet spot 6 or 7)
- Typical position count: **equal to entity count** (1:1 linear mapping)
- Common scenario topics: lecture schedule by day; presenters at a symposium; runners finishing a race; hikers ascending a trail in order; a weekly delivery route through 6 towns; courtroom cases on a single docket; performers taking the stage; museum exhibit tour stops; bus pickup order along a route; job-fair interview timeslots

## Rule types used (must be supported by `lg-solver.mjs`)

From the solver's supported set the following are natural here:

- **`at`** — "Farrell speaks on Wednesday."
- **`not_at`** — "Gupta does not speak on Monday."
- **`before`** — "Huang speaks on some day before Ibanez."
- **`after`** — "Lee speaks on some day after Jain."
- **`adjacent`** — "Kirsch speaks on the day immediately before or immediately after Lee." (Block.)
- **`not_adjacent`** — "Farrell and Gupta do not speak on consecutive days."
- **`conditional`** — "If Huang speaks on Tuesday, then Ibanez speaks on Thursday." (The `ifRule` and `thenRule` are themselves rule objects from the list above.)
- **`exactly_one_of`** — less common in basic linear since each slot already holds exactly one entity; used when the stimulus says "Either Huang or Ibanez, but not both, speaks on Wednesday" (express as `exactly_one_of` with entities list and target position).

`same_group`, `different_group`, and `exactly_n_in_group` are grouping primitives and should not appear in a basic_linear game.

## Difficulty drivers

- **1★ (≈80–100% correct):** 5–6 entities; 3–4 rules that together pin down most positions (at least one `at` or two strong `before`/`after` rules). At most 1 conditional, and that conditional's antecedent is easy to trigger. Solution count small (2–6 valid worlds).
- **2★ (≈50–79% correct):** 6–7 entities; 4–5 rules, a mix of ordering and adjacency constraints, with 1–2 "floater" entities the rules never directly mention (dossier §5.1 calls these "many floating variables"). One conditional whose contrapositive matters. Solution count 6–20.
- **3★ (≈under 50% correct):** 7–8 entities; 5–6 rules heavy on `not_at`/`not_adjacent` (restrictive but non-forcing); 2+ conditionals that chain (antecedent of one is consequent of another). Solution count large (20+) so students cannot just enumerate; correct answers require spotting that no world satisfies the combined constraints a given choice implies.

## Authentic style tells

- Crisp one-paragraph scenario opener: states entities, states slot structure, no flavor text or motive. The product-codes anchor (`lg-june2007-game1-product-codes.json`) opens with "A company employee generates a series of five-digit product codes..." and goes straight to the constraints.
- Rules are a **numbered list**, each one a single short declarative sentence with no hedging. Example cadence: "1. Farrell speaks before Gupta. 2. Huang does not speak on Monday. 3. Ibanez speaks immediately after Jain."
- No pronouns referring back across rules — every rule re-names its entities so it reads standalone.
- Orientation question always appears first: "Which one of the following could be [the order / an acceptable schedule / a possible assignment]?"
- Conditional stems use "If X, then which one of the following must be true?" — never "Suppose X; what follows?"

## Question types for this family

Typical distribution per 6-question game:

- 1 orientation — `orientation_question`, e.g. "Which one of the following could be the order of speakers from first to last?" Wrong choices each violate exactly one rule.
- 1–2 conditional — `must_be_true` or `could_be_true` with `localRules` adding one hypothetical (e.g., "If Huang speaks on Tuesday...").
- 1–2 unconditional `must_be_true` / `cannot_be_true` — no `localRules`, asks what the base rules force.
- 0–1 EXCEPT item — "Each of the following could be true EXCEPT" (maps to `must_be_false` at the stem level; four could-be-true distractors plus one that cannot).
- 0–1 `rule_substitution` / `equivalent` — "Which one of the following, if substituted for rule 3, would have the same effect on the game?" Requires solver re-run: swap candidate rule in and confirm the solution set is identical.

## MANDATORY solver verification

**Every generated game must include a `verifiedSolutions` array produced by running `generation/scripts/lg-solver.mjs`.**

Generator workflow:

1. Compose scenario + rules using only the rule types listed above.
2. Import `solveGame` from `generation/scripts/lg-solver.mjs`.
3. Run `solveGame({ entities, positions, rules })`.
4. If zero solutions → the rules are unsatisfiable; regenerate.
5. If there are solutions, store them as `verifiedSolutions` on the game.
6. For each question, apply any `localRules`, call `verifyAnswer(game, localRules, { kind, assertion })` (also exported from the solver module), and confirm the stated `correctAnswer` is valid. Required mapping: `must_be_true` → ALL filtered solutions must satisfy the assertion; `could_be_true` → AT LEAST ONE; `cannot_be_true` / `must_be_false` → NONE.
7. For orientation questions, each choice is a full assignment; confirm exactly one choice passes all base rules.
8. For `rule_substitution`: solve the game with rule R removed and candidate rule R' substituted in; the solution set must be identical to the original. Test every candidate; confirm exactly one matches.
9. If `correctAnswer` fails verification → regenerate the question (keep the game).

Games shipped without `verifiedSolutions` are discarded by the Task 28/29 critic. This is a hard gate.

## Domain / scenario diversity (REQUIRED)

Vary scenarios across the batch. Avoid the clichéd "7 interns scheduled over 7 days at a law firm" default. Consider: delivery-truck stop order through 6 towns, courtroom docket ordering, lecture hall talks Monday–Saturday, runners finishing a marathon, hikers reaching summit checkpoints, museum audio-tour stations, bus route stops by time, conference session sequence, recital performance order, construction-task Gantt-slot sequence, farmers-market booth setup order, parade float order.

No more than 2 games on the same scenario topic per 8-game batch.

## References

- Dossier: `docs/research/lsat-research-dossier.md` §5.1 (lines 347–353), §5.5 (lines 377–383), §2 LG difficulty drivers (line 93).
- Solver: `generation/scripts/lg-solver.mjs` (rule types listed in `linearRuleCheckers`).
- Authentic anchor: `docs/research/lsac-samples/lg-june2007-game1-product-codes.json` (five-digit product codes, 2★).
