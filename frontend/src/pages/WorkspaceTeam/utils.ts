import { GetBaseURL } from '../../util/window';

export const getOrganizationInvitationLink = (
    organizationSecret: string,
    organizationId: string
) => `${GetBaseURL()}/${organizationId}/invite/${organizationSecret}`;
