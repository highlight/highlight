import { USD } from '@dinero.js/currencies'
import { PlanType, RetentionPeriod } from '@graph/schemas'
import { dinero, toDecimal } from 'dinero.js'

type FeatureWithTooltip = {
	text: string
	tooltip?: (rp: RetentionPeriod) => string
}

export type BillingPlan = {
	name: string
	monthlyPrice: number
	annualPrice: number
	type: PlanType
	advertisedFeatures: (FeatureWithTooltip | string)[]
	membersIncluded?: number
}

const sessionsPrices = {
	[RetentionPeriod.ThreeMonths]: 500,
	[RetentionPeriod.SixMonths]: 750,
	[RetentionPeriod.TwelveMonths]: 1000,
	[RetentionPeriod.TwoYears]: 1250,
}

const getSessionsAfterLimitTooltip = (rp: RetentionPeriod) => {
	const amt = dinero({ amount: sessionsPrices[rp], currency: USD })
	const formatted = toDecimal(amt)
	return `After this monthly limit is reached, extra sessions will be charged $${formatted} per 1,000 sessions.`
}

const errorsPrices = {
	[RetentionPeriod.ThreeMonths]: 20,
	[RetentionPeriod.SixMonths]: 30,
	[RetentionPeriod.TwelveMonths]: 40,
	[RetentionPeriod.TwoYears]: 50,
}
const getErrorsAfterLimitTooltip = (rp: RetentionPeriod) => {
	const amt = dinero({ amount: errorsPrices[rp], currency: USD })
	const formatted = toDecimal(amt)
	return `After this monthly limit is reached, extra errors will be charged $${formatted} per 1,000 errors.`
}

const freePlan: BillingPlan = {
	name: 'Free',
	type: PlanType.Free,
	monthlyPrice: 0,
	annualPrice: 0,
	advertisedFeatures: [
		{
			text: '500 sessions / month',
			tooltip: () =>
				'After this monthly limit is reached, sessions will be recorded but will not be visible until your plan is upgraded.',
		},
		{
			text: '1,000 errors / month',
			tooltip: () =>
				'After this monthly limit is reached, errors will be recorded but will not be visible until your plan is upgraded.',
		},
		'3 month retention',
		'Unlimited dev tools access',
	],
}

const litePlan: BillingPlan = {
	name: 'Basic',
	type: PlanType.Lite,
	monthlyPrice: 50,
	annualPrice: 40,
	advertisedFeatures: [
		{
			text: '2,000 free sessions / mo',
			tooltip: getSessionsAfterLimitTooltip,
		},
		{
			text: '4,000 free errors / mo',
			tooltip: getErrorsAfterLimitTooltip,
		},
		'Unlimited members included',
		'Unlimited dev tools access',
	],
}

const basicPlan: BillingPlan = {
	name: 'Essentials',
	type: PlanType.Basic,
	monthlyPrice: 150,
	annualPrice: 120,
	advertisedFeatures: [
		{
			text: '10,000 free sessions / mo',
			tooltip: getSessionsAfterLimitTooltip,
		},
		{
			text: '20,000 free errors / mo',
			tooltip: getErrorsAfterLimitTooltip,
		},
		'Everything in Basic',
	],
}

const startupPlan: BillingPlan = {
	name: 'Startup',
	type: PlanType.Startup,
	monthlyPrice: 400,
	annualPrice: 320,
	advertisedFeatures: [
		{
			text: '80,000 free sessions / mo',
			tooltip: getSessionsAfterLimitTooltip,
		},
		{
			text: '160,000 free errors / mo',
			tooltip: getErrorsAfterLimitTooltip,
		},
		'Everything in Essentials',
		'Enhanced user metadata',
		'App performance metrics',
		'Issue tracking integrations',
	],
}

export const BILLING_PLANS = [
	freePlan,
	litePlan,
	basicPlan,
	startupPlan,
] as const
