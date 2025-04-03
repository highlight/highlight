import { flags } from './flags'
import { useLaunchDarklyContext } from '@components/LaunchDarkly/LaunchDarklyProvider'

export function useFeatureFlag(flag: keyof typeof flags) {
	const { client } = useLaunchDarklyContext()
	const flagConfig = flags[flag] ?? {}
	return client.variation(flag, flagConfig.defaultValue)
}
