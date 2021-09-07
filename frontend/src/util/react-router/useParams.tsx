import { DEMO_WORKSPACE_PROXY_APPLICATION_ID } from '@components/DemoWorkspaceButton/DemoWorkspaceButton';
import { useParams as ReactRouterUseParams } from 'react-router';
import validator from 'validator';

/**
 * This is a proxy for `react-router`'s `useParams`.
 * Use this instead of using react-router's.
 *
 * Handles the following:
 * 1. If the organization_id is `'demo'`, then we set the `organization_id` to `'0'`. `'0'` is used in our backend to serve/handle the demo organization.
 */
// @ts-expect-error
export const useParams: typeof ReactRouterUseParams = () => {
    const matches: ReturnType<
        typeof ReactRouterUseParams
    > = ReactRouterUseParams();

    if (matches?.organization_id) {
        if (matches.organization_id === DEMO_WORKSPACE_PROXY_APPLICATION_ID) {
            return {
                ...matches,
                organization_id: '0',
            };
        }
        if (!validator.isNumeric(matches.organization_id)) {
            return {
                ...matches,
                organization_id: undefined,
            };
        }
    }

    return matches;
};
