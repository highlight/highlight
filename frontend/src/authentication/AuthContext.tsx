import { Admin } from '@graph/schemas'
import { createContext } from '@util/context/context'

export enum AuthRole {
	AUTHENTICATED,
	UNAUTHENTICATED,
	LOADING,
}

export const isAuthLoading = (role: AuthRole) => {
	return role == AuthRole.LOADING
}

export const isLoggedIn = (role: AuthRole) => {
	return role === AuthRole.AUTHENTICATED
}

export const [useAuthContext, AuthContextProvider] = createContext<{
	role: AuthRole
	admin?: Admin
	workspaceRole?: string
	isAuthLoading: boolean
	isLoggedIn: boolean
	isHighlightAdmin: boolean
	signIn: () => Promise<void>
	signOut: () => void
	fetchAdmin: () => void
}>('AuthContext')
