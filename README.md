# LSAT Prep

A friend-project LSAT prep web app: 4,000 AI-generated questions across Logical Reasoning, Reading Comprehension, and (opt-in) Logic Games, with three study modes (drill / timed section / full-length test), AI-powered writing-sample grading, tailored wrong-answer explanations, per-question coach chat, and periodic diagnostic reports.

**Live:** https://collincusce.github.io/lsatprep/ (after Phase 8 deploy)

**Design doc:** [`docs/plans/2026-04-19-lsatprep-design.md`](docs/plans/2026-04-19-lsatprep-design.md)
**Implementation plan:** [`docs/plans/2026-04-19-lsatprep.md`](docs/plans/2026-04-19-lsatprep.md)

## Architecture

- **Frontend** (`frontend/`): vanilla JavaScript ES modules, no framework, no build step. Served from GitHub Pages. All user state in `localStorage` under `lsatprep:v1:state`.
- **Backend** (`lambda/`): single Node.js 20 AWS Lambda behind a Function URL. Proxies four endpoints (`/explain`, `/writing-sample`, `/coach`, `/diagnostic`) to Anthropic's API. Holds the Anthropic key server-side.
- **Generation** (`generation/`): offline six-stage pipeline (research → taxonomy → coverage → generate → critic → assemble) using parallel Claude Code subagents. Outputs `frontend/questions.json`.
- **Deploy** (`deploy/`): bash scripts + scoped IAM policy. All AWS resources tagged `project=lsatprep`.

## Coverage matrix

The 4,000 questions are stratified across section, subtype, and difficulty. Counts below are planning targets; the per-run generation report documents the actual delivered distribution. Difficulty is 1★ (≈80–100% of LSAT takers get it right) / 2★ (≈50–79%) / 3★ (under 50%).

| Section / Type            |     Count | Notes (d1 / d2 / d3, or count)    |
| :------------------------ | --------: | :-------------------------------- |
| **Logical Reasoning**     |   ~2,000  | 16 subtypes × difficulty          |
| &nbsp;&nbsp;Assumption — Necessary      |   240 | 80 / 120 / 40  |
| &nbsp;&nbsp;Assumption — Sufficient     |   120 | 40 / 60 / 20   |
| &nbsp;&nbsp;Strengthen                  |   240 | 80 / 120 / 40  |
| &nbsp;&nbsp;Weaken                      |   240 | 80 / 120 / 40  |
| &nbsp;&nbsp;Flaw                        |   200 | 60 / 100 / 40  |
| &nbsp;&nbsp;Parallel Reasoning          |   120 | 20 / 60 / 40   |
| &nbsp;&nbsp;Parallel Flaw               |   100 | 20 / 60 / 20   |
| &nbsp;&nbsp;Method of Reasoning         |   100 | 40 / 40 / 20   |
| &nbsp;&nbsp;Role in Argument            |   120 | 40 / 60 / 20   |
| &nbsp;&nbsp;Point at Issue              |   100 | 40 / 40 / 20   |
| &nbsp;&nbsp;Main Point                  |   100 | 60 / 40 / 0    |
| &nbsp;&nbsp;Must Be True                |   140 | 40 / 80 / 20   |
| &nbsp;&nbsp;Most Strongly Supported     |   120 | 40 / 60 / 20   |
| &nbsp;&nbsp;Principle — Conform          |    60 | 20 / 30 / 10   |
| &nbsp;&nbsp;Principle — Justify          |    60 | 20 / 30 / 10   |
| &nbsp;&nbsp;Paradox / Resolve            |    60 | 20 / 20 / 20   |
| **Reading Comprehension** |   ~1,100  | ~160 passages × ~7 Q              |
| &nbsp;&nbsp;Humanities                   |   280 | 40 passages    |
| &nbsp;&nbsp;Social Sciences              |   280 | 40 passages    |
| &nbsp;&nbsp;Natural Science              |   280 | 40 passages    |
| &nbsp;&nbsp;Law                          |   140 | 20 passages    |
| &nbsp;&nbsp;Comparative Reading          |   120 | 20 passages (paired) |
| **Logic Games**           |     ~900  | ~140 games × ~6–7 Q               |
| &nbsp;&nbsp;Basic Linear                 |   200 | 30 games       |
| &nbsp;&nbsp;Advanced Linear              |   260 | 40 games       |
| &nbsp;&nbsp;Grouping                     |   240 | 40 games       |
| &nbsp;&nbsp;Hybrid                       |   220 | 30 games       |
| **Grand total**           | **~4,000** |                                   |

The machine-readable version is `generation/coverage-matrix.json`; the generator fan-out (Task 25–27) reads it directly.

## Dev setup

```bash
# Frontend (no build step)
./frontend/serve.sh    # http://localhost:3000

# Lambda tests
cd lambda && npm install && npm test

# Bank integrity check
node generation/scripts/validate-bank.mjs
```

## Deploy

- **Frontend:** `git push` to `main`. GitHub Pages serves directly from the `main` branch's `/frontend` folder (configured in repo Settings → Pages). No CI workflow.
- **Lambda:** `./deploy/deploy-lambda.sh` (requires `.env` with `ANTHROPIC_API_KEY`).
- **One-time AWS setup:** `./deploy/setup-aws.sh` (creates Lambda, Function URL, SNS topic, alarm, budget).

## Conventions

- **No npm dependencies in the frontend.** Vanilla JS only.
- **Lambda has one dep:** `@anthropic-ai/sdk`. `fetch` is built in.
- **All state mutations go through `frontend/modules/store.js`.** Never call `localStorage.setItem` elsewhere.
- **The question bank is generated, not hand-edited.** Inline edits are OK for typo fixes but the source of truth is the pipeline.
- **Secrets:** the Anthropic key lives only in local `.env` and the Lambda env var. Never in git, never in the frontend zip.
- **AWS cleanup:** every resource is tagged `project=lsatprep`; `./deploy/teardown.sh` removes them.

## Status

See the implementation plan for per-task progress. See `docs/runbook.md` (after Task 86) for operational notes.
