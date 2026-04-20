# Generation pipeline

The LSAT question bank is not hand-written. It's produced by a six-stage pipeline run locally by Claude Code subagents. Each stage produces a committed artifact so the user can review between stages.

## The six stages

### 1. Research
One long-running Explore subagent fetches LSAC's free public sample questions, 7sage's difficulty methodology, and the major LSAT taxonomies (LR subtypes, RC genres, LG families). Output: `docs/research/lsat-research-dossier.md` plus `docs/research/lsac-samples/*.json`.

### 2. Taxonomy & rubric authoring
From the dossier, author one rubric card per LR subtype, RC genre, and LG family. Each rubric specifies: structure, common stem templates, 1★/2★/3★ difficulty anchors, trap patterns, stylistic tells. Output: `docs/taxonomy/{LR,RC,LG}/*.md` (human-readable), `frontend/taxonomy.json` (machine-readable).

### 3. Coverage matrix
A JSON spec of every (section × subtype × difficulty) cell and its target count. Counts sum to ~4,000. Output: `generation/coverage-matrix.json`.

### 4. Parallel generation
~40–50 Agent subagents fan out in parallel, one per cell. Each receives its rubric + 3–5 LSAC few-shot examples + a mandatory domain-diversity instruction. Writes raw questions to `generation/raw/<section>-<subtype>-<difficulty>-<batch>.json`. Wall time: ~45–75 minutes total.

### 5. Independent critic pass
Fresh subagents grade each question cold — they see only the raw questions and the rubric, never the generator's reasoning. Produces: authenticity score (1–5), trap-distractor quality (1–5), difficulty verdict, and flags. LG questions additionally run through the constraint solver — any game whose stated correct answer doesn't hold under the rules is flagged. Output: `generation/critic/<type>-<d>-<batch>.json`.

### 6. Regeneration + assembly
- Questions with `authenticityScore < 3.5`, `difficultyVerdict ≠ matches`, or any LG solver flag are sent back for regeneration. Max 2 passes.
- Still-failing questions are dropped; if a cell's count falls below target, a backfill batch is dispatched.
- Survivors are merged, IDs renormalized, bank-version stamped, and `frontend/questions.json` is written.
- Generation report committed to `docs/reports/generation-report-<date>.md`.

## Between-stage review

The user reviews the dossier (end of Stage 1), the rubric cards (end of Stage 2), and the generation report + a stratified sample of ~300–400 questions (end of Stage 6). Edits flow back into the pipeline or are made inline in `frontend/questions.json` for typo fixes.

## Files in this directory

- `coverage-matrix.json` — the 4,000-question distribution spec.
- `few-shot/` — per-subtype bundles of LSAC sample questions used as voice anchors.
- `raw/` — Stage 4 output; one JSON file per cell.
- `critic/` — Stage 5 output; one JSON file per cell.
- `schemas/` — JSON Schema definitions for every pipeline artifact.
- `scripts/` — pipeline tools:
  - `lg-solver.mjs` — constraint solver for LG games (used both at gen time and in the browser).
  - `validate-bank.mjs` — CI-blocking integrity check for `frontend/questions.json`.
  - `validate-coverage-matrix.mjs` — sanity check for the coverage matrix.
  - `log.mjs` — structured JSONL logger used by pipeline scripts.
  - `gen-prompt.mjs` — builds the generator and critic subagent prompts from rubric + few-shot.
  - `flag-report.mjs` — derives which questions need regeneration from critic reports.
  - `assemble.mjs` — merges raw + critic into the final `frontend/questions.json`.
  - `review-report.mjs` — produces the generation report for user review.

## Running the pipeline

The pipeline is dispatched from a Claude Code session against this repo. Each stage is a set of tasks in `docs/plans/2026-04-19-lsatprep.md` (Tasks 18–32). The scripts in `generation/scripts/` are tools the subagents use; Claude Code orchestrates the subagent calls.

Re-runs (content refresh, bank v2): rerun all stages; the pipeline is idempotent except for the question IDs, which are renormalized on assembly.
