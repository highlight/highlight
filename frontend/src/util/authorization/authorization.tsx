import { useAuthContext } from '@/routers/AuthenticationRolerouter/context/AuthContext'
import { AdminRole } from '@graph/schemas'
import AUTHORIZATION_POLICIES from '@util/authorization/authorizationPolicies'
import React from 'react'

type PolicyName = keyof typeof AUTHORIZATION_POLICIES

interface AuthorizationInterface {
	/**
	 * @deprecated `checkPolicyAccess` should be used instead. Only use `checkRoleAccess` if `checkPolicyAccess` doesn't satisfy the requirements.
	 * Returns true if the current `Admin` has a given role.
	 * Use this if you need to check if the current `Admin` has a required role to do something.
	 */
	checkRoleAccess: ({
		allowedRoles,
	}: {
		allowedRoles: AdminRole[]
	}) => boolean
	/**
	 * Returns true if the current `Admin` has the `policyName`.
	 * Use this if you need to check if the current `Admin` has access to do something.
	 */
	checkPolicyAccess: ({ policyName }: { policyName: PolicyName }) => boolean
}
/**
 * Used to check if the current `Admin` is authorized.
 */
export const useAuthorization = (): AuthorizationInterface => {
	const { admin, workspaceRole } = useAuthContext()

	const checkRoleAccess = React.useCallback(
		({ allowedRoles }: { allowedRoles: AdminRole[] }) => {
			if (!workspaceRole) {
				return false
			}
			if (allowedRoles && allowedRoles.length > 0) {
				// @ts-expect-error
				return allowedRoles?.includes(workspaceRole)
			}

			return false
		},
		[workspaceRole],
	)

	const checkPolicyAccess = React.useCallback(
		({ policyName }: { policyName: PolicyName }) => {
			if (!admin || !workspaceRole) {
				return false
			}

			return AUTHORIZATION_POLICIES[policyName](admin, workspaceRole)
		},
		[admin, workspaceRole],
	)

	return { checkRoleAccess, checkPolicyAccess }
}

type AuthorizationProps = {
	/**
	 * The component rendered if the `Admin` does not have access to `children`.
	 * Use this for rendering an alternative UI.
	 */
	forbiddenFallback?: React.ReactNode
	/**
	 * The component rendered if the `Admin` has access.
	 */
	children: React.ReactNode
} & (
	| {
			allowedRoles: AdminRole[]
			policyCheck?: never
	  }
	| {
			allowedRoles?: never
			policyCheck: boolean
	  }
)

export const Authorization = ({
	policyCheck,
	allowedRoles,
	forbiddenFallback = null,
	children,
}: AuthorizationProps) => {
	const { checkRoleAccess } = useAuthorization()

	let canAccess = false

	if (allowedRoles) {
		canAccess = checkRoleAccess({ allowedRoles })
	}

	if (typeof policyCheck !== 'undefined') {
		canAccess = policyCheck
	}

	return <>{canAccess ? children : forbiddenFallback}</>
}
