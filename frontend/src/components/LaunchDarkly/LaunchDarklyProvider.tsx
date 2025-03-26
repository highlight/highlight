import {
	LDProvider,
	ProviderConfig,
	useLDClient,
} from 'launchdarkly-react-client-sdk'
import React, { useEffect } from 'react'
import analytics from '@/util/analytics'
import { LOCAL_STORAGE_KEYS } from '@highlight-run/client/src'

const createContext = (
	email: string | undefined,
	deviceId: string,
	context: Record<string, unknown> = {},
) => {
	const deviceContext = {
		kind: 'device' as const,
		key: deviceId,
		custom: {
			userAgent: navigator.userAgent,
		},
	}

	const userContext = {
		kind: 'user' as const,
		key: email || 'anonymous',
		email,
		...context,
	}

	if (!email) {
		return {
			...deviceContext,
			anonymous: true,
		}
	}

	return {
		kind: 'multi',
		user: userContext,
		device: { ...deviceContext, anonymous: false },
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
		deviceId: string
		email?: LaunchDarklyProviderProps['email']
	}>
> = ({ children, context = {}, email, deviceId }) => {
	const client = useLDClient()

	useEffect(() => {
		if (client) {
			client.identify(createContext(email, deviceId, context))
			analytics.setLDClient(client)
		}
	}, [client, deviceId, email, context])

	return <>{children}</>
}

export const LaunchDarklyProvider: React.FC<
	React.PropsWithChildren<LaunchDarklyProviderProps>
> = ({ children, context = {}, clientSideID, email }) => {
	const clientId = localStorage.getItem(LOCAL_STORAGE_KEYS.CLIENT_ID)
	const deviceId =
		clientId ?? localStorage.getItem('device-id') ?? crypto.randomUUID()

	useEffect(() => {
		if (!clientId && !localStorage.getItem('device-id')) {
			localStorage.setItem('device-id', deviceId)
		}
	}, [deviceId, clientId])

	if (import.meta.env.MODE === 'test') {
		return <>{children}</>
	}

	return (
		<LDProvider
			clientSideID={clientSideID}
			context={createContext(email, deviceId, context)}
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
			<LaunchDarklyProviderContent
				context={context}
				deviceId={deviceId}
				email={email}
			>
				{children}
			</LaunchDarklyProviderContent>
		</LDProvider>
	)
}
