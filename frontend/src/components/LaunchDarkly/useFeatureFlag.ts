import { useFlags } from 'launchdarkly-react-client-sdk'

import { Flag } from './flags'

export const useFeatureFlag = (flag: Flag): string | boolean | undefined => {
	const { flags, error, isLoading } = useFlags()

	if (error) {
		console.error(`Failed to load feature flag ${flag}:`, error)
	}

	if (isLoading) {
		console.log(`Loading feature flag ${flag}`)
	}

	return flags[flag]
}
