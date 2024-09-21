import { LDProvider } from 'launchdarkly-react-client-sdk'
import { PropsWithChildren } from 'react'
import { StatsigProvider } from '@statsig/react-bindings'
import { StatsigClient } from '@statsig/js-client'
import { runStatsigSessionReplay } from '@statsig/session-replay'
import { runStatsigAutoCapture } from '@statsig/web-analytics'

const myStatsigClient = new StatsigClient(
	'client-HcLkKJaExcSRUztN2Sg6S56ktg4r37ZQZO93AdMrKH2',
	{},
)

runStatsigSessionReplay(myStatsigClient)
runStatsigAutoCapture(myStatsigClient)
myStatsigClient.initializeSync()

const FeatureFlagProvider = ({ children }: PropsWithChildren) => {
	return (
		<LDProvider clientSideID="66d9d3c255856f0fa8fd62d0">
			<StatsigProvider client={myStatsigClient}>
				{children}
			</StatsigProvider>
		</LDProvider>
	)
}
export default FeatureFlagProvider
