# LSAT Prep — Design Document

**Date:** 2026-04-19
**Owner:** collincusce (Collin Cusce)
**Status:** Approved, ready for implementation planning

---

## 1. Context & Goals

A comprehensive LSAT prep web app, built for a single friend (not a product). The app must:

- Cover the current LSAT (Logical Reasoning + Reading Comprehension) plus the retired Logic Games section behind an opt-in toggle.
- Offer three study modes: drill (learn), timed single-section (pace), full-length four-section test (simulate).
- Ship with 4,000 pre-generated questions of authentic LSAT quality, distributed and difficulty-calibrated across question types.
- Provide AI-powered features via Anthropic's Claude API: Writing Sample grading, tailored wrong-answer explanations, a per-question coach chat, and periodic diagnostic weakness reports.
- Deploy to AWS free tier with effectively zero ongoing cost and zero ops burden.
- Keep the user's Anthropic API key fully server-side — never in git, never in the zip, never in the browser.
- Grant Claude Code autonomous deployment authority with a scoped IAM user, budget caps, and destructive-action confirmation.

## 2. Non-goals

- Multi-user accounts, authentication, payments, analytics, A/B testing, feature flags, observability tooling beyond CloudWatch defaults, staging environments, CI/CD pipelines beyond a trivial Pages publish. Explicitly: this is a friend-project. Product-grade polish is not a goal.
- LSAC-licensed questions. All questions are AI-generated using LSAC's free public sample questions as few-shot anchors.
- Exact LSAC scaled-score curves. We ship a reasonable raw-to-scaled approximation and label it as such.
- Coaching beyond the scope of one question at a time. No cross-session tutoring arcs, no spaced-repetition scheduling.

## 3. Architecture overview

```
┌─────────────────────────────────────────────────────────────┐
│                      User's browser                          │
│  SPA fetched from GitHub Pages                               │
│  localStorage: attempts, sessions, preferences, seen-set    │
│  AI features → POST to Lambda Function URL with             │
│                shared-secret header                          │
└────────────┬─────────────────────────────────┬──────────────┘
             │ static                          │ AI features
             ▼                                 ▼
   ┌────────────────────────┐      ┌────────────────────────────┐
   │  GitHub Pages          │      │  Lambda (Function URL)     │
   │  collincusce/lsatprep  │      │  Verifies shared secret    │
   │  - index.html, app.js  │      │  Calls Anthropic with      │
   │  - questions.json      │      │  server-side API key       │
   │  - taxonomy.json       │      │  Reserved concurrency: 3   │
   │  - service-worker.js   │      │  CloudWatch billing alarm  │
   │  (auto-deploy from     │      └────────────────────────────┘
   │   main via Actions)    │                    │
   └────────────────────────┘                    ▼
                                     ┌────────────────────────────┐
                                     │  Anthropic API             │
                                     │  Monthly cap: $10          │
                                     └────────────────────────────┘

   ┌─────────────────────────────────────────────────────────────┐
   │  Offline (dev machine, Claude Code): 6-stage generation     │
   │  research → taxonomy → coverage → generate → critic →        │
   │  regenerate. Commits questions.json + taxonomy.json to git.  │
   └─────────────────────────────────────────────────────────────┘
```

**Key properties:**
- Server (Lambda) is fully stateless. All user state lives in the browser.
- Question bank is a static artifact; the Lambda never reads it.
- Multiple-choice grading is deterministic and happens client-side.
- Claude API is invoked only for Writing Sample grading, wrong-answer explanations, coach chat, and diagnostic reports.
- Generation runs locally via Claude Code subagents; outputs are committed JSON.

## 4. Frontend design

**Stack:** vanilla JavaScript (ES modules), HTML, CSS. No framework, no build step. Rationale: UI surface is simple, framework-less code ages better for a long-tail friend-project, `git push` → Pages deploy → friend refreshes has zero failure modes between commit and production.

**Routes (History API, hash-based fallback):**

| Route | Screen |
|---|---|
| `/` | Home / dashboard — stats, recent activity, mode entry points |
| `/drill` | Drill setup — pick section, subtypes, difficulty, count |
| `/drill/session` | Drill runner — one question at a time, instant feedback |
| `/timed/section` | Timed 35-minute single section |
| `/test` | Full-length test setup |
| `/test/session` | Full-length runner — 4 sections with breaks, end-of-test scoring |
| `/writing` | Writing Sample — prompt + essay textarea, Claude-graded on submit |
| `/results/:id` | Results screen — score, per-question review, explanations, coach button |
| `/coach/:qid` | Coach chat — streaming Claude conversation |
| `/progress` | Progress report — weaknesses by type/difficulty, diagnostic trigger |
| `/settings` | Settings — export / import / clear data |

**State model:** one localStorage key, `lsatprep:v1:state`, holds a single JSON blob. All reads and writes go through `store.js` module. Writes debounced 200ms. Blob serialized to a `.json` file for export; imports are merged (union by ID; latest timestamp wins on collision; preferences overridden by imported values; schema-version migrated if older; stale `questionId`s dropped on bank-version mismatch with a toast).

**Styling:** CSS custom properties for tokens, dark mode via `prefers-color-scheme` with manual settings override. No Tailwind, no CSS-in-JS.

**PWA:** service worker caches `index.html`, `app.js`, `app.css`, `questions.json`, `taxonomy.json`. Manifest declares installability. After first visit, the app works fully offline except for AI features (which require network regardless).

**No direct `localStorage.setItem` outside `store.js`.** All UI code mutates state via typed helpers. This is the single architectural invariant of the frontend.

## 5. Backend Lambda design

One Node.js 20 Lambda behind a Function URL. Internal routing on `event.rawPath`. Single env-var set. Zero npm dependencies besides `@anthropic-ai/sdk` — `fetch` is built in.

**Endpoints:**

| Path | Method | Purpose | Model | Streaming |
|---|---|---|---|---|
| `/writing-sample` | POST | Grade an LSAT-style Writing Sample essay | Opus 4.7 | no |
| `/explain` | POST | Tailored wrong-answer explanation for one question | Haiku 4.5 | no |
| `/coach` | POST | Per-question chat; server-sent events | Haiku 4.5 (Sonnet on request) | yes |
| `/diagnostic` | POST | Weakness report from posted attempt history (up to 500) | Sonnet 4.6 | no |

**Request/response shapes** (summarized; authoritative shapes in code):

```
POST /writing-sample
  in : { promptId, essayText }
  out: { grade, rubric: { organization, argumentStrength, evidenceUse, clarity }, narrative }

POST /explain
  in : { questionId, stimulus, choices, correctAnswer, userAnswer }
  out: { explanation }

POST /coach  (SSE)
  in : { questionId, stimulus, choices, correctAnswer, history, userMessage }
  out: text/event-stream of token deltas

POST /diagnostic
  in : { attempts: [...] }
  out: { weaknesses, strengths, recommendations }
```

**Auth / abuse prevention:**
1. CORS restricted to `https://collincusce.github.io` only.
2. Shared-secret header `X-LSATPrep-Token`; missing/wrong → 401.
3. Lambda reserved concurrency: 3.
4. Anthropic monthly cap: $10 (Anthropic-enforced; real hard stop).
5. CloudWatch billing alarm at $5/month → email.

**Prompt caching:** each endpoint's system prompt (LSAT-tutor persona + formatting rules) is marked `cache_control: { type: "ephemeral" }`. For `/coach`, the question stimulus + choices are also cached, since every follow-up reuses them.

**Env vars:**
- `ANTHROPIC_API_KEY` — server-side key, encrypted with default Lambda KMS key.
- `SHARED_SECRET` — random 32-byte hex, baked into frontend JS at deploy time.
- `ALLOWED_ORIGIN` — `https://collincusce.github.io`.

**Observability:** CloudWatch Logs only. No Datadog / Sentry / tracing.

## 6. Question data model & bank storage

**Three static JSON files shipped to the frontend:**

- `questions.json` — the 4,000 question records (LR flat, RC nested per passage, LG nested per game)
- `taxonomy.json` — the type system (LR subtypes, RC genres + types, LG families, difficulty anchors)
- `prompts.json` — writing-sample prompts

**LR question record:**

```json
{
  "id": "lr-0001",
  "section": "LR",
  "subtype": "assumption_necessary",
  "difficulty": 2,
  "difficultyReason": "...",
  "stimulus": "...",
  "questionStem": "Which one of the following...",
  "choices": [ { "label": "A", "text": "..." }, ... ],
  "correctAnswer": "C",
  "explanations": {
    "correct": "...",
    "A": "...",
    "B": "...",
    "D": "...",
    "E": "..."
  },
  "tags": ["conditional_reasoning"],
  "criticNotes": {
    "authenticityScore": 4.5,
    "trapQuality": 4.0,
    "flagsRaised": [],
    "verifiedAt": "...",
    "generationPass": 1
  },
  "source": {
    "pipelineVersion": "1.0",
    "generator": "claude-code-subagent",
    "fewShotRefs": ["lsac-sample-lr-2"]
  }
}
```

**RC passage record:** wraps a passage and its ~7 questions. `genre` ∈ { humanities, social_sciences, natural_science, law, comparative }. Comparative Reading passages have a `comparativeBPassage` companion text.

**LG game record:** wraps a scenario, rules, `verifiedSolutions` (enumerated by the constraint solver at generation time), and the game's questions. Each LG question may have `localRules` that apply only to it. `family` ∈ { basic_linear, advanced_linear, grouping, hybrid }.

**User state shape (localStorage blob):**

```json
{
  "schemaVersion": 1,
  "bankVersion": "2026-04-19-001",
  "preferences": { "lgEnabled": false, "theme": "auto", "defaultSection": "LR" },
  "attempts": [ { "id", "questionId", "sessionId", "chosenAnswer", "correct", "timeSpentMs", "timestamp" } ],
  "sessions": [ { "id", "mode", "startedAt", "finishedAt", "questionIds", "score", "elapsedMs" } ],
  "writingSamples": [ { "id", "promptId", "text", "grade", "timestamp" } ],
  "coachThreads": [ { "id", "questionId", "messages", "timestamp" } ]
}
```

**Import merge rules:**
- `attempts`, `sessions`, `writingSamples`, `coachThreads`: union by `id`; latest `timestamp` wins on conflict.
- `preferences`: imported file's values override local.
- `schemaVersion` older → migrate; newer → reject with error.
- `bankVersion` mismatch → accept, filter attempts referencing removed questionIds, toast how many were dropped.

**Storage decisions:**
- JSON over the wire, not SQLite-WASM. 4,000 questions ≈ 10 MB raw, ≈ 2–3 MB gzipped (GitHub Pages serves gzip). Fits memory comfortably.
- Service worker caches the bank; no re-fetch on subsequent visits until the hash changes.
- Integrity test (CI) validates: required fields present, `correctAnswer` ∈ choices, LG games have non-empty `verifiedSolutions`, no duplicate IDs, coverage matches `taxonomy.json`.

## 7. Generation pipeline (offline, Claude Code subagents)

Six stages, each producing a committed artifact for between-stage review.

### Stage 1 — Research

One long-running Explore/general-purpose subagent performs deep web research on:

- LSAC's free public sample questions (for few-shot anchors)
- 7sage's public difficulty-rating methodology and sample ratings (anchors for 1★/2★/3★ calibration)
- LSAT Trainer / PowerScore Bible taxonomies for LR, RC, LG
- Top wrong-answer trap patterns (LSAT Hacks, 7sage forum, r/LSAT)

**Output:** `docs/research/lsat-research-dossier.md`, `docs/research/lsac-samples/*.json`

### Stage 2 — Taxonomy & rubric authoring

From the dossier, author rubric cards per question type. User reviews before generation begins. Each rubric specifies: structure, stem templates, common traps, 1★/2★/3★ anchors, coverage target, stylistic tells.

**Output:** `docs/taxonomy/{LR,RC,LG}/*.md` (human), `frontend/taxonomy.json` (machine)

### Stage 3 — Coverage matrix

Machine-readable spec of (type × difficulty × count) summing to ~4,000.

**Rough distribution:**

| Section | Count | Breakdown |
|---|---|---|
| Logical Reasoning | ~2,000 | 16 subtypes, difficulty-stratified |
| Reading Comprehension | ~1,100 | ~160 passages × ~7 Q, 5 genres |
| Logic Games | ~900 | ~140 games × ~6–7 Q, 4 families |

Full LR subtype table in conversation archive; exact counts finalized in Stage 3.

**Output:** `generation/coverage-matrix.json`

### Stage 4 — Parallel generation

~40–50 Agent subagents in parallel, each assigned one matrix cell (e.g., "LR Strengthen difficulty 2, 40 questions, domain-diverse"). Each sees: its rubric card, 3–5 LSAC few-shot examples, the coverage cell spec, and a mandatory domain-diversity instruction (medicine/ethics/economics/history/law/linguistics/policy/environmental/technology/arts).

**Wall time:** ~45–75 minutes for 4,000 questions.

**Output:** `generation/raw/<type>-<difficulty>-<batch>.json`

### Stage 5 — Independent critic pass

Fresh subagents score each question cold — no access to the generator's reasoning, only the question text and the rubric. They produce:

- Authenticity score 1–5 (floor: 3.5)
- Trap-distractor quality 1–5
- Difficulty verdict (matches slot / too easy / too hard)
- Flags (conditional-logic error, ambiguous stem, duplicate phrasing, pattern collision)

For LG: the JavaScript constraint solver runs too — brute-force enumerate all valid permutations under the rules, confirm the stated correct answer matches. Hard gate.

**Output:** `generation/critic/<type>-<difficulty>-<batch>.json`

### Stage 6 — Regeneration + assembly

- Questions flagged by critic go back to generation (up to 2 regeneration passes).
- Failing LG games always regenerated; if still failing after 2 passes, dropped and backfilled.
- Survivors assembled into final `frontend/questions.json`.
- Generation report committed: coverage achieved, avg critic scores per type, flag count, rejection rate.

**Output:** `frontend/questions.json`, `docs/reports/generation-report.md`

**Review strategy at 4,000 scale:** user reviews all critic-flagged questions (~100–200) plus a random 5% sample of clean questions (~200), totaling ~300–400 questions of human spot-check. Estimated 3–4 hours, batchable.

## 8. Deployment & hosting

### Repo layout

```
lsatprep/
├── docs/                       # design doc, research, taxonomy (dev-only)
├── frontend/                   # GitHub Pages content
│   ├── index.html
│   ├── app.js
│   ├── modules/
│   ├── styles/
│   ├── questions.json
│   ├── taxonomy.json
│   ├── prompts.json
│   ├── service-worker.js
│   └── manifest.json
├── lambda/
│   ├── src/
│   │   ├── index.mjs
│   │   ├── handlers/
│   │   ├── anthropic.mjs
│   │   └── lib/
│   ├── package.json
│   └── package-lock.json
├── generation/                  # offline pipeline, not deployed
├── deploy/
│   ├── iam-policy.json
│   ├── deploy-lambda.sh
│   ├── deploy-frontend.sh
│   └── setup-aws.sh
├── .github/workflows/pages.yml
├── .env.example
├── .gitignore
├── README.md
└── CLAUDE.md
```

### GitHub setup (Claude owns, via `gh` CLI)

1. Create public repo `collincusce/lsatprep`.
2. Push initial scaffold to `main`.
3. Enable Pages with source set to `gh-pages` branch root.
4. Add `.github/workflows/pages.yml` to publish `frontend/` → `gh-pages` on every push to `main`.
5. Confirmed URL: `https://collincusce.github.io/lsatprep/`.

### AWS setup (scoped IAM, Claude runs deploy)

1. User creates IAM user `lsatprep-deployer` in console, attaches generated policy (`deploy/iam-policy.json`), downloads access key.
2. User runs `aws configure --profile lsatprep` in WSL.
3. Claude runs `./deploy/setup-aws.sh` which:
   - Creates Lambda execution role `lsatprep-lambda-role`.
   - Creates Lambda `lsatprep-api` (Node 20, 512 MB, 30 s timeout, reserved concurrency 3, streaming-enabled Function URL with auth `NONE`, CORS to Pages origin).
   - Creates SNS topic `lsatprep-alarms` subscribed to user email.
   - Creates CloudWatch alarm: Lambda invocations > 500 / hour → SNS.
   - Creates AWS Budget: $5/month actual → email alert.
   - Outputs Function URL and generated shared secret.
4. User fills `./.env` with `ANTHROPIC_API_KEY`.
5. Claude runs `./deploy/deploy-lambda.sh`: zips `lambda/`, uploads, sets env vars from `.env`, never prints the key.
6. Claude updates `frontend/modules/config.js` with Function URL + shared secret, commits, pushes.

### Anthropic setup (user owns)

1. Console → Billing → Usage limits → $10/month monthly cap.
2. Create API key named `lsatprep-prod`, paste into `./.env`.

### Updates post-deploy

- Frontend change: `git commit && git push`. Pages redeploys in ~60 s.
- Lambda change: `./deploy/deploy-lambda.sh`.
- Bank regen: rerun generation pipeline locally, overwrite `frontend/questions.json`, commit, push.

### Teardown (user owns)

`./deploy/teardown.sh` deletes every `project=lsatprep`-tagged resource. Safe to rerun.

### IAM policy scope

The `lsatprep-deployer` policy grants only:
- Lambda create/update/delete on functions matching `lsatprep-*`
- IAM manage on role `lsatprep-lambda-role` and its attached managed policy
- CloudWatch Logs + Alarms within project namespace
- SNS topic `lsatprep-alarms`
- AWS Budgets create/update for the project budget
- No S3, no EC2, no broader IAM.

## 9. Testing strategy

### Frontend
- `store.js` unit tests covering read/write round-trip, merge import semantics, tie-break rules, schema migration, bank-version filtering.
- **Question-bank integrity test** (CI-blocking on every push): required fields, `correctAnswer` ∈ `choices`, LG games have non-empty `verifiedSolutions`, no duplicate IDs, coverage matches `taxonomy.json`.
- **LG solver verification** (CI-blocking): for every LG game, solver re-verifies the shipped correct answer.
- Manual smoke test in the browser after each deploy: drill session + import round-trip + refresh persistence.

### Lambda
- Handler unit tests with mocked Anthropic SDK — response shape, status codes, error paths, auth rejection.
- No live Anthropic integration tests in CI (flaky, costs money).
- Post-deploy smoke: one `curl` per endpoint.

### Generation
- Taxonomy structure validator: all required rubric fields present; coverage-matrix totals match target.
- Critic-pass statistics report for user review before committing the bank.
- Bank diff tool: on regen, human-readable diff of what questions changed vs. prior version.

### Explicitly not tested
- UI components individually (no Storybook, no visual regression).
- Live Anthropic API behavior.
- AWS resource configuration in isolation (verified by post-deploy smoke).
- Performance / load (1-user scale).
- Full accessibility audit (basic semantic HTML and form labels only).

## 10. Security & cost posture

**Secrets:**
- `ANTHROPIC_API_KEY`: local `.env` on user's machine → Lambda env var (default KMS-encrypted). Never in git. `.env` is `.gitignore`d. Deploy script reads but does not print.
- `SHARED_SECRET`: generated once by `setup-aws.sh`; lives in Lambda env var AND in frontend JS (baked at deploy time). Frontend value is observable by anyone — this is anti-drive-by obscurity, not authentication.

**Abuse defense layers (independent):**
1. CORS restricted to Pages origin (deters casual cross-site abuse).
2. Shared-secret header check.
3. Lambda reserved concurrency 3 (bounds max in-flight calls).
4. Anthropic $10/month usage cap (enforced by Anthropic — the real hard stop).
5. CloudWatch billing alarm at $5/month → email.

Any one alone is insufficient; all five together mean a determined attacker can burn up to $10/month with heavy effort. That's the risk budget.

**Claude Code deploy authority:**
- All resources tagged `project=lsatprep`.
- Scoped IAM user, not admin.
- Destructive actions require explicit user confirmation before execution.
- Secrets flow through `.env` and `aws lambda update-function-configuration` only; never into conversation text, logs, or commits.

**Expected monthly costs at friend-scale usage:**
- AWS: $0 (within free tier).
- Anthropic: estimated $1–$5/month for a student studying ~1 hour/day; capped at $10 hard.

## 11. Open questions / risks

| Risk | Mitigation |
|---|---|
| Generated questions feel "AI-adjacent" despite effort. | Independent critic pass with floor score 3.5/5; user does 5% stratified sample review; regenerate flagged. |
| Single Anthropic key for all coach / explain / grade traffic could leak via client inspection. | It can't — the key stays in Lambda env. Only the shared-secret header is client-observable, and it's rate-limit-capped. |
| GitHub's secret scanner auto-revokes Anthropic keys pasted in repos. | Key is never pasted in repo; lives only in `.env` (gitignored) and Lambda env var. |
| LG games: generator writes rules + answer, but the answer may be wrong under its own rules. | Hard gate: JS constraint solver enumerates valid permutations at generation time. Games that fail verification are dropped/regenerated. Solver also runs at frontend runtime as defense in depth. |
| Lambda cold start affects first AI interaction of a session. | Acceptable; Node 20 Lambda cold start is ~200–500 ms. No provisioned concurrency (costs money). |
| Friend's localStorage wiped → loses progress. | Export/import JSON available in Settings; user prompts export after long sessions. |
| At 4,000 generation volume, model converges on homogeneous stimulus domains. | Mandatory domain-diversity instruction in every subagent prompt (medicine/ethics/economics/...). |
| Scaled-score approximation ≠ real LSAC curve. | Label it as an approximation in the UI; good enough for pace/progress tracking. |

## 12. Out-of-scope items (v2+ candidates)

- Accounts with cross-device sync (if friend adds a second device).
- Additional 4,000 questions (pipeline is reusable; rerun as a content update).
- Full-text search across the question bank.
- Community-submitted questions.
- Mobile-native wrapper.
- Spaced-repetition scheduling based on attempt history.
- Per-PrepTest emulation of real LSAT forms (would require licensed content).
