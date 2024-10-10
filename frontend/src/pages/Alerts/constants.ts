import { ThresholdCondition, ThresholdType } from '@/graph/generated/schemas'

export const THRESHOLD_CONDITION_OPTIONS = [
	ThresholdCondition.Outside,
	ThresholdCondition.Above,
	ThresholdCondition.Below,
]

export const getThresholdConditionOptions = (thresholdType: ThresholdType) => {
	if (thresholdType === ThresholdType.Constant) {
		return THRESHOLD_CONDITION_OPTIONS.filter(
			(o) => o !== ThresholdCondition.Outside,
		)
	}

	return THRESHOLD_CONDITION_OPTIONS
}

export const THRESHOLD_TYPE_OPTIONS = [
	ThresholdType.Constant,
	ThresholdType.Anomaly,
]
