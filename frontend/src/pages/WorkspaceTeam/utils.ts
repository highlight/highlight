import { AdminRole } from '@graph/schemas'

import { GetBaseURL } from '../../util/window'

export const getWorkspaceInvitationLink = (
	workspaceSecret: string,
	workspaceId: string,
) => `${GetBaseURL()}/w/${workspaceId}/invite/${workspaceSecret}`

export const roleToDisplayValueMapping = {
	[AdminRole.Admin]: 'Admin',
	[AdminRole.Member]: 'Member',
}
