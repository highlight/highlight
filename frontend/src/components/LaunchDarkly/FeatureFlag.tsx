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

type MultivariateFlagProps<T> = BaseFlagProps & {
	enabled?: never
	variants: Record<string | number, React.ReactNode>
	defaultValue: T
}

type FeatureFlagProps<T> = BooleanFlagProps | MultivariateFlagProps<T>

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
export const FeatureFlag = <T extends string | number>({
	flag,
	enabled,
	variants,
	defaultValue,
	children,
}: FeatureFlagProps<T>) => {
	const { flags, error, isLoading } = useFlags()

	console.log('::: FeatureFlag', error, isLoading, flags)

	if (error) {
		console.error('::: FeatureFlag', error)
		return <>{children}</>
	}

	// Add early returns for loading/error states
	if (isLoading || !flags) {
		return <>{children}</>
	}

	const flagValue = flags[flag] ?? defaultValue

	console.log('::: FeatureFlag', flag, flagValue, flags)

	// Boolean
	if (enabled !== undefined) {
		return flagValue === true ? <>{enabled}</> : <>{children}</>
	}

	// Multivariate
	if (variants && flagValue in variants) {
		return <>{variants[flagValue as keyof typeof variants]}</>
	}

	return <>{children}</>
}
