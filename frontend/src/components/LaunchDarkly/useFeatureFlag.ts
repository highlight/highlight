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
	const camelCaseFlag = flag.replace(/-([a-z])/g, (_, letter) =>
		letter.toUpperCase(),
	)
	const flags = useFlags()
	console.log('::: flags', flags, flags[camelCaseFlag])
	return flags[camelCaseFlag] ?? defaultValue
}
