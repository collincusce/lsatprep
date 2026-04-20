# CLAUDE.md — instructions for future Claude Code sessions

This is a **friend-project**, not a product. Collin Cusce (`collincusce` on GitHub) is building it for a friend studying for the LSAT. Skip product-grade polish: no analytics, no A/B tests, no feature flags, no staging environment, no multi-env CI/CD. One environment, one user, one branch.

## Path quirks

The repo lives at `/home/ccusce/lsatprep` inside WSL Ubuntu. From Windows you can see it as `\\wsl$\Ubuntu\home\ccusce\lsatprep`. When shelling in from Windows Claude Code, prefix with `wsl.exe -d Ubuntu -- bash -lc '...'` so commands run in the Linux environment rather than Windows bash — otherwise `git` complains about dubious ownership and path resolution gets weird.

## Frontend invariants

- Vanilla JavaScript ES modules. **No framework. No build step.** `git push` is the build.
- All user state lives in `localStorage` under a single key: `lsatprep:v1:state`.
- **All reads and writes go through `frontend/modules/store.js`.** Never call `localStorage.setItem` anywhere else in the frontend. This is the single architectural invariant.
- CSS custom properties for design tokens; dark mode via `prefers-color-scheme` with manual override in Settings.

## Question bank

- The bank is generated, not hand-edited. The source of truth is the 6-stage pipeline in `generation/`.
- Typo-fix edits to `frontend/questions.json` are OK, but structural changes should go through a regen.
- Every commit that modifies `frontend/questions.json` must pass `node generation/scripts/validate-bank.mjs`.

## Deploy

- Frontend: `git push` to `main` → GitHub Actions publishes `frontend/` to Pages in ~60 s.
- Lambda: `./deploy/deploy-lambda.sh` from a machine that has `.env` present.
- `.env` lives only on Collin's local machine. Never commit it. Never print `ANTHROPIC_API_KEY` in shell output, log lines, or conversation text.

## AWS

- IAM user: `lsatprep-deployer`. Scoped policy in `deploy/iam-policy.json`. Do not request broader permissions.
- All AWS resources are tagged `project=lsatprep`. Use that tag when cleaning up.
- `./deploy/teardown.sh` removes everything tagged `project=lsatprep`. Destructive — requires user confirmation.

## Destructive actions

The following require explicit user confirmation before running, even if previously authorized:
- `./deploy/teardown.sh` (deletes AWS resources)
- `git reset --hard` (discards uncommitted work)
- `git push --force` (overwrites remote history)
- `aws lambda delete-function` and similar delete APIs
- Deleting a branch, dropping a worktree, or rm -rf of anything outside generation intermediates

For everything else (editing code, running tests, running deploy scripts, calling AWS update APIs), proceed without asking each time.

## Model slotting (Anthropic)

- **Opus 4.7** → Writing Sample grading.
- **Sonnet 4.6** → Diagnostic weakness reports.
- **Haiku 4.5** → Per-question explanations + coach chat.

System prompts are cached via `anthropic-beta: prompt-caching-2024-07-31`.

## Design + plan

- Design doc: `docs/plans/2026-04-19-lsatprep-design.md`.
- Implementation plan: `docs/plans/2026-04-19-lsatprep.md`.
- When in doubt about a decision, re-read the relevant section of the design doc rather than inventing a new convention.
