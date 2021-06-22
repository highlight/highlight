export const getOrganizationInvitationLink = (
    organizationSecret: string,
    organizationId: string
) =>
    `${process.env.REACT_APP_FRONTEND_URI}/${organizationId}/invite/${organizationSecret}`;
