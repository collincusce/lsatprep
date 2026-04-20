#!/usr/bin/env bash
# Deletes every AWS resource tagged project=lsatprep AND removes the project's
# IAM role, Lambda, Function URL, SNS topic, CloudWatch alarm, log group, and Budget.
#
# DESTRUCTIVE. Always confirms before each delete. Safe to re-run.
set -u

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
AWS_PROFILE="${AWS_PROFILE:-lsatprep}"
AWS_REGION="${AWS_REGION:-us-east-1}"
ACCOUNT_ID=$(aws --profile "$AWS_PROFILE" --region "$AWS_REGION" sts get-caller-identity --query Account --output text)

aws_cli() { aws --profile "$AWS_PROFILE" --region "$AWS_REGION" "$@"; }

confirm() {
  local prompt="$1"
  if [ "${YES:-}" = "1" ]; then return 0; fi
  read -r -p "$prompt [y/N] " r
  [[ "$r" =~ ^[Yy]$ ]]
}

echo "=== lsatprep teardown ==="
echo "Account: $ACCOUNT_ID   Region: $AWS_REGION   Profile: $AWS_PROFILE"
echo "This will delete Lambda, Function URL, IAM role, SNS topic, CloudWatch alarm, log group, Budget."
echo "It will NOT delete the IAM user lsatprep-deployer or its access keys (remove those manually in IAM console)."
echo
if ! confirm "Proceed?"; then echo "Aborted."; exit 1; fi

# 1. Function URL + Lambda
if aws_cli lambda get-function --function-name lsatprep-api >/dev/null 2>&1; then
  if confirm "Delete Function URL config for lsatprep-api?"; then
    aws_cli lambda delete-function-url-config --function-name lsatprep-api 2>&1 | head -3 || true
  fi
  if confirm "Delete Lambda lsatprep-api?"; then
    aws_cli lambda delete-function --function-name lsatprep-api 2>&1 | head -3 || true
  fi
fi

# 2. IAM role
if aws_cli iam get-role --role-name lsatprep-lambda-role >/dev/null 2>&1; then
  if confirm "Delete IAM role lsatprep-lambda-role?"; then
    aws_cli iam detach-role-policy --role-name lsatprep-lambda-role --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole 2>&1 | head -3 || true
    aws_cli iam delete-role --role-name lsatprep-lambda-role 2>&1 | head -3 || true
  fi
fi

# 3. CloudWatch alarm
if confirm "Delete CloudWatch alarm lsatprep-api-invocation-spike?"; then
  aws_cli cloudwatch delete-alarms --alarm-names lsatprep-api-invocation-spike 2>&1 | head -3 || true
fi

# 4. CloudWatch log group
if confirm "Delete log group /aws/lambda/lsatprep-api?"; then
  aws_cli logs delete-log-group --log-group-name /aws/lambda/lsatprep-api 2>&1 | head -3 || true
fi

# 5. SNS topic
TOPIC_ARN="arn:aws:sns:$AWS_REGION:$ACCOUNT_ID:lsatprep-alarms"
if confirm "Delete SNS topic $TOPIC_ARN?"; then
  aws_cli sns delete-topic --topic-arn "$TOPIC_ARN" 2>&1 | head -3 || true
fi

# 6. Budget
if confirm "Delete AWS Budget lsatprep-monthly?"; then
  aws_cli budgets delete-budget --account-id "$ACCOUNT_ID" --budget-name lsatprep-monthly 2>&1 | head -3 || true
fi

echo "=== teardown done ==="
echo "Manual follow-ups (safety):"
echo "  - IAM user 'lsatprep-deployer' + its access keys (IAM console → Users)"
echo "  - Customer-managed policy 'lsatprep-deployer-scoped' (IAM console → Policies)"
echo "  - Anthropic API key 'lsatprep-prod' (console.anthropic.com → API keys)"
echo "  - GitHub repo 'collincusce/lsatprep' (gh repo delete, or leave for archive)"
