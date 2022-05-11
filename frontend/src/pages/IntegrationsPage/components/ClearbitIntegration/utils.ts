import {
    useGetProjectQuery,
    useGetWorkspaceQuery,
    useModifyClearbitIntegrationMutation,
} from '@graph/hooks';
import { namedOperations } from '@graph/operations';
import { useParams } from '@util/react-router/useParams';

export const useClearbitIntegration = () => {
    const { project_id } = useParams<{ project_id: string }>();
    const { loading: loadingProject, data: project } = useGetProjectQuery({
        variables: { id: project_id },
    });
    const workspaceID = project?.workspace?.id;
    const { loading: loadingWorkspace, data: workspace } = useGetWorkspaceQuery(
        {
            variables: { id: project?.workspace?.id || '' },
            skip: !project?.workspace?.id,
        }
    );
    const loading = loadingProject || loadingWorkspace;
    const isEnabled = !!workspace?.workspace?.clearbit_enabled;

    const [modifyClearbit] = useModifyClearbitIntegrationMutation({
        refetchQueries: [namedOperations.Query.GetWorkspace],
    });

    return {
        loading: loading,
        isClearbitIntegratedWithWorkspace: isEnabled,
        modifyClearbit: ({ enabled }: { enabled: boolean }) => {
            if (workspaceID) {
                modifyClearbit({
                    variables: {
                        workspace_id: workspaceID,
                        enabled: enabled,
                    },
                });
            }
        },
    };
};
