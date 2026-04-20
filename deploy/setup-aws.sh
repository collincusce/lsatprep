#!/usr/bin/env bash
# One-time AWS setup for lsatprep. Idempotent: safe to rerun.
#
# Creates:
#   - IAM role: lsatprep-lambda-role (with AWSLambdaBasicExecutionRole)
#   - Lambda: lsatprep-api (Node 20, 512MB, 30s timeout, reserved concurrency 3)
#   - Function URL: auth NONE, streaming, CORS to $ALLOWED_ORIGIN, X-LSATPrep-Token allowed
#   - SNS topic: lsatprep-alarms (subscribed to $ALARM_EMAIL)
#   - CloudWatch alarm: Lambda invocations > 500 / hour → SNS
#   - AWS Budget: $5/month actual → email
#
# Writes SHARED_SECRET and LAMBDA_FUNCTION_URL back into $ROOT/.env.
# Never prints ANTHROPIC_API_KEY.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "[setup-aws] .env not found at $ENV_FILE — aborting." >&2
  exit 1
fi

# Load .env without shell expansion (values may contain $, `, etc.).
while IFS= read -r line || [ -n "$line" ]; do
  case "$line" in ''|\#*) continue ;; esac
  key="${line%%=*}"
  val="${line#*=}"
  if [[ "$val" == \"*\" || "$val" == \'*\' ]]; then val="${val:1:${#val}-2}"; fi
  export "$key=$val"
done < "$ENV_FILE"

: "${ANTHROPIC_API_KEY:?missing in .env}"
: "${ALARM_EMAIL:?missing in .env}"
: "${ALLOWED_ORIGIN:?missing in .env}"

AWS_PROFILE="${AWS_PROFILE:-lsatprep}"
AWS_REGION="${AWS_REGION:-us-east-1}"
FUNCTION_NAME="${FUNCTION_NAME:-lsatprep-api}"
ROLE_NAME="lsatprep-lambda-role"
TOPIC_NAME="lsatprep-alarms"
TAGS="project=lsatprep"

aws_cli() { aws --profile "$AWS_PROFILE" --region "$AWS_REGION" "$@"; }

ACCOUNT_ID="$(aws_cli sts get-caller-identity --query Account --output text)"
echo "[setup-aws] account $ACCOUNT_ID region $AWS_REGION"

# 1. SHARED_SECRET
if [ -z "${SHARED_SECRET:-}" ]; then
  SHARED_SECRET="$(openssl rand -hex 32)"
  if grep -q '^SHARED_SECRET=' "$ENV_FILE"; then
    sed -i "s|^SHARED_SECRET=.*|SHARED_SECRET=$SHARED_SECRET|" "$ENV_FILE"
  else
    echo "SHARED_SECRET=$SHARED_SECRET" >> "$ENV_FILE"
  fi
  echo "[setup-aws] generated SHARED_SECRET and wrote to .env"
else
  echo "[setup-aws] reusing existing SHARED_SECRET"
fi

# 2. IAM role
if ! aws_cli iam get-role --role-name "$ROLE_NAME" > /dev/null 2>&1; then
  echo "[setup-aws] creating IAM role $ROLE_NAME"
  aws_cli iam create-role \
    --role-name "$ROLE_NAME" \
    --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}' \
    --tags "Key=project,Value=lsatprep" > /dev/null
  aws_cli iam attach-role-policy \
    --role-name "$ROLE_NAME" \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
  # IAM role settles slowly; sleep to avoid "cannot be assumed" on next step.
  sleep 10
else
  echo "[setup-aws] IAM role $ROLE_NAME exists"
fi
ROLE_ARN="arn:aws:iam::$ACCOUNT_ID:role/$ROLE_NAME"

# 3. Lambda placeholder
PLACEHOLDER_ZIP="$(mktemp /tmp/lsatprep-placeholder.XXXXXX.zip)"
WORKDIR="$(mktemp -d)"
cat > "$WORKDIR/index.mjs" <<'PLACEHOLDER'
export const handler = async () => ({ statusCode: 200, body: 'placeholder — run deploy-lambda.sh' });
PLACEHOLDER
(cd "$WORKDIR" && zip -q "$PLACEHOLDER_ZIP" index.mjs)
rm -rf "$WORKDIR"

if ! aws_cli lambda get-function --function-name "$FUNCTION_NAME" > /dev/null 2>&1; then
  echo "[setup-aws] creating Lambda $FUNCTION_NAME"
  aws_cli lambda create-function \
    --function-name "$FUNCTION_NAME" \
    --runtime nodejs20.x \
    --role "$ROLE_ARN" \
    --handler index.handler \
    --zip-file "fileb://$PLACEHOLDER_ZIP" \
    --memory-size 512 \
    --timeout 30 \
    --tags "$TAGS" > /dev/null
  aws_cli lambda put-function-concurrency \
    --function-name "$FUNCTION_NAME" \
    --reserved-concurrent-executions 3 > /dev/null
else
  echo "[setup-aws] Lambda $FUNCTION_NAME exists"
fi
rm -f "$PLACEHOLDER_ZIP"

# 4. Function URL (streaming, auth NONE, CORS)
if ! aws_cli lambda get-function-url-config --function-name "$FUNCTION_NAME" > /dev/null 2>&1; then
  echo "[setup-aws] creating Function URL"
  aws_cli lambda create-function-url-config \
    --function-name "$FUNCTION_NAME" \
    --auth-type NONE \
    --invoke-mode RESPONSE_STREAM \
    --cors "AllowOrigins=$ALLOWED_ORIGIN,AllowMethods=POST,AllowMethods=OPTIONS,AllowHeaders=content-type,AllowHeaders=x-lsatprep-token,MaxAge=600" > /dev/null || true
  aws_cli lambda add-permission \
    --function-name "$FUNCTION_NAME" \
    --statement-id FunctionURLAllowPublicAccess \
    --principal "*" \
    --action lambda:InvokeFunctionUrl \
    --function-url-auth-type NONE > /dev/null
fi
LAMBDA_FUNCTION_URL="$(aws_cli lambda get-function-url-config --function-name "$FUNCTION_NAME" --query FunctionUrl --output text)"
if grep -q '^LAMBDA_FUNCTION_URL=' "$ENV_FILE"; then
  sed -i "s|^LAMBDA_FUNCTION_URL=.*|LAMBDA_FUNCTION_URL=$LAMBDA_FUNCTION_URL|" "$ENV_FILE"
else
  echo "LAMBDA_FUNCTION_URL=$LAMBDA_FUNCTION_URL" >> "$ENV_FILE"
fi
echo "[setup-aws] Function URL: $LAMBDA_FUNCTION_URL"

# 5. SNS topic + email subscription
TOPIC_ARN="$(aws_cli sns create-topic --name "$TOPIC_NAME" --tags "Key=project,Value=lsatprep" --query TopicArn --output text)"
aws_cli sns subscribe --topic-arn "$TOPIC_ARN" --protocol email --notification-endpoint "$ALARM_EMAIL" > /dev/null
echo "[setup-aws] SNS topic $TOPIC_ARN (check $ALARM_EMAIL to confirm subscription)"

# 6. CloudWatch alarm: Invocations > 500 / hour
aws_cli cloudwatch put-metric-alarm \
  --alarm-name lsatprep-api-invocation-spike \
  --alarm-description "Too many Lambda invocations for lsatprep-api" \
  --metric-name Invocations --namespace AWS/Lambda --statistic Sum \
  --dimensions "Name=FunctionName,Value=$FUNCTION_NAME" \
  --period 3600 --evaluation-periods 1 --threshold 500 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions "$TOPIC_ARN" \
  --tags "Key=project,Value=lsatprep"

# 7. AWS Budget: $5/month actual → email
cat > /tmp/lsatprep-budget.json <<JSON
{"BudgetName":"lsatprep-monthly","BudgetType":"COST","TimeUnit":"MONTHLY","BudgetLimit":{"Amount":"5","Unit":"USD"},"CostTypes":{"IncludeCredit":true,"IncludeDiscount":true,"IncludeOtherSubscription":true,"IncludeRecurring":true,"IncludeRefund":false,"IncludeSubscription":true,"IncludeSupport":true,"IncludeTax":true,"IncludeUpfront":true,"UseAmortized":false,"UseBlended":false}}
JSON
cat > /tmp/lsatprep-notifications.json <<JSON
[{"Notification":{"NotificationType":"ACTUAL","ComparisonOperator":"GREATER_THAN","Threshold":80,"ThresholdType":"PERCENTAGE","NotificationState":"ALARM"},"Subscribers":[{"SubscriptionType":"EMAIL","Address":"$ALARM_EMAIL"}]}]
JSON
aws_cli budgets create-budget \
  --account-id "$ACCOUNT_ID" \
  --budget file:///tmp/lsatprep-budget.json \
  --notifications-with-subscribers file:///tmp/lsatprep-notifications.json 2>/dev/null \
  || echo "[setup-aws] budget already exists (ok)"
rm -f /tmp/lsatprep-budget.json /tmp/lsatprep-notifications.json

echo "[setup-aws] done. Next: ./deploy/deploy-lambda.sh"
