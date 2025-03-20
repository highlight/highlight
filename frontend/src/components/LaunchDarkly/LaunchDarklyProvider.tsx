import { LDProvider, ProviderConfig } from 'launchdarkly-react-client-sdk'
import React from 'react'

export const LaunchDarklyProvider: React.FC<
	React.PropsWithChildren<{
		clientSideID: ProviderConfig['clientSideID']
		context: ProviderConfig['context']
	}>
> = ({ children, context, clientSideID }) => {
	return (
		<LDProvider
			clientSideID={clientSideID}
			context={context}
			options={{
				streaming: true,
				wrapperName: 'LaunchDarklyProvider',
			}}
		>
			{children}
		</LDProvider>
	)
}
