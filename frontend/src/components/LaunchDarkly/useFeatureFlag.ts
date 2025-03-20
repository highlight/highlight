import { useFlags } from 'launchdarkly-react-client-sdk'
import { flags } from './flags'

export function useFeatureFlag(
	flag: keyof typeof flags,
	defaultValue: boolean,
): boolean
export function useFeatureFlag(
	flag: keyof typeof flags,
	defaultValue: string,
): string

export function useFeatureFlag(
	flag: keyof typeof flags,
	defaultValue: boolean | string,
) {
	const flags = useFlags()
	return flags[flag] ?? defaultValue
}
