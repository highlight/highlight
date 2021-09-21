import { GetBaseURL } from '../../util/window';

export const getProjectInvitationLink = (
    projectSecret: string,
    projectId: string
) => `${GetBaseURL()}/${projectId}/invite/${projectSecret}`;
