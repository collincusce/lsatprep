#!/usr/bin/env bash
set -eu
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
while IFS= read -r line || [ -n "$line" ]; do
  case "$line" in ''|\#*) continue ;; esac
  key="${line%%=*}"
  val="${line#*=}"
  if [[ "$val" == \"*\" || "$val" == \'*\' ]]; then val="${val:1:${#val}-2}"; fi
  export "$key=$val"
done < "$ROOT/.env"

: "${LAMBDA_FUNCTION_URL:?not set}"
: "${SHARED_SECRET:?not set}"

# Safely embed values into JS using JSON.stringify equivalence.
# Simple escape: we replace " with \" and \ with \\. URL/secret shouldn't have either,
# but belt and suspenders.
esc() { printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'; }

cat > "$ROOT/frontend/modules/config.js" <<CONFIG
// Build-time configuration. Rewritten by deploy/_patch-config.sh after setup-aws.sh.
// The shared secret is visible in the shipped JS — this is anti-drive-by
// obscurity only; the real hard stops are CORS, reserved concurrency, and the
// Anthropic monthly cap.

export const CONFIG = {
  lambdaUrl: "$(esc "$LAMBDA_FUNCTION_URL")",
  sharedSecret: "$(esc "$SHARED_SECRET")",
  bankVersionExpected: "2026-04-19-placeholder"
};
CONFIG

echo "[patch-config] wrote frontend/modules/config.js (lambdaUrl set, sharedSecret ${#SHARED_SECRET} chars)"
