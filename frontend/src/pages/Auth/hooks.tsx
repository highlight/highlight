import useLocalStorage from '@rehooks/local-storage'
import { useEffect } from 'react'
import { useMatch } from 'react-router-dom'

export const useWorkspaceInvite = () => {
	const workspaceInviteMatch = useMatch('/w/:workspace_id/invite/:invite')
	const params = workspaceInviteMatch?.params
	const [inviteSecret, setInviteSecret] = useLocalStorage(
		'highlightInviteSecret',
		'',
	)

	useEffect(() => {
		if (params?.invite && !inviteSecret) {
			setInviteSecret(params.invite)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const clearInvite = () => setInviteSecret('')

	return {
		inviteSecret,
		invitePath: `/invite/${inviteSecret}`,
		clearInvite,
	}
}
