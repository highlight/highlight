import { useFlags } from 'launchdarkly-react-client-sdk'

export enum Feature {
	EventSearch,
	PlayerNoChunkRemoval,
	SessionResultsVerbose,
}

const useFeatureFlag = (feature: Feature) => {
	const { userEvents, playerNoChunkRemoval, sessionResultsVerbose } = useFlags()
	const flags: { [key: number]: boolean } = {
		[Feature.EventSearch]: userEvents,
		[Feature.PlayerNoChunkRemoval]: playerNoChunkRemoval,
		[Feature.SessionResultsVerbose]: sessionResultsVerbose,
	} as const

	return flags[feature as Feature]
}

export default useFeatureFlag
