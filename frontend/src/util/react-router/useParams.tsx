import { DEMO_WORKSPACE_PROXY_APPLICATION_ID } from '@components/DemoWorkspaceButton/DemoWorkspaceButton'
import { useParams as ReactRouterUseParams } from 'react-router'
import validator from 'validator'

/**
 * This is a proxy for `react-router`'s `useParams`.
 * Use this instead of using react-router's.
 *
 * Handles the following:
 * 1. If the project_id is `'demo'`, then we set the `project_id` to `'0'`. `'0'` is used in our backend to serve/handle the demo project.
 */
// @ts-expect-error
export const useParams: typeof ReactRouterUseParams = () => {
	const matches: ReturnType<typeof ReactRouterUseParams> =
		ReactRouterUseParams()

	if (typeof matches === 'object' && matches?.project_id) {
		if (matches.project_id === DEMO_WORKSPACE_PROXY_APPLICATION_ID) {
			return {
				...matches,
				project_id: '0',
			} as const
		}
		if (!validator.isNumeric(matches.project_id)) {
			return {
				...matches,
				project_id: undefined,
			} as const
		}
	}

	return matches
}
