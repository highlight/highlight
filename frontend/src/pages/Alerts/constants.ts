import { ThresholdCondition, ThresholdType } from '@/graph/generated/schemas'

export const THRESHOLD_CONDITION_OPTIONS = [
	{
		name: ThresholdCondition.Above,
		value: ThresholdCondition.Above,
	},
	{
		name: ThresholdCondition.Below,
		value: ThresholdCondition.Below,
	},
	{
		name: ThresholdCondition.Outside,
		value: ThresholdCondition.Outside,
	},
]

export const getThresholdConditionOptions = (thresholdType: ThresholdType) => {
	if (thresholdType === ThresholdType.Constant) {
		return THRESHOLD_CONDITION_OPTIONS.filter(
			(o) => o.value !== ThresholdCondition.Outside,
		)
	}

	return THRESHOLD_CONDITION_OPTIONS
}

export const THRESHOLD_TYPE_OPTIONS = [
	{
		name: ThresholdType.Constant,
		value: ThresholdType.Constant,
	},
	{
		name: ThresholdType.Anomaly,
		value: ThresholdType.Anomaly,
	},
]
