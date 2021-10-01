import { GetBaseURL } from '../../util/window';

export const getWorkspaceInvitationLink = (
    workspaceSecret: string,
    workspaceId: string
) => `${GetBaseURL()}/w/${workspaceId}/invite/${workspaceSecret}`;
