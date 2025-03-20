import { useLDClient } from 'launchdarkly-react-client-sdk'
import { flags } from './flags'
import { useEffect, useState } from 'react'

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
	const client = useLDClient()
	const [flagValue, setFlagValue] = useState<boolean | string>(defaultValue)

	useEffect(() => {
		if (!client) return

		setFlagValue(client.variation(flag, defaultValue))

		return client.on('change', (flag, value) => {
			setFlagValue(value)
		})
	}, [client, flag, defaultValue])

	return flagValue
}
