---
"@highlight-run/ui": patch
---

refactor: replace antd components with @highlight-run/ui equivalents

Removes all antd dependencies from the following components:
- `GitHubSettingsModal` — Select replaced with ComboboxSelect
- `GitHubEnhancementSettingsForm` — Form inputs replaced with native UI components  
- `AutoJoinForm` — Modal and form elements migrated to highlight-run/ui
- `AutoJoinInput` — Select components replaced with ComboboxSelect
- `NewProjectPage` — antd Select replaced with ComboboxSelect

Fixes #8635
