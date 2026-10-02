---
'@highlight-run/frontend': patch
---

refactor: migrate integration configs and settings pages to @highlight-run/ui

Replace legacy antd/custom CSS components across 14 integration configuration pages
and 8+ settings pages with @highlight-run/ui design system primitives (Box, Stack,
Text, Button, Form, Select). Remove 15 orphaned CSS module files. All changes
verified with zero TypeScript compilation errors.
