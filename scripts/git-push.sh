#!/usr/bin/env bash
# Independent git commit and push script
# Usage: ./scripts/git-push.sh "your optional commit message"

set -euo pipefail

cd "$(dirname "$0")/.."   # project root

echo "=== Git Status ==="
git status -s

if [[ -t 0 ]]; then
  read -r -p "Do you want to stage and push all changes? [Y/n] " answer
  [[ "$answer" =~ ^[Yy]$ ]] || { echo "Cancelled."; exit 0; }
fi

DEFAULT_MSG="update: $(date '+%Y-%m-%d %H:%M:%S')"
COMMIT_MSG="${1:-$DEFAULT_MSG}"

git add -A
if git diff --cached --quiet; then
  echo "No changes to commit. Pushing current HEAD..."
else
  git commit -m "$COMMIT_MSG"
  echo "Committed with message: '$COMMIT_MSG'"
fi

git push
echo "Push complete!"
