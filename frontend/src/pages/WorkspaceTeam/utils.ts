import { AdminRole } from '@graph/schemas';

import { GetBaseURL } from '../../util/window';

export const getProjectInvitationLink = (
    projectSecret: string,
    projectId: string
) => `${GetBaseURL()}/${projectId}/invite/${projectSecret}`;

export const roleToDisplayValueMapping = {
    [AdminRole.Admin]: 'Admin',
    [AdminRole.Member]: 'Member',
};
