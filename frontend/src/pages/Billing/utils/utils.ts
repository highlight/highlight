import moment from 'moment'

import { GetBillingDetailsForProjectQuery } from '@/graph/generated/operations'

import { PlanType, ProductType } from '../../../graph/generated/schemas'

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

export const getQuotaPercents = (
	data: GetBillingDetailsForProjectQuery,
): [ProductType, number][] => {
	const sessionsMeter = data.billingDetailsForProject?.meter ?? 0
	const sessionsQuota = data.billingDetailsForProject?.plan.quota ?? 1
	const errorsMeter = data.billingDetailsForProject?.errorsMeter ?? 0
	const errorsQuota = data.billingDetailsForProject?.plan.errorsLimit ?? 1
	const logsMeter = data.billingDetailsForProject?.logsMeter ?? 0
	const logsQuota = data.billingDetailsForProject?.plan.logsLimit ?? 1
	return [
		[ProductType.Sessions, sessionsMeter / sessionsQuota],
		[ProductType.Errors, errorsMeter / errorsQuota],
		[ProductType.Logs, logsMeter / logsQuota],
	]
}
