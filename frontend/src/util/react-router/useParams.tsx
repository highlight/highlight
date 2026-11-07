import { createContext, useContext } from 'react'
// This is the implementation for our custom useParams, exempting from rule
// eslint-disable-next-line no-restricted-imports
import { useParams as ReactRouterUseParams } from 'react-router-dom'

/**
 * Supplies contextual route parameter overrides so workspace-scoped settings
 * panels can inject a selected project_id into project-scoped integration hooks.
 */
export const ParamsOverrideContext = createContext<
	Record<string, string | undefined>
>({})

/**
 * This is a proxy for `react-router`'s `useParams`.
 * Use this instead of using react-router's.
 *
 * Handles the following:
 * 1. If the project_id is `'demo'`, then we set the `project_id` to `DEMO_PROJECT_ID`.
 * 2. Merges contextual parameter overrides when rendered inside workspace settings.
 */
// @ts-expect-error
export const useParams: typeof ReactRouterUseParams = () => {
	const matches: ReturnType<typeof ReactRouterUseParams> =
		ReactRouterUseParams()
	const overrides = useContext(ParamsOverrideContext)

	return {
		...matches,
		...overrides,
	}
}
