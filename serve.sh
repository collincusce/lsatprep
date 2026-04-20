#!/usr/bin/env bash
# Dev-server helper. Uses npx serve since frontend has no build step.
set -euo pipefail
cd "$(dirname "$0")"
exec npx --yes serve -p 3000 .
