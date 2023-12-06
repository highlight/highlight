import moment from 'moment'

import { GetBillingDetailsForProjectQuery } from '@/graph/generated/operations'

import {
	Maybe,
	PlanType,
	ProductType,
	RetentionPeriod,
} from '../../../graph/generated/schemas'

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
	return false
}

export const getTrialEndDateMessage = (trialEndDate: any): string => {
	return `You have unlimited sessions until ${moment(trialEndDate).format(
		'MM/DD/YY',
	)}. After this trial, you will be on the free tier.`
}

export const tryCastDate = (date: Maybe<string> | undefined) => {
	if (date) {
		return new Date(date)
	} else {
		return undefined
	}
}

export const RETENTION_PERIOD_LABELS: { [K in RetentionPeriod]: string } = {
	[RetentionPeriod.ThirtyDays]: '30 days',
	[RetentionPeriod.ThreeMonths]: '3 months',
	[RetentionPeriod.SixMonths]: '6 months',
	[RetentionPeriod.TwelveMonths]: '12 months',
	[RetentionPeriod.TwoYears]: '2 years',
	[RetentionPeriod.ThreeYears]: '3 years',
}

export const getMeterAmounts = (
	data: GetBillingDetailsForProjectQuery,
): { [K in ProductType]: [number, number | undefined] } => {
	const sessionsMeter = data.billingDetailsForProject?.meter ?? 0
	const sessionsQuota =
		data.billingDetailsForProject?.sessionsBillingLimit ?? undefined
	const errorsMeter = data.billingDetailsForProject?.errorsMeter ?? 0
	const errorsQuota =
		data.billingDetailsForProject?.errorsBillingLimit ?? undefined
	const logsMeter = data.billingDetailsForProject?.logsMeter ?? 0
	const logsQuota =
		data.billingDetailsForProject?.logsBillingLimit ?? undefined
	const tracesMeter = data.billingDetailsForProject?.tracesMeter ?? 0
	const tracesQuota =
		data.billingDetailsForProject?.tracesBillingLimit ?? undefined
	return {
		[ProductType.Sessions]: [sessionsMeter, sessionsQuota],
		[ProductType.Errors]: [errorsMeter, errorsQuota],
		[ProductType.Logs]: [logsMeter, logsQuota],
		[ProductType.Traces]: [tracesMeter, tracesQuota],
	}
}

export const getQuotaPercents = (
	data: GetBillingDetailsForProjectQuery,
): [ProductType, number][] => {
	const amts = getMeterAmounts(data)
	const sessionAmts = amts[ProductType.Sessions]
	const errorAmts = amts[ProductType.Errors]
	const logAmts = amts[ProductType.Logs]
	return [
		[
			ProductType.Sessions,
			sessionAmts[1] === undefined ? 0 : sessionAmts[0] / sessionAmts[1],
		],
		[
			ProductType.Errors,
			errorAmts[1] === undefined ? 0 : errorAmts[0] / errorAmts[1],
		],
		[
			ProductType.Logs,
			logAmts[1] === undefined ? 0 : logAmts[0] / logAmts[1],
		],
	]
}
