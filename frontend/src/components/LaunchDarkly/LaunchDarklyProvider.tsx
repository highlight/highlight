import {
	LDProvider,
	ProviderConfig,
	useLDClient,
} from 'launchdarkly-react-client-sdk'
import React, { useEffect } from 'react'

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

export const LaunchDarklyProvider: React.FC<
	React.PropsWithChildren<{
		clientSideID: ProviderConfig['clientSideID']
		context?: Omit<ProviderConfig['context'], 'email'>
		email?: string
	}>
> = ({ children, context = {}, clientSideID, email }) => {
	const client = useLDClient()
	const deviceId = localStorage.getItem('device-id') ?? crypto.randomUUID()

	useEffect(() => {
		if (!localStorage.getItem('device-id')) {
			localStorage.setItem('device-id', deviceId)
		}
	}, [deviceId])

	useEffect(() => {
		if (client) {
			client.identify(createContext(email, deviceId, context))
		}
	}, [client, deviceId, email, context])

	return (
		<LDProvider
			clientSideID={clientSideID}
			context={createContext(email, deviceId, context)}
			options={{
				streaming: true,
				wrapperName: 'LaunchDarklyProvider',
				bootstrap: 'localStorage',
			}}
		>
			{children}
		</LDProvider>
	)
}
