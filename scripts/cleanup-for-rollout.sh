#!/bin/bash
# Bash Cleanup Script for Viral Views Rollout
# Removes unnecessary files/folders before build/deploy

set -e

pathsToRemove=(
  "src/__tests__"
  "notebooks"
  "scripts/deploy-production.sh"
  "scripts/optimize-firestore.sh"
  "scripts/setup-verification.sh"
  "cypher-test.js"
)

for path in "${pathsToRemove[@]}"; do
  if [ -e "$path" ]; then
    rm -rf "$path"
    echo "Removed: $path"
  else
    echo "Not found (skipped): $path"
  fi
done

echo "Cleanup complete. Ready for build and deployment."
