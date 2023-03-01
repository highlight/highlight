import { PlanType } from '@graph/schemas'

type FeatureWithTooltip = {
	text: string
	tooltip?: string
}

export type BillingPlan = {
	name: string
	monthlyPrice: number
	annualPrice: number
	type: PlanType
	advertisedFeatures: (FeatureWithTooltip | string)[]
	membersIncluded?: number
}

const SESSIONS_AFTER_LIMIT_TOOLTIP =
	'After this monthly limit is reached, extra sessions will be charged $5.00 per 1,000 sessions.'

const ERRORS_AFTER_LIMIT_TOOLTIP =
	'After this monthly limit is reached, extra errors will be charged $0.20 per 1,000 errors.'

const freePlan: BillingPlan = {
	name: 'Free',
	type: PlanType.Free,
	monthlyPrice: 0,
	annualPrice: 0,
	advertisedFeatures: [
		{
			text: '500 sessions / month',
			tooltip:
				'After this monthly limit is reached, sessions will be recorded but will not be visible until your plan is upgraded.',
		},
		{
			text: '1,000 errors / month',
			tooltip:
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
			tooltip: SESSIONS_AFTER_LIMIT_TOOLTIP,
		},
		{
			text: '4,000 free errors / mo',
			tooltip: ERRORS_AFTER_LIMIT_TOOLTIP,
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
			tooltip: SESSIONS_AFTER_LIMIT_TOOLTIP,
		},
		{
			text: '20,000 free errors / mo',
			tooltip: ERRORS_AFTER_LIMIT_TOOLTIP,
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
			tooltip: SESSIONS_AFTER_LIMIT_TOOLTIP,
		},
		{
			text: '160,000 free errors / mo',
			tooltip: ERRORS_AFTER_LIMIT_TOOLTIP,
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
