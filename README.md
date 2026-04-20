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
