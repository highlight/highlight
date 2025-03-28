import {
	LDMultiKindContext,
	LDProvider,
	LDSingleKindContext,
	ProviderConfig,
	useLDClient,
} from 'launchdarkly-react-client-sdk'
import React, { useEffect, useState, useCallback } from 'react'
import analytics from '@/util/analytics'
import { createContext } from '@/util/context/context'

// Matches the clientID in the client SDK. Not exporting from the client SDK
// because we don't want to make this public.
const CLIENT_ID_STORAGE_KEY = 'highlightClientID'

type LaunchDarklyContextType = {
	setWorkspaceContext: (workspaceId: string) => void
	setUserContext: (
		email: string,
		additionalContext?: Record<string, string>,
	) => void
}

type LDContext = LDSingleKindContext | LDMultiKindContext

type ContextUpdates = {
	workspaceId?: string
	email?: string
	[key: string]: string | undefined
}

const createDeviceContext = (deviceId: string) => ({
	kind: 'device' as const,
	key: deviceId,
	userAgent: navigator.userAgent,
})

const createUserContext = (
	email: string,
	additionalContext: Record<string, string | undefined> = {},
) => ({
	kind: 'user' as const,
	key: email,
	email,
	...Object.fromEntries(
		Object.entries(additionalContext).filter(([_, v]) => v !== undefined),
	),
})

const createWorkspaceContext = (workspaceId?: string) =>
	workspaceId
		? {
				kind: 'workspace' as const,
				key: workspaceId,
				workspaceId,
			}
		: undefined

const createLDContext = (
	email: string | undefined,
	deviceId: string,
	updates: ContextUpdates,
): LDContext => {
	const { workspaceId, ...restContext } = updates
	const deviceContext = createDeviceContext(deviceId)

	if (!email) {
		return {
			...deviceContext,
			anonymous: true,
		}
	}

	return {
		kind: 'multi',
		device: { ...deviceContext, anonymous: false },
		user: createUserContext(email, restContext),
		workspace: createWorkspaceContext(workspaceId),
	}
}

export const [useLaunchDarklyContext, LaunchDarklyContextProvider] =
	createContext<LaunchDarklyContextType>('LaunchDarklyContext')

type LaunchDarklyProviderProps = {
	clientSideID: ProviderConfig['clientSideID']
	context?: {
		workspaceId?: string
		[key: string]: string | undefined
	}
	email?: string
}

const LaunchDarklyProviderContent: React.FC<
	React.PropsWithChildren<{
		context?: LDContext
	}>
> = ({ children, context = {} }) => {
	const client = useLDClient()

	console.log('::: LaunchDarklyProviderContent', context)
	useEffect(() => {
		if (client) {
			console.log('::: identify:', context)
			client.identify(context).then(() => {
				client.flush()
			})
			analytics.setLDClient(client)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [client, JSON.stringify(context)])

	return <>{children}</>
}

export const LaunchDarklyProvider: React.FC<
	React.PropsWithChildren<LaunchDarklyProviderProps>
> = ({ children, clientSideID, email }) => {
	const clientId = localStorage.getItem(CLIENT_ID_STORAGE_KEY)
	const deviceId =
		clientId ?? localStorage.getItem('device-id') ?? crypto.randomUUID()
	const [ldContext, setLdContext] = useState<LDContext>(
		createLDContext(email, deviceId, {}),
	)

	const setWorkspaceContext = useCallback(
		(workspaceId: string) => {
			console.log('::: setWorkspaceContext', workspaceId)
			setLdContext((prev) => {
				const newContext = createLDContext(email, deviceId, {
					workspaceId,
				})
				console.log('::: newContext', newContext)
				return {
					...prev,
					workspace: newContext.workspace,
				}
			})
		},
		[email, deviceId],
	)

	const setUserContext = useCallback(
		(email: string, additionalContext: Record<string, string> = {}) => {
			console.log('::: setUserContext', email, additionalContext)
			setLdContext((prev) => {
				const newContext = createLDContext(
					email,
					deviceId,
					additionalContext,
				)
				console.log('::: newContext', newContext)
				if (prev.anonymous) {
					return newContext
				}
				return {
					...prev,
					user: newContext.user,
				}
			})
		},
		[deviceId],
	)

	useEffect(() => {
		console.log('::: setLocalStorageId', clientId)
		if (!clientId && !localStorage.getItem('device-id')) {
			localStorage.setItem('device-id', deviceId)
		}
	}, [deviceId, clientId])

	if (!clientSideID || import.meta.env.MODE === 'test') {
		return <>{children}</>
	}

	console.log('::: ldContext', ldContext)
	return (
		<LaunchDarklyContextProvider
			value={{ setWorkspaceContext, setUserContext }}
		>
			<LDProvider
				clientSideID={clientSideID}
				context={ldContext}
				options={{
					streaming: true,
					wrapperName: 'LaunchDarklyProvider',
					bootstrap: 'localStorage',
					sendEvents: true,
					flushInterval: 2000,
				}}
				reactOptions={{
					useCamelCaseFlagKeys: false,
				}}
			>
				<LaunchDarklyProviderContent context={ldContext}>
					{children}
				</LaunchDarklyProviderContent>
			</LDProvider>
		</LaunchDarklyContextProvider>
	)
}
