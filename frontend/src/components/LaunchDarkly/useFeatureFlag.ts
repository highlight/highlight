import { useFlags, useLDClient } from 'launchdarkly-react-client-sdk'
import { flags } from './flags'

export function useFeatureFlag(flag: keyof typeof flags) {
	const flagConfig = flags[flag] ?? {}
	const ldFlags = useFlags() ?? {}
	const client = useLDClient()

	// console.log('::: flag being checked:', flag)
	// console.log('::: client ready:', client?.waitForInitialization())
	console.log('::: current context:', client?.getContext())
	console.log('::: flag value:', flag, ldFlags[flag])

	return ldFlags[flag] ?? flagConfig.defaultValue
}
