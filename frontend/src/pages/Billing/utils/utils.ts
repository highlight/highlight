import moment from 'moment'

import { GetBillingDetailsForProjectQuery } from '@/graph/generated/operations'

import {
	BillingDetails,
	Maybe,
	Plan,
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
	[RetentionPeriod.ThirtyDays]: '30 day retention',
	[RetentionPeriod.ThreeMonths]: '3 month retention',
	[RetentionPeriod.SixMonths]: '6 month retention',
	[RetentionPeriod.TwelveMonths]: '12 month retention',
	[RetentionPeriod.TwoYears]: '2 year retention',
	[RetentionPeriod.ThreeYears]: '3 year retention',
}

export const getMeterAmounts = (
	details:
		| Maybe<
				{ __typename?: 'BillingDetails' } & Pick<
					BillingDetails,
					| 'meter'
					| 'membersMeter'
					| 'errorsMeter'
					| 'logsMeter'
					| 'tracesMeter'
					| 'sessionsBillingLimit'
					| 'errorsBillingLimit'
					| 'logsBillingLimit'
					| 'tracesBillingLimit'
				> & {
						plan: { __typename?: 'Plan' } & Pick<
							Plan,
							| 'type'
							| 'interval'
							| 'membersLimit'
							| 'sessionsLimit'
							| 'errorsLimit'
							| 'logsLimit'
							| 'tracesLimit'
							| 'sessionsRate'
							| 'errorsRate'
							| 'logsRate'
							| 'tracesRate'
						>
					}
		  >
		| undefined
		| null,
): { [K in ProductType]: [number, number | undefined] } => {
	if (!details) {
		return {
			[ProductType.Sessions]: [0, undefined],
			[ProductType.Errors]: [0, undefined],
			[ProductType.Logs]: [0, undefined],
			[ProductType.Traces]: [0, undefined],
		}
	}
	const canChargeOverage = details.plan.type !== 'Free'
	const sessionsMeter = details?.meter ?? 0
	const sessionsQuota = details?.sessionsBillingLimit
		? details.sessionsBillingLimit
		: canChargeOverage
		? undefined
		: details?.plan.sessionsLimit
	const errorsMeter = details?.errorsMeter ?? 0
	const errorsQuota = details?.errorsBillingLimit
		? details.errorsBillingLimit
		: canChargeOverage
		? undefined
		: details?.plan.errorsLimit
	const logsMeter = details?.logsMeter ?? 0
	const logsQuota = details?.logsBillingLimit
		? details.logsBillingLimit
		: canChargeOverage
		? undefined
		: details?.plan.logsLimit
	const tracesMeter = details?.tracesMeter ?? 0
	const tracesQuota = details?.tracesBillingLimit
		? details.tracesBillingLimit
		: canChargeOverage
		? undefined
		: details?.plan.tracesLimit
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
	const amts = getMeterAmounts(data.billingDetailsForProject)
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
