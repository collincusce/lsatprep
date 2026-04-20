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

pushd "$STAGE" > /dev/null
zip -rq "$ROOT/lambda/dist/lsatprep-api.zip" src package.json node_modules
popd > /dev/null

rm -rf "$STAGE"

SIZE="$(du -h "$ROOT/lambda/dist/lsatprep-api.zip" | cut -f1)"
echo "[build-lambda] OK — dist/lsatprep-api.zip ($SIZE)"
