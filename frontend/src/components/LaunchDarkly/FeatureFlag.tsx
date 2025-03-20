import { useFlags } from 'launchdarkly-react-client-sdk'

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
	const flags = useFlags() ?? {}
	const flagValue = flags[flag] ?? defaultValue
	console.log('::: flagValue', flag, flagValue)

	// Boolean
	if (typeof flagValue === 'boolean') {
		return flagValue === true ? <>{enabled}</> : <>{children}</>
	}

	// Multivariate
	if (variants && typeof flagValue === 'string' && flagValue in variants) {
		return <>{variants[flagValue as keyof typeof variants]}</>
	}

	// Fallback
	return <>{children}</>
}
