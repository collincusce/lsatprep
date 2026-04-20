// Build-time configuration. Rewritten by deploy/_patch-config.sh after setup-aws.sh.
// The shared secret is visible in the shipped JS — this is anti-drive-by
// obscurity only; the real hard stops are CORS, reserved concurrency, and the
// Anthropic monthly cap.

export const CONFIG = {
  lambdaUrl: "https://air3kgsbrvlgyf4lhzqd76vije0plaff.lambda-url.us-east-1.on.aws/",
  sharedSecret: "1091f5bccb49f1f1d6ddad992b132f49a380eb43d85ee0f7566f1d1fb8516234",
  bankVersionExpected: "2026-04-19-placeholder"
};
