import {
    useAddIntegrationToProjectMutation,
    useGetWorkspaceIsIntegratedWithLinearQuery,
    useRemoveIntegrationFromProjectMutation,
} from '@graph/hooks';
import { namedOperations } from '@graph/operations';
import { IntegrationType } from '@graph/schemas';
import { useParams } from '@util/react-router/useParams';
import { GetBaseURL } from '@util/window';
import { useCallback } from 'react';

const LINEAR_SCOPES = ['read', 'issues:create', 'comments:create'];

export const useLinearIntegration = () => {
    const { project_id } = useParams<{ project_id: string }>();

    const [addIntegrationToProject] = useAddIntegrationToProjectMutation({
        refetchQueries: [
            namedOperations.Query.GetWorkspaceIsIntegratedWithLinear,
        ],
    });

    const addLinearIntegrationToProject = useCallback(
        (code: string, projectId?: string) =>
            addIntegrationToProject({
                variables: {
                    integration_type: IntegrationType.Linear,
                    code: code,
                    project_id: projectId || project_id,
                },
            }),
        [project_id, addIntegrationToProject]
    );

    const [
        removeIntegrationFromProject,
    ] = useRemoveIntegrationFromProjectMutation({
        refetchQueries: [
            namedOperations.Query.GetWorkspaceIsIntegratedWithLinear,
        ],
    });

    const removeLinearIntegrationFromProject = useCallback(
        (projectId?: string) =>
            removeIntegrationFromProject({
                variables: {
                    integration_type: IntegrationType.Linear,
                    project_id: projectId || project_id,
                },
            }),
        [project_id, removeIntegrationFromProject]
    );

    const { data, loading, error } = useGetWorkspaceIsIntegratedWithLinearQuery(
        {
            variables: { project_id: project_id },
            skip: !project_id,
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

    const authUrl = `https://linear.app/oauth/authorize?client_id=f60ff43c7376d0aceaa1e111db39e60d&prompt=consent&response_type=code&scope=${encodeURIComponent(
        LINEAR_SCOPES.join(',')
    )}&state=${btoa(JSON.stringify(state))}&redirect_uri=${encodeURIComponent(
        redirectUri
    )}`;

    return authUrl;
};
