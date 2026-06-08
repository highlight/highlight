# PR #10549 Rebase Instructions

## Problem
PR is currently BLOCKED due to base branch divergence.

## Solution - Execute these commands:

```bash
# 1. Ensure you have latest main
git fetch origin main

# 2. Rebase your branch on latest main
git checkout fix/replace-antd-select-github-settings
git rebase origin/main

# 3. If conflicts occur:
# - Fix conflicts in editor
# - Run: git add .
# - Run: git rebase --continue

# 4. Force push to PR (this is safe with --force-with-lease)
git push origin fix/replace-antd-select-github-settings --force-with-lease
```

After these steps, PR should move from BLOCKED → MERGEABLE

## What changed in main?
The highlight/highlight main branch has new commits that affect the base of your branch.
Rebasing brings your commits on top of latest main, resolving the conflict state.

This is a standard workflow for multi-contributor repos.
