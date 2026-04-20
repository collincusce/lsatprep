# Runbook

Operational notes for `lsatprep`. Friend-project scale — keep it simple.

## Day-to-day

### Update the frontend

```bash
# Edit files in frontend/
git commit -am "frontend: <what changed>"
git push
./deploy/deploy-frontend.sh      # syncs frontend/ → gh-pages branch
```

Pages rebuilds in ~30–60 s. Hard refresh the page (Cmd-Shift-R) to bypass the service worker cache on the first visit after a deploy.

### Update the Lambda

```bash
# Edit files in lambda/src/
cd lambda && npm test && cd ..
./deploy/deploy-lambda.sh
```

Test the new handler with `curl` against `$LAMBDA_FUNCTION_URL/explain` using `$SHARED_SECRET` from `.env`.

### Regenerate the question bank

When Phase 3-4 runs (not yet):

```bash
# From Claude Code, dispatch the research + generate + critic + assemble subagents
# per docs/plans/2026-04-19-lsatprep.md Tasks 18-32.
node generation/scripts/validate-bank.mjs     # must pass before commit
git commit -am "bank: regen"
./deploy/deploy-frontend.sh
```

The `bankVersion` in `frontend/questions.json` should change on regen. Service-worker cache name includes it, so clients auto-invalidate.

## Rotation

### Anthropic API key

1. console.anthropic.com → API keys → create new key `lsatprep-prod-<date>`
2. Update `.env`:
   ```bash
   sed -i "s|^ANTHROPIC_API_KEY=.*|ANTHROPIC_API_KEY=sk-ant-...|" .env
   ```
3. `./deploy/deploy-lambda.sh` (pushes the new key to Lambda env vars)
4. Revoke the old key in the Anthropic console.

### Shared secret

1. Generate new: `openssl rand -hex 32`
2. Update `.env`:
   ```bash
   sed -i "s|^SHARED_SECRET=.*|SHARED_SECRET=<new-hex>|" .env
   ```
3. `./deploy/deploy-lambda.sh` (pushes to Lambda env)
4. `./deploy/patch-frontend-config.sh` (rewrites `frontend/modules/config.js`)
5. `git commit -am "chore: rotate shared secret" && git push && ./deploy/deploy-frontend.sh`
6. Old clients will 401 until they refresh. That's acceptable; we have one user.

## Logs

### Lambda

```bash
aws --profile lsatprep --region us-east-1 logs tail /aws/lambda/lsatprep-api --since 10m
# or follow live:
aws --profile lsatprep --region us-east-1 logs tail /aws/lambda/lsatprep-api --follow
```

### Pages

GitHub → repo → Settings → Pages shows build status. Failed builds usually mean a file is malformed JSON or HTML.

### Browser

Open DevTools → Network tab → filter "lambda". You'll see the POST to `/explain`, `/writing-sample`, `/coach`, `/diagnostic`. Response bodies tell you if the Lambda returned an error shape.

## Costs

Expected at friend-scale (~1 hour/day of study):

| Source | Typical | Hard cap |
|---|---|---|
| AWS Lambda | $0 (free tier) | — |
| CloudWatch Logs | <$0.50 | — |
| Anthropic | $1–$5 | $10/month cap in Anthropic console |

**If the $5 budget alarm fires (email from AWS Budgets):**
1. Check CloudWatch: is the invocation alarm firing too? If so, something is hammering Lambda.
2. Revoke the `SHARED_SECRET`: `./deploy/rotate-secret.sh` (see above). This cuts off any caller that learned the old secret.
3. Check the Anthropic usage dashboard to see if the spend is on Anthropic's side.

**If Anthropic cap is hit ($10/mo):** no AI features work until next billing cycle. Non-AI features (drill, timed, full test, results) continue working from `questions.json`.

## Alarms

- **CloudWatch:** `lsatprep-api-invocation-spike` fires at >500 invocations/hour. This is a smoke alarm; 500 is loud.
- **Budget:** `lsatprep-monthly` emails at 80% of $5 actual spend.
- **Anthropic cap:** enforced server-side by Anthropic. Lambda gets 429 when exceeded.

## Teardown

```bash
AWS_PROFILE=lsatprep ./deploy/teardown.sh
# confirm each step
```

Teardown removes AWS-side resources. Manual follow-ups printed at the end:
- IAM user `lsatprep-deployer` and its access keys (console)
- Customer-managed policy `lsatprep-deployer-scoped` (console)
- Anthropic API key (console.anthropic.com)
- GitHub repo (`gh repo delete collincusce/lsatprep`)

## Known deferred work

- **Question bank** — currently 6 hand-written placeholder questions. Real 4,000-question generation is Tasks 18–32 of the plan, deferred to a dedicated session.
- **Rubric cards** in `docs/taxonomy/` — skeleton only.
- **Research dossier** at `docs/research/lsat-research-dossier.md` — not yet written.

## Troubleshooting

### "403 Forbidden" from Lambda Function URL

Resource policy missing. Check: `aws lambda get-policy --function-name lsatprep-api`. Should include both statements:
- `FunctionURLAllowPublicAccess` with action `lambda:InvokeFunctionUrl` + condition `FunctionUrlAuthType=NONE`
- `FunctionURLAllowPublicInvoke` with action `lambda:InvokeFunction`

Re-apply with `./deploy/setup-aws.sh` (idempotent).

### `Runtime.ImportModuleError: Cannot find module 'index'`

Handler config drifted. Re-run `./deploy/deploy-lambda.sh` — it sets `--handler src/index.handler`.

### Pages returns 404 but repo has files

Pages source is set to `gh-pages` branch. If you only pushed `main`, the content isn't on `gh-pages`. Run `./deploy/deploy-frontend.sh`.

### CORS errors in browser

Check `ALLOWED_ORIGIN` in `.env` matches your Pages origin exactly (no trailing slash): `https://collincusce.github.io`. Re-run `./deploy/deploy-lambda.sh` to push the updated env.

### Import merge drops all attempts

Happens when `bankVersion` in the imported file doesn't match the current bank. Expected — attempts reference question IDs that may no longer exist. Toast tells you how many were dropped.
