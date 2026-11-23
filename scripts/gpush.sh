#!/usr/bin/env bash
# Independent git commit and push script
# Usage: ./scripts/git-push.sh [optional commit message]

set -euo pipefail

cd "$(dirname "$0")/.."   # project root

AUTHOR_NAME="${GIT_AUTHOR_SHORT_NAME:-dov}"

# Find the highest existing <AUTHOR_NAME>_<digits> in commit subjects and increment it
last_num=$(
  git log --format="%s" 2>/dev/null \
    | grep -oE "^${AUTHOR_NAME}_[0-9]+" \
    | sed -E "s/^${AUTHOR_NAME}_//" \
    | sort -n \
    | tail -n 1 || true
)

if [[ -z "$last_num" ]]; then
  next_num_raw=1
else
  # Use 10# to avoid octal interpretation on leading zeros like 08 or 09
  next_num_raw=$((10#$last_num + 1))
fi

# Roll over back to 1 once it passes 99
if (( next_num_raw > 99 )); then
  next_num_raw=1
fi

nn=$(printf "%02d" "$next_num_raw")
BASE_MSG="${AUTHOR_NAME}_${nn}"

echo "=== Git Status ==="
git status -s

if [[ -t 0 ]]; then
  read -r -p "Do you want to stage and push all changes? [Y/n] " answer
  answer="${answer:-Y}"
  [[ "$answer" =~ ^[Yy]$ ]] || { echo "Cancelled."; exit 0; }
fi

if [[ $# -gt 0 && -n "$1" ]]; then
  COMMIT_MSG="$1"
elif [[ -t 0 ]]; then
  echo "Default commit message: $BASE_MSG"
  read -r -p "Press Enter for '$BASE_MSG', or type extra text to append: " extra_note
  if [[ -n "$extra_note" ]]; then
    COMMIT_MSG="${BASE_MSG}: ${extra_note}"
  else
    COMMIT_MSG="$BASE_MSG"
  fi
else
  COMMIT_MSG="$BASE_MSG"
fi

git add -A
if git diff --cached --quiet; then
  echo "No changes to commit. Pushing current HEAD..."
else
  git commit -m "$COMMIT_MSG"
  echo "Committed with message: '$COMMIT_MSG'"
fi

git push
echo "Push complete!"