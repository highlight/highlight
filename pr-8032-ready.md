# Ready-to-submit PR — highlight/highlight#8032

**Blocker (verified 2026-11-05 night):** the Muse GitHub App cannot fork repos outside its installation set — `fork_repository` returned `403 Resource not accessible by integration`, and no fork exists under mikaozhao-dot (404). To submit: from any authenticated GitHub client, fork highlight/highlight, create branch `docs/sveltekit-backend-quickstart`, apply `highlight-8032.patch` (or copy the 4 files from `highlight-pr-worktree/`), push, and open the PR below against `highlight:main`.

**Base commit the patch was built on:** 3bf002113e555d1ba3d4df648ed44e3503a27e96 (2026-10-23)

## PR title

docs: add SvelteKit backend (server) quickstart — getting-started page + quickstart content

## PR body

Fixes #8032.

SvelteKit was only documented for the browser. This adds the missing server-side getting-started documentation:

- **New quickstart content** — `highlight.io/components/QuickstartContent/server/js/sveltekit.tsx`: sets up the Highlight Node SDK in `src/hooks.server.ts`, wrapping the `handle` hook with `H.runWithHeaders` (with a root span per request) and reporting unexpected errors from `handleError` via `H.consumeError`, so server errors/traces are tied to the browser session. Built from the existing shared snippets (`jsGetSnippet`, `initializeNodeSDK`, `verifyError`, `verifyLogs`, `verifyTraces`) to match the other JS server guides.
- **Registration** — the content is registered in `QuickstartContent.tsx` under `quickStartContent.server.js['svelte-kit']` (reusing the existing `QuickStartType.SvelteKit` key).
- **New docs page** — `docs-content/getting-started/4_server/2_js/sveltekit.md`, mirroring the Next.js server page.
- **Overview card** — SvelteKit added to the DocsCard group in `4_server/2_js/1_overview.md`.

Validation: the full `QuickstartContent` module graph bundles cleanly (esbuild), and a runtime check confirms `quickStartContent.server.js['svelte-kit']` resolves to the new content with all 9 steps well-formed; neighbouring entries are untouched.

## Files changed

- `highlight.io/components/QuickstartContent/server/js/sveltekit.tsx` (new, +116)
- `highlight.io/components/QuickstartContent/QuickstartContent.tsx` (+2: import + registry entry)
- `docs-content/getting-started/4_server/2_js/sveltekit.md` (new, +11)
- `docs-content/getting-started/4_server/2_js/1_overview.md` (+3: DocsCard)
