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
	'After this monthly limit is reached, extra sessions will be charged $5 per 1000 sessions.'

const freePlan: BillingPlan = {
	name: 'Basic',
	type: PlanType.Free,
	monthlyPrice: 0,
	annualPrice: 0,
	advertisedFeatures: [
		{
			text: '500 sessions / month',
			tooltip:
				'After this monthly limit is reached, sessions will be recorded but will not be visible until your plan is upgraded.',
		},
		'Unlimited dev tools access',
	],
}

const litePlan: BillingPlan = {
	name: 'Lite',
	type: PlanType.Lite,
	monthlyPrice: 50,
	annualPrice: 40,
	advertisedFeatures: [
		{
			text: '2,000 free sessions / mo',
			tooltip: SESSIONS_AFTER_LIMIT_TOOLTIP,
		},
		'Unlimited members included',
		'Unlimited dev tools access',
		'Unlimited retention',
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
		'Unlimited members included',
		'Unlimited dev tools access',
		'Unlimited retention',
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
		'Everything in Basic',
		'Enhanced user metadata',
		'App performance metrics',
		'Issue tracking integrations',
	],
}

const enterprisePlan: BillingPlan = {
	name: 'Enterprise',
	type: PlanType.Enterprise,
	monthlyPrice: 1500,
	annualPrice: 1200,
	// customPrice: <MessageIcon/>,
	advertisedFeatures: [
		{
			text: '300,000 free sessions / mo',
			tooltip: SESSIONS_AFTER_LIMIT_TOOLTIP,
		},
		'Everything in Basic/Startup',
		'Personalized support',
		'User RBAC/Permissioning',
		'On-premise deployments',
		'SSO/SAML',
	],
}

export const BILLING_PLANS = [
	freePlan,
	litePlan,
	basicPlan,
	startupPlan,
	enterprisePlan,
] as const
