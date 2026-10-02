---
"@highlight-run/ui": patch
---

refactor: replace targeted antd usage with Highlight UI components

Removes targeted antd usage from the following components:
- `GitHubSettingsModal` - Select replaced with ComboboxSelect
- `GitHubEnhancementSettingsForm` - Select replaced with ComboboxSelect
- `AutoJoinForm` - Checkbox replaced with native input
- `AutoJoinInput` - Checkbox and Divider replaced with native/highlight UI
- `NewProjectPage` - Divider replaced with highlight UI

Fixes #8635
