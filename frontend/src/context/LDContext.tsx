import { LDProvider } from 'launchdarkly-react-client-sdk'
import { PropsWithChildren } from 'react'
const HighlightLDProvider = ({ children }: PropsWithChildren) => {
	return (
		<LDProvider clientSideID="66d9d3c255856f0fa8fd62d0">
			{children}
		</LDProvider>
	)
}
export default HighlightLDProvider
