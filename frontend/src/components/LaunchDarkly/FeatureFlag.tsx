import { useLDClient } from 'launchdarkly-react-client-sdk'
import { useEffect, useState } from 'react'

import { Flag } from './flags'

type BaseFlagProps = {
	flag: Flag
	children?: React.ReactNode
}

type BooleanFlagProps = BaseFlagProps & {
	enabled: React.ReactNode
	variants?: never
	defaultValue?: boolean
}

type MultivariateFlagProps = BaseFlagProps & {
	enabled?: never
	variants: Record<string | number, React.ReactNode>
	defaultValue: string | number
}

type FeatureFlagProps = BooleanFlagProps | MultivariateFlagProps

// Boolean Usage:
//
//   <FeatureFlag flag="boolean-flag" enabled={<Text>Enabled</Text>}>
//     <>Fallback/Default</>
//   </FeatureFlag>
//
// Multivariate Usage:
//
//   <FeatureFlag flag="string-flag" variants={{
//     "value1": <Text>Value 1</Text>,
//     "value2": <Text>Value 2</Text>,
//   }}>
//     <>Fallback/Default</>
//   </FeatureFlag>
export const FeatureFlag = ({
	flag,
	enabled,
	variants,
	defaultValue,
	children,
}: FeatureFlagProps) => {
	const client = useLDClient()
	const [flagValue, setFlagValue] = useState<
		string | number | boolean | undefined
	>(defaultValue)

	useEffect(() => {
		if (!client) return

		const value = client.variation(flag, defaultValue)
		setFlagValue(value)

		return client.on(`change:${flag}`, (newValue) => {
			setFlagValue(newValue)
		})
	}, [client, flag, defaultValue])

	// Boolean
	if (typeof flagValue === 'boolean') {
		return flagValue === true ? <>{enabled}</> : <>{children}</>
	}

	// Multivariate
	if (variants && typeof flagValue === 'string' && flagValue in variants) {
		return <>{variants[flagValue as keyof typeof variants]}</>
	}

	return <>{children}</>
}
