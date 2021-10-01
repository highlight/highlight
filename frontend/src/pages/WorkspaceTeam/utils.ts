import { GetBaseURL } from '../../util/window';

export const getProjectInvitationLink = (
    workspaceSecret: string,
    workspaceId: string
) => `${GetBaseURL()}/w/${workspaceId}/invite/${workspaceSecret}`;
