#!/usr/bin/env bash
# Syncs frontend/ to the gh-pages branch and pushes.
# GitHub Pages can only serve from repo root or /docs on a branch;
# we use gh-pages as a dedicated branch with the frontend at its root.
#
# Safe to re-run: always force-updates gh-pages from frontend/.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ -n "$(git status --porcelain)" ]; then
  echo "[deploy-frontend] Working tree has uncommitted changes. Commit or stash first." >&2
  git status --short
  exit 1
fi

WORKTREE="$(mktemp -d)"
trap 'rm -rf "$WORKTREE"' EXIT

# Create or check out gh-pages in a worktree
if git show-ref --verify --quiet refs/heads/gh-pages; then
  git worktree add "$WORKTREE" gh-pages
else
  # Create orphan branch if it does not exist yet
  git worktree add --detach "$WORKTREE"
  cd "$WORKTREE"
  git checkout --orphan gh-pages
  cd "$ROOT"
fi

# Wipe worktree contents (preserve .git metadata that worktree manages)
find "$WORKTREE" -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +

# Copy frontend contents to worktree root
cp -r frontend/. "$WORKTREE/"

# Add CNAME if you ever use a custom domain (leave commented out for now)
# echo "lsat.example.com" > "$WORKTREE/CNAME"

cd "$WORKTREE"
git add -A
if git diff --cached --quiet; then
  echo "[deploy-frontend] No changes to deploy."
else
  git -c user.name="deploy-frontend.sh" -c user.email="noreply@collincusce.github.io" \
    commit -q -m "deploy frontend $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  git push -u origin gh-pages
fi

cd "$ROOT"
git worktree remove "$WORKTREE"
echo "[deploy-frontend] Done. Pages URL: https://collincusce.github.io/lsatprep/"
