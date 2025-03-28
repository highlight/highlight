import {
	LDProvider,
	ProviderConfig,
	useLDClient,
	LDContext,
} from 'launchdarkly-react-client-sdk'
import React, { useEffect, useState, useCallback } from 'react'
import analytics from '@/util/analytics'
import { createContext } from '@/util/context/context'
import { merge } from 'lodash'

// Matches the clientID in the client SDK. Not exporting from the client SDK
// because we don't want to make this public.
const CLIENT_ID_STORAGE_KEY = 'highlightClientID'

type LaunchDarklyContextType = {
	updateContext: (updates: Record<string, string>) => void
}

export const [useLaunchDarklyContext, LaunchDarklyContextProvider] =
	createContext<LaunchDarklyContextType>('LaunchDarklyContext')

const createLDContext = (
	email: string | undefined,
	deviceId: string,
	context: Record<string, string>,
): LDContext => {
	const { workspaceId, ...restContext } = context
	const deviceContext = {
		kind: 'device',
		key: deviceId,
		userAgent: navigator.userAgent,
	}

	const userContext = {
		kind: 'user',
		key: email,
		email,
		...restContext,
	}

	const workspaceContext = workspaceId
		? {
				kind: 'workspace',
				key: workspaceId,
				workspaceId,
			}
		: undefined

	if (!email) {
		return {
			...deviceContext,
			anonymous: true,
		}
	}

	return {
		kind: 'multi',
		device: { ...deviceContext, anonymous: false },
		user: userContext,
		workspace: workspaceContext,
	}
}

type LaunchDarklyProviderProps = {
	context?: Omit<ProviderConfig['context'], 'email'>
	email?: string
	clientSideID: ProviderConfig['clientSideID']
}

const LaunchDarklyProviderContent: React.FC<
	React.PropsWithChildren<{
		context?: LaunchDarklyProviderProps['context']
	}>
> = ({ children, context = {} }) => {
	const client = useLDClient()

	useEffect(() => {
		if (client) {
			console.log('::: identify:', context)
			client.identify(context).then(() => {
				client.flush()
			})
			analytics.setLDClient(client)
		}
	}, [client, context])

	return <>{children}</>
}

export const LaunchDarklyProvider: React.FC<
	React.PropsWithChildren<LaunchDarklyProviderProps>
> = ({ children, context = {}, clientSideID, email }) => {
	const clientId = localStorage.getItem(CLIENT_ID_STORAGE_KEY)
	const deviceId =
		clientId ?? localStorage.getItem('device-id') ?? crypto.randomUUID()
	const [ldContext, setLdContext] = useState<LDContext>(
		createLDContext(email, deviceId, context),
	)

	const updateContext = useCallback(
		(updates: Record<string, string>) => {
			setLdContext((prev) => {
				const newContext = createLDContext(email, deviceId, updates)
				console.log('::: updates', updates)
				console.log('::: prev', prev)
				console.log('::: newContext', newContext)
				console.log('::: merge', merge(prev, newContext))
				return merge(prev, newContext)
			})
		},
		[email, deviceId],
	)

	useEffect(() => {
		if (context) {
			updateContext(context)
		}
	}, [context, updateContext])

	useEffect(() => {
		if (!clientId && !localStorage.getItem('device-id')) {
			localStorage.setItem('device-id', deviceId)
		}
	}, [deviceId, clientId])

	if (!clientSideID || import.meta.env.MODE === 'test') {
		return <>{children}</>
	}

	console.log('::: ldContext', ldContext)
	return (
		<LaunchDarklyContextProvider value={{ updateContext }}>
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
