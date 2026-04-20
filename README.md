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

The 4,000 questions are stratified across section, subtype, and difficulty per `generation/coverage-matrix.json` — the same file the Phase 4 generator subagents fan out on. Counts below are exact targets from that file; the per-run generation report records the actual delivered distribution after any drops or backfills. Difficulty is 1★ (≈80–100% of LSAT takers get it right) / 2★ (≈50–79%) / 3★ (under 50%).

| Section / Type                           |      Count | By difficulty 1 / 2 / 3   |
| :--------------------------------------- | ---------: | :------------------------ |
| **Logical Reasoning**                    |  **2,000** | 16 subtypes × difficulty  |
| &nbsp;&nbsp;Assumption — Necessary       |        159 | 38 / 70 / 51              |
| &nbsp;&nbsp;Assumption — Sufficient      |        147 | 32 / 64 / 51              |
| &nbsp;&nbsp;Strengthen                   |        192 | 51 / 90 / 51              |
| &nbsp;&nbsp;Weaken                       |        191 | 51 / 89 / 51              |
| &nbsp;&nbsp;Flaw                         |        166 | 38 / 77 / 51              |
| &nbsp;&nbsp;Parallel Reasoning           |        115 | 26 / 51 / 38              |
| &nbsp;&nbsp;Parallel Flaw                |         89 | 19 / 38 / 32              |
| &nbsp;&nbsp;Method of Reasoning          |        103 | 26 / 45 / 32              |
| &nbsp;&nbsp;Role in Argument             |        103 | 26 / 45 / 32              |
| &nbsp;&nbsp;Point at Issue               |         83 | 19 / 38 / 26              |
| &nbsp;&nbsp;Main Point                   |         83 | 26 / 38 / 19              |
| &nbsp;&nbsp;Must Be True                 |        128 | 32 / 58 / 38              |
| &nbsp;&nbsp;Most Strongly Supported      |        115 | 32 / 51 / 32              |
| &nbsp;&nbsp;Principle — Conform          |        103 | 26 / 45 / 32              |
| &nbsp;&nbsp;Principle — Justify          |         83 | 19 / 38 / 26              |
| &nbsp;&nbsp;Paradox / Resolve            |        140 | 38 / 64 / 38              |
| **Reading Comprehension**                |  **1,100** | ~157 passages × ~7 Q      |
| &nbsp;&nbsp;Humanities                   |        247 | 62 / 116 / 69             |
| &nbsp;&nbsp;Social Sciences              |        238 | 54 / 115 / 69             |
| &nbsp;&nbsp;Natural Science              |        231 | 54 / 108 / 69             |
| &nbsp;&nbsp;Law                          |        215 | 46 / 100 / 69             |
| &nbsp;&nbsp;Comparative Reading          |        169 | 38 / 85 / 46 (paired)     |
| **Logic Games**                          |    **900** | ~138 games × ~6–7 Q       |
| &nbsp;&nbsp;Basic Linear                 |        225 | 71 / 103 / 51             |
| &nbsp;&nbsp;Advanced Linear              |        212 | 45 / 96 / 71              |
| &nbsp;&nbsp;Grouping                     |        237 | 58 / 115 / 64             |
| &nbsp;&nbsp;Hybrid                       |        226 | 39 / 116 / 71             |
| **Grand total**                          |  **4,000** |                           |

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
