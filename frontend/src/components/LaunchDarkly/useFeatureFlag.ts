import { useFlags } from 'launchdarkly-react-client-sdk'
import { flags } from './flags'

export function useFeatureFlag(flag: keyof typeof flags) {
	const flagConfig = flags[flag]
	const ldFlags = useFlags() ?? {}

	return ldFlags[flag] ?? flagConfig.defaultValue
}
