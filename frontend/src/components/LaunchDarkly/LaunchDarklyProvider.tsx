import {
	LDMultiKindContext,
	LDProvider,
	LDSingleKindContext,
	ProviderConfig,
	useLDClient,
} from 'launchdarkly-react-client-sdk'
import React, { useEffect, useMemo, useState } from 'react'
import analytics from '@/util/analytics'
import { createContext } from '@/util/context/context'

// Matches the clientID in the client SDK. Not exporting from the client SDK
// because we don't want to make this public.
const CLIENT_ID_STORAGE_KEY = 'highlightClientID'

type DeviceContext = {
	kind: 'device'
	key: string
	userAgent: string
}

type UserContext = {
	kind: 'user'
	key: string
	email: string
	[key: string]: string | boolean | number | undefined
}

type WorkspaceContext = {
	kind: 'workspace'
	key: string
	workspaceId: string
	[key: string]: string | boolean | number | undefined
}

type LaunchDarklyContextType = {
	setUserContext: (userContext: Omit<UserContext, 'kind' | 'key'>) => void
	setWorkspaceContext: (
		workspaceContext: Omit<WorkspaceContext, 'kind' | 'key'>,
	) => void
}

type LDContext = LDSingleKindContext | LDMultiKindContext

const createDeviceContext = (deviceId: string): DeviceContext => ({
	kind: 'device' as const,
	key: deviceId,
	userAgent: navigator.userAgent,
})

const createUserContext = ({
	email,
	...userContext
}: Omit<UserContext, 'kind'>): UserContext => ({
	kind: 'user' as const,
	key: email as string,
	email: email as string,
	...Object.fromEntries(
		Object.entries(userContext).filter(([_, v]) => v !== undefined),
	),
})

const createWorkspaceContext = ({
	workspaceId,
	...workspaceContext
}: Omit<LDSingleKindContext, 'kind'>): WorkspaceContext => ({
	kind: 'workspace',
	key: workspaceId,
	workspaceId,
	...workspaceContext,
})

const createLDContext = (
	deviceContext: DeviceContext,
	userContext?: UserContext,
	workspaceContext?: WorkspaceContext,
): LDSingleKindContext | LDMultiKindContext => {
	console.log(
		'::: createLDContext',
		deviceContext,
		userContext,
		workspaceContext,
	)
	if (!userContext && !workspaceContext) {
		return { ...deviceContext, anonymous: true }
	}

	return {
		kind: 'multi',
		device: { ...deviceContext, anonymous: false },
		user: userContext,
		workspace: workspaceContext,
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
	const [deviceContext] = useState<DeviceContext>(
		createDeviceContext(deviceId),
	)
	const [userContext, setUserContext] = useState<UserContext | undefined>(
		undefined,
	)
	const [workspaceContext, setWorkspaceContext] = useState<
		WorkspaceContext | undefined
	>(undefined)

	const ldContext = useMemo(() => {
		const newContext = createLDContext(
			deviceContext,
			userContext,
			workspaceContext,
		)
		console.log(
			'::: newContext',
			deviceContext,
			userContext,
			workspaceContext,
			newContext,
		)
		return newContext
	}, [deviceContext, userContext, workspaceContext])

	useEffect(() => {
		if (email) {
			setUserContext(createUserContext({ email }))
		}
	}, [email, setUserContext])

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

	const handleSetWorkspaceContext = (
		workspaceContext: Omit<WorkspaceContext, 'kind' | 'key'>,
	) => {
		setWorkspaceContext((w) =>
			createWorkspaceContext({ ...w, ...workspaceContext }),
		)
	}

	const handleSetUserContext = (
		userContext: Omit<UserContext, 'kind' | 'key'>,
	) => {
		setUserContext((u) => createUserContext({ ...u, ...userContext }))
	}

	return (
		<LaunchDarklyContextProvider
			value={{
				setWorkspaceContext: handleSetWorkspaceContext,
				setUserContext: handleSetUserContext,
			}}
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
