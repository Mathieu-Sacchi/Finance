#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./scripts/get_loan_calculator_local.sh [owner/repo] [target_dir]
# Example:
#   ./scripts/get_loan_calculator_local.sh your-org/Finance Finance

REPO_SLUG="${1:-$(gh repo view --json nameWithOwner -q '.nameWithOwner')}"
TARGET_DIR="${2:-Finance}"

if [[ -d "$TARGET_DIR/.git" ]]; then
  echo "Directory '$TARGET_DIR' already contains a git repo."
  echo "Choose another target dir or remove the existing one."
  exit 1
fi

echo "Cloning $REPO_SLUG into $TARGET_DIR..."
gh repo clone "$REPO_SLUG" "$TARGET_DIR"

cd "$TARGET_DIR"

echo "Starting loan calculator at http://localhost:8000"
python3 -m http.server 8000 --directory loan_calculator
