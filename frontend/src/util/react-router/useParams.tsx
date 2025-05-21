// This is the implementation for our custom useParams, exempting from rule
// eslint-disable-next-line no-restricted-imports
import { useParams as ReactRouterUseParams } from 'react-router-dom'

/**
 * This is a proxy for `react-router`'s `useParams`.
 * Use this instead of using react-router's.
 *
 * Handles the following:
 * 1. If the project_id is `'demo'`, then we set the `project_id` to `DEMO_PROJECT_ID`.
 */
// @ts-expect-error
export const useParams: typeof ReactRouterUseParams = () => {
	const matches: ReturnType<typeof ReactRouterUseParams> =
		ReactRouterUseParams()

	return matches
}
