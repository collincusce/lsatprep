#!/usr/bin/env bash
# Builds lambda/dist/lsatprep-api.zip containing src/ + production node_modules.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/lambda"

rm -rf dist
mkdir -p dist

# Install only prod deps into a scratch dir to keep the zip small.
npm ci --omit=dev --no-audit --no-fund > /dev/null 2>&1 || npm install --omit=dev --no-audit --no-fund > /dev/null 2>&1

STAGE="$(mktemp -d)"
cp -r src "$STAGE/"
cp package.json "$STAGE/"
cp -r node_modules "$STAGE/"

if command -v zip >/dev/null; then
  (cd "$STAGE" && zip -rq "$ROOT/lambda/dist/lsatprep-api.zip" .)
else
  python3 -c "
import zipfile, os, sys
stage = sys.argv[1]
out = sys.argv[2]
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for root, _, files in os.walk(stage):
        for f in files:
            full = os.path.join(root, f)
            rel = os.path.relpath(full, stage)
            z.write(full, rel)
" "$STAGE" "$ROOT/lambda/dist/lsatprep-api.zip"
fi

rm -rf "$STAGE"

SIZE="$(du -h "$ROOT/lambda/dist/lsatprep-api.zip" | cut -f1)"
echo "[build-lambda] OK — dist/lsatprep-api.zip ($SIZE)"
