import {
    useGenerateNewZapierAccessTokenJwtQuery,
    useGetWorkspaceIsIntegratedWithZapierQuery,
    useRemoveIntegrationFromProjectMutation,
} from '@graph/hooks';
import { namedOperations } from '@graph/operations';
import { IntegrationType } from '@graph/schemas';
import { useParams } from '@util/react-router/useParams';
import { useCallback, useEffect } from 'react';

const REPOLL_INTERVAL = 2000;

export const useZapierIntegration = (props?: { repoll?: boolean }) => {
    const { repoll } = props || {};
    const { project_id } = useParams<{ project_id: string }>();
    const {
        data,
        loading,
        stopPolling,
        startPolling,
    } = useGetWorkspaceIsIntegratedWithZapierQuery({
        variables: { project_id: project_id },
    });

    useEffect(() => {
        if (repoll) {
            startPolling(REPOLL_INTERVAL);
        } else {
            stopPolling();
        }
    }, [repoll, startPolling, stopPolling]);

    const {
        data: jwtToken,
        loading: loadingJwt,
    } = useGenerateNewZapierAccessTokenJwtQuery({
        variables: { project_id: project_id },
    });

    const [
        removeIntegrationFromProject,
    ] = useRemoveIntegrationFromProjectMutation({
        refetchQueries: [
            namedOperations.Query.GetWorkspaceIsIntegratedWithLinear,
        ],
    });

    const removeZapierIntegrationFromProject = useCallback(
        (projectId?: string) =>
            removeIntegrationFromProject({
                variables: {
                    integration_type: IntegrationType.Zapier,
                    project_id: projectId || project_id,
                },
            }),
        [project_id, removeIntegrationFromProject]
    );

    return {
        loading: loading || loadingJwt,
        removeZapierIntegrationFromProject,
        generatedJwtToken: jwtToken?.generate_zapier_access_token,
        isZapierIntegratedWithProject: data?.is_integrated_with_linear,
    };
};
