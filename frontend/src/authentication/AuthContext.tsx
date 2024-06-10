import { Admin } from '@graph/schemas'
import { createContext } from '@util/context/context'

import { auth } from '@/util/auth'

export enum AuthRole {
	AUTHENTICATED,
	UNAUTHENTICATED,
	LOADING,
}

export const [useAuthContext, AuthContextProvider] = createContext<{
	role: AuthRole
	admin?: Admin
	workspaceRole?: string
	isAuthLoading: boolean
	isLoggedIn: boolean
	isHighlightAdmin: boolean
	isProjectLevelMember: boolean
	signIn: (user: typeof auth.currentUser) => Promise<void>
	signOut: () => void
	fetchAdmin: () => Promise<void>
}>('AuthContext')
