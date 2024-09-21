import { useFlags } from 'launchdarkly-react-client-sdk'

export enum Feature {
	EventSearch,
}

const useFeatureFlag = (feature: Feature) => {
	const { userEvents } = useFlags()
	const flags: { [key: number]: boolean } = {
		[Feature.EventSearch]: userEvents,
	} as const

	return flags[feature as Feature]
}

export default useFeatureFlag
