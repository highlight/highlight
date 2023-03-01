import moment from 'moment'

import { PlanType } from '../../../graph/generated/schemas'

/**
 * Returns whether the change from the previousPlan to the newPlan was an upgrade.
 */
export const didUpgradePlan = (
	previousPlan: PlanType,
	newPlan: PlanType,
): boolean => {
	switch (newPlan) {
		case PlanType.Free:
			return false
		case PlanType.Lite:
			if (previousPlan === PlanType.Free) {
				return true
			}
			return false
		case PlanType.Basic:
			if (
				previousPlan === PlanType.Free ||
				previousPlan === PlanType.Lite
			) {
				return true
			}
			return false
		case PlanType.Startup:
			if (previousPlan === PlanType.Enterprise) {
				return false
			}
			return true
		case PlanType.Enterprise:
			return true
	}
}

export const getTrialEndDateMessage = (trialEndDate: any): string => {
	return `You have unlimited sessions until ${moment(trialEndDate).format(
		'MM/DD/YY',
	)}. After this trial, you will be on the free tier.`
}
