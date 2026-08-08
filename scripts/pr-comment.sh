#!/usr/bin/env bash
# Posts tap-summary.md as a PR comment, editing the previous one in place so
# repeated pushes leave a single comment rather than a thread of them.
#
# Expects: GH_TOKEN, PR, GITHUB_REPOSITORY (the last is set by Actions).
set -euo pipefail

MARKER="<!-- tap-summary -->"
BODY="${MARKER}
$(cat tap-summary.md)"

# The marker is on the first line, so an exact prefix match identifies our own
# comment without matching anyone quoting the summary in a reply.
existing=$(gh api "repos/${GITHUB_REPOSITORY}/issues/${PR}/comments" \
  --paginate \
  --jq "map(select(.body | startswith(\"${MARKER}\"))) | .[0].id // empty")

if [ -n "${existing}" ]; then
  gh api -X PATCH "repos/${GITHUB_REPOSITORY}/issues/comments/${existing}" \
    -f body="${BODY}" --silent
  echo "Updated comment ${existing}."
else
  gh api -X POST "repos/${GITHUB_REPOSITORY}/issues/${PR}/comments" \
    -f body="${BODY}" --silent
  echo "Posted a new comment."
fi
