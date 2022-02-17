import {
    useAddLinearIntegrationToProjectMutation,
    useGetWorkspaceIsIntegratedWithLinearQuery,
    useRemoveLinearIntegrationFromProjectMutation,
} from '@graph/hooks';
import { namedOperations } from '@graph/operations';
import { useParams } from '@util/react-router/useParams';
import { GetBaseURL } from '@util/window';

const LINEAR_SCOPES = ['read', 'issues:create', 'comments:create'];

export const useLinearIntegration = () => {
    const { project_id } = useParams<{ project_id: string }>();
    const [
        addLinearIntegrationToProject,
    ] = useAddLinearIntegrationToProjectMutation({
        refetchQueries: [
            namedOperations.Query.GetWorkspaceIsIntegratedWithLinear,
        ],
    });

    const [
        removeLinearIntegrationFromProject,
    ] = useRemoveLinearIntegrationFromProjectMutation({
        refetchQueries: [
            namedOperations.Query.GetWorkspaceIsIntegratedWithLinear,
        ],
    });

    const { data, loading, error } = useGetWorkspaceIsIntegratedWithLinearQuery(
        {
            variables: { project_id },
        }
    );

    return {
        addLinearIntegrationToProject,
        removeLinearIntegrationFromProject,
        isLinearIntegratedWithProject: data?.is_integrated_with_linear,
        loading,
        error,
    };
};

export const getLinearOAuthUrl = (projectId: string) => {
    let redirectPath = window.location.pathname;
    if (redirectPath.length > 3) {
        // remove project_id and prepended slash
        redirectPath = redirectPath.substring(redirectPath.indexOf('/', 1) + 1);
    }

    const state = { next: redirectPath, project_id: projectId };

    const redirectUri = `${GetBaseURL()}/callback/linear`;

    const authUrl = `https://linear.app/oauth/authorize?client_id=f60ff43c7376d0aceaa1e111db39e60d&response_type=code&scope=${encodeURIComponent(
        LINEAR_SCOPES.join(',')
    )}&state=${btoa(JSON.stringify(state))}&redirect_uri=${encodeURIComponent(
        redirectUri
    )}`;

    return authUrl;
};
