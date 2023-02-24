import { makeVar, useReactiveVar } from '@apollo/client'

const setInviteCode = makeVar<string | undefined>(undefined)

export const useInviteCode = () => {
	const inviteCode = useReactiveVar(setInviteCode)

	return { inviteCode, setInviteCode }
}
