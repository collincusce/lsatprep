#!/usr/bin/env bash
# Updates the Lambda function code and environment. Requires .env at repo
# root with ANTHROPIC_API_KEY, SHARED_SECRET, ALLOWED_ORIGIN, LAMBDA_FUNCTION_URL.
# Never prints the API key.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "[deploy-lambda] .env not found at $ENV_FILE — aborting." >&2
  exit 1
fi
set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a

: "${ANTHROPIC_API_KEY:?missing in .env}"
: "${SHARED_SECRET:?missing in .env (run setup-aws.sh first)}"
: "${ALLOWED_ORIGIN:?missing in .env}"

FUNCTION_NAME="${FUNCTION_NAME:-lsatprep-api}"
AWS_PROFILE="${AWS_PROFILE:-lsatprep}"
AWS_REGION="${AWS_REGION:-us-east-1}"

echo "[deploy-lambda] building zip..."
"$ROOT/deploy/build-lambda.sh"

echo "[deploy-lambda] uploading code to Lambda $FUNCTION_NAME..."
aws lambda update-function-code \
  --function-name "$FUNCTION_NAME" \
  --zip-file "fileb://$ROOT/lambda/dist/lsatprep-api.zip" \
  --profile "$AWS_PROFILE" --region "$AWS_REGION" > /dev/null

echo "[deploy-lambda] waiting for update..."
aws lambda wait function-updated \
  --function-name "$FUNCTION_NAME" \
  --profile "$AWS_PROFILE" --region "$AWS_REGION"

echo "[deploy-lambda] updating env vars..."
aws lambda update-function-configuration \
  --function-name "$FUNCTION_NAME" \
  --environment "Variables={ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY,SHARED_SECRET=$SHARED_SECRET,ALLOWED_ORIGIN=$ALLOWED_ORIGIN}" \
  --profile "$AWS_PROFILE" --region "$AWS_REGION" > /dev/null

echo "[deploy-lambda] done."
