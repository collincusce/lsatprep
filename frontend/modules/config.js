// Build-time configuration. Real values are written in by
// `deploy/deploy-lambda.sh` after AWS setup completes.

export const CONFIG = {
  lambdaUrl: 'https://PLACEHOLDER.lambda-url.us-east-1.on.aws/',
  sharedSecret: 'PLACEHOLDER_SHARED_SECRET',
  bankVersionExpected: '2026-04-19-placeholder'
};
