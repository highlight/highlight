interface GraduatedPriceItem {
	usage?: number
	rate: number
	constant?: boolean
}

interface PriceCategory {
	free: number
	unit: number
	items: GraduatedPriceItem[]
}

export interface Prices {
	monthlyPrice: number
	Sessions: PriceCategory
	Errors: PriceCategory
	Logs: PriceCategory
	Traces: PriceCategory
}

export const freePrices: Prices = {
	monthlyPrice: 0,
	Sessions: {
		free: 500,
		unit: 1_000,
		items: [] as GraduatedPriceItem[],
	},
	Errors: {
		free: 1_000,
		unit: 1_000,
		items: [] as GraduatedPriceItem[],
	},
	Logs: {
		free: 1_000_000,
		unit: 1_000_000,
		items: [] as GraduatedPriceItem[],
	},
	Traces: {
		free: 25_000_000,
		unit: 1_000_000,
		items: [] as GraduatedPriceItem[],
	},
} as const

export const businessPrices: Prices = {
	monthlyPrice: 800,
	Sessions: {
		free: 500,
		unit: 1_000,
		items: [
			{
				usage: 14_500,
				rate: 20 / 1_000,
			},
			{
				usage: 35_000,
				rate: 15 / 1_000,
			},
			{
				usage: 100_000,
				rate: 12 / 1_000,
			},
			{
				usage: 350_000,
				rate: 6.5 / 1_000,
			},
			{
				usage: 500_000,
				rate: 0.35 / 1_000,
			},
			{
				rate: 0.25 / 1_000,
			},
		] as GraduatedPriceItem[],
	},
	Errors: {
		free: 1_000,
		unit: 1_000,
		items: [
			{
				usage: 14_500,
				rate: 2 / 1_000,
			},
			{
				usage: 35_000,
				rate: 0.5 / 1_000,
			},
			{
				usage: 100_000,
				rate: 0.25 / 1_000,
			},
			{
				usage: 350_000,
				rate: 0.2 / 1_000,
			},
			{
				usage: 500_000,
				rate: 0.1 / 1_000,
			},
			{
				rate: 0.05 / 1_000,
			},
		] as GraduatedPriceItem[],
	},
	Logs: {
		free: 1_000_000,
		unit: 1_000_000,
		items: [
			{
				usage: 9_000_000,
				rate: 2 / 1_000_000,
			},
			{
				usage: 90_000_000,
				rate: 1.5 / 1_000_000,
			},
			{
				usage: 900_000_000,
				rate: 1 / 1_000_000,
			},
			{
				usage: 999_000_000_000,
				rate: 0.5 / 1_000_000,
			},
			{
				rate: 0.3 / 1_000_000,
			},
		] as GraduatedPriceItem[],
	},
	Traces: {
		free: 25_000_000,
		unit: 1_000_000,
		items: [
			{
				usage: 9_000_000,
				rate: 2 / 1_000_000,
			},
			{
				usage: 90_000_000,
				rate: 1.5 / 1_000_000,
			},
			{
				usage: 900_000_000,
				rate: 1 / 1_000_000,
			},
			{
				usage: 999_000_000_000,
				rate: 0.5 / 1_000_000,
			},
			{
				rate: 0.3 / 1_000_000,
			},
		] as GraduatedPriceItem[],
	},
} as const

export const payAsYouGoPrices: Prices = {
	monthlyPrice: 50,
	Sessions: {
		free: 500,
		unit: 1_000,
		items: [
			{
				usage: 14_500,
				rate: 20 / 1_000,
			},
			{
				usage: 35_000,
				rate: 15 / 1_000,
			},
			{
				usage: 100_000,
				rate: 12 / 1_000,
			},
			{
				usage: 350_000,
				rate: 6.5 / 1_000,
			},
			{
				usage: 500_000,
				rate: 0.35 / 1_000,
			},
			{
				rate: 0.25 / 1_000,
			},
		] as GraduatedPriceItem[],
	},
	Errors: {
		free: 1_000,
		unit: 1_000,
		items: [
			{
				usage: 14_500,
				rate: 2 / 1_000,
			},
			{
				usage: 35_000,
				rate: 0.5 / 1_000,
			},
			{
				usage: 100_000,
				rate: 0.25 / 1_000,
			},
			{
				usage: 350_000,
				rate: 0.2 / 1_000,
			},
			{
				usage: 500_000,
				rate: 0.1 / 1_000,
			},
			{
				rate: 0.05 / 1_000,
			},
		] as GraduatedPriceItem[],
	},
	Logs: {
		free: 1_000_000,
		unit: 1_000_000,
		items: [
			{
				usage: 9_000_000,
				rate: 2 / 1_000_000,
			},
			{
				usage: 90_000_000,
				rate: 1.5 / 1_000_000,
			},
			{
				usage: 900_000_000,
				rate: 1 / 1_000_000,
			},
			{
				usage: 999_000_000_000,
				rate: 0.5 / 1_000_000,
			},
			{
				rate: 0.3 / 1_000_000,
			},
		] as GraduatedPriceItem[],
	},
	Traces: {
		free: 25_000_000,
		unit: 1_000_000,
		items: [
			{
				usage: 9_000_000,
				rate: 2 / 1_000_000,
			},
			{
				usage: 90_000_000,
				rate: 1.5 / 1_000_000,
			},
			{
				usage: 900_000_000,
				rate: 1 / 1_000_000,
			},
			{
				usage: 999_000_000_000,
				rate: 0.5 / 1_000_000,
			},
			{
				rate: 0.3 / 1_000_000,
			},
		] as GraduatedPriceItem[],
	},
} as const

export const enterprisePrices: Prices = {
	monthlyPrice: 1000,
	Sessions: {
		free: 500,
		unit: 1_000,
		items: [
			{
				usage: 14_500,
				rate: 20 / 1_000,
			},
			{
				usage: 35_000,
				rate: 15 / 1_000,
			},
			{
				usage: 100_000,
				rate: 12 / 1_000,
			},
			{
				usage: 350_000,
				rate: 6.5 / 1_000,
			},
			{
				usage: 500_000,
				rate: 0.35 / 1_000,
			},
			{
				rate: 0.25 / 1_000,
			},
		] as GraduatedPriceItem[],
	},
	Errors: {
		free: 1_000,
		unit: 1_000,
		items: [
			{
				usage: 14_500,
				rate: 2 / 1_000,
			},
			{
				usage: 35_000,
				rate: 0.5 / 1_000,
			},
			{
				usage: 100_000,
				rate: 0.25 / 1_000,
			},
			{
				usage: 350_000,
				rate: 0.2 / 1_000,
			},
			{
				usage: 500_000,
				rate: 0.1 / 1_000,
			},
			{
				rate: 0.05 / 1_000,
			},
		] as GraduatedPriceItem[],
	},
	Logs: {
		free: 1_000_000,
		unit: 1_000_000,
		items: [
			{
				usage: 9_000_000,
				rate: 2 / 1_000_000,
			},
			{
				usage: 90_000_000,
				rate: 1.5 / 1_000_000,
			},
			{
				usage: 900_000_000,
				rate: 1 / 1_000_000,
			},
			{
				usage: 999_000_000_000,
				rate: 0.5 / 1_000_000,
			},
			{
				rate: 0.3 / 1_000_000,
			},
		] as GraduatedPriceItem[],
	},
	Traces: {
		free: 25_000_000,
		unit: 1_000_000,
		items: [
			{
				usage: 9_000_000,
				rate: 2 / 1_000_000,
			},
			{
				usage: 90_000_000,
				rate: 1.5 / 1_000_000,
			},
			{
				usage: 900_000_000,
				rate: 1 / 1_000_000,
			},
			{
				usage: 999_000_000_000,
				rate: 0.5 / 1_000_000,
			},
			{
				rate: 0.3 / 1_000_000,
			},
		] as GraduatedPriceItem[],
	},
} as const

export const selfHostPrices: Prices = {
	monthlyPrice: 3000,
	Sessions: {
		free: 500,
		unit: 1_000,
		items: [
			{
				usage: 14_500,
				rate: 20 / 1_000 / 4,
			},
			{
				usage: 35_000,
				rate: 15 / 1_000 / 4,
			},
			{
				usage: 100_000,
				rate: 12 / 1_000 / 4,
			},
			{
				usage: 350_000,
				rate: 6.5 / 1_000 / 4,
			},
			{
				usage: 500_000,
				rate: 0.35 / 1_000 / 4,
			},
			{
				rate: 0.25 / 1_000 / 4,
			},
		] as GraduatedPriceItem[],
	},
	Errors: {
		free: 1_000,
		unit: 1_000,
		items: [
			{
				usage: 14_500,
				rate: 2 / 1_000 / 4,
			},
			{
				usage: 35_000,
				rate: 0.5 / 1_000 / 4,
			},
			{
				usage: 100_000,
				rate: 0.25 / 1_000 / 4,
			},
			{
				usage: 350_000,
				rate: 0.2 / 1_000 / 4,
			},
			{
				usage: 500_000,
				rate: 0.1 / 1_000 / 4,
			},
			{
				rate: 0.05 / 1_000 / 4,
			},
		] as GraduatedPriceItem[],
	},
	Logs: {
		free: 1_000_000,
		unit: 1_000_000,
		items: [
			{
				usage: 9_000_000,
				rate: 2 / 1_000_000 / 4,
			},
			{
				usage: 90_000_000,
				rate: 1.5 / 1_000_000 / 4,
			},
			{
				usage: 900_000_000,
				rate: 1 / 1_000_000 / 4,
			},
			{
				usage: 999_000_000_000,
				rate: 0.5 / 1_000_000 / 4,
			},
			{
				rate: 0.3 / 1_000_000 / 4,
			},
		] as GraduatedPriceItem[],
	},
	Traces: {
		free: 25_000_000,
		unit: 1_000_000,
		items: [
			{
				usage: 9_000_000,
				rate: 2 / 1_000_000 / 4,
			},
			{
				usage: 90_000_000,
				rate: 1.5 / 1_000_000 / 4,
			},
			{
				usage: 900_000_000,
				rate: 1 / 1_000_000 / 4,
			},
			{
				usage: 999_000_000_000,
				rate: 0.5 / 1_000_000 / 4,
			},
			{
				rate: 0.3 / 1_000_000 / 4,
			},
		] as GraduatedPriceItem[],
	},
} as const

const retentionOptions = [
	'30 days',
	'3 months',
	'6 months',
	'1 year',
	'2 years',
] as const
export type Retention = (typeof retentionOptions)[number]

export const RetentionMultipliers: Record<Retention, number> = {
	'30 days': 1,
	'3 months': 1,
	'6 months': 1.5,
	'1 year': 2,
	'2 years': 2.5,
} as const

export const TierOptions = [
	'Free',
	'PayAsYouGo',
	'Business',
	'Enterprise',
	'SelfHostedEnterprise',
] as const
export type TierName = (typeof TierOptions)[number]

export type PricingTier = {
	label: string
	id?: string //PlanTier name, if not same as label
	subText?: string
	prices: Prices
	features: {
		feature: string
		tooltip?: string
	}[]
	calculateUsage?: boolean
	contactUs?: boolean
	buttonLabel: string
	buttonLink?: string
	hidden?: boolean // hidden from plan tier, but not in estimator
}

export const StandardPrices: Record<TierName, PricingTier> = {
	Free: {
		label: 'Free',
		prices: freePrices,
		subText: 'Free Forever',
		features: [
			{
				feature: `500 monthly sessions`,
			},
			{
				feature: 'AI error grouping',
			},
			{
				feature: 'Up to 15 seats',
			},
		],
		buttonLabel: 'Start free trial',
		buttonLink: 'https://app.highlight.io/sign_up',
	},
	PayAsYouGo: {
		label: 'Pay-as-you-go',
		id: 'PayAsYouGo',
		subText: 'Starts at',
		prices: payAsYouGoPrices,
		features: [
			{
				feature: 'Up to 3 dashboards',
				tooltip: `Create up to 3 dashboards in the metrics product.`,
			},
			{
				feature: 'Up to 2 projects',
				tooltip: `Create up to 2 projects for separating web app data.`,
			},
			{
				feature: 'Up to 15 seats',
			},
			{
				feature: 'Up to 7 day retention',
			},
		],
		calculateUsage: true,
		buttonLabel: 'Start free trial',
		buttonLink: 'https://app.highlight.io/sign_up',
	},
	Business: {
		label: 'Business',
		id: 'Business',
		subText: 'Starts at',
		prices: businessPrices,
		features: [
			{
				feature: 'Unlimited dashboards',
			},
			{
				feature: `Unlimited projects`,
				tooltip: `Separate your data into different projects in a single billing account.`,
			},
			{
				feature: 'Unlimited seats',
			},
			{
				feature: 'Custom retention policies',
			},
			{
				feature: `Filters for data ingest`,
				tooltip: `Ability to filter out data before it is ingested to mitigate costs.`,
			},
			{
				feature: `Everything in Pay-as-you-go`,
			},
		],
		calculateUsage: true,
		buttonLabel: 'Start free trial',
		buttonLink: 'https://app.highlight.io/sign_up',
	},
	Enterprise: {
		label: 'Enterprise',
		subText: 'Contact sales for pricing',
		prices: enterprisePrices,
		features: [
			{
				feature: 'SAML & SSO',
				tooltip:
					'Secure user management to ensure you can manage your team with your existing tooling.',
			},
			{
				feature: 'Custom MSAs & SLAs',
				tooltip:
					'Custom contracts to abide by your compliance requirements; we handle these on a case-by-case basis.',
			},
			{
				feature: 'RBAC & audit logs',
				tooltip:
					'Infrastructure for auditing and adding fine-grained access controls.',
			},
			{
				feature: 'Data export & user reporting',
				tooltip:
					'Recurring or one-off exports of your observability data for offline analysis.',
			},
			{
				feature: 'Everything in Business',
			},
		],
		contactUs: true,
		buttonLabel: 'Contact us',
		calculateUsage: true,
	},
	SelfHostedEnterprise: {
		label: 'Self-Hosted Enterprise',
		id: 'SelfHostedEnterprise',

		subText: 'per month, billed annually',
		prices: selfHostPrices,
		features: [],
		calculateUsage: true,
		buttonLabel: 'Learn More',
		buttonLink:
			'/docs/general/company/open-source/hosting/self-host-enterprise',
		contactUs: true,
		hidden: true,
	},
} as const

export const CustomPrices = {
	example: {
		Enterprise: {
			...StandardPrices.Enterprise,
			contactUs: false,
			prices: {
				...enterprisePrices,
				monthlyPrice: (40_000 + 8_313 + 10_740) / 12,
				Sessions: {
					free: 50_000,
					unit: 1_000,
					items: [
						{
							rate: 12 / 1_000,
						},
					] as GraduatedPriceItem[],
				},
				Logs: {
					free: 1_000_000_000,
					unit: 1_000_000,
					items: [
						{
							rate: 0.5 / 1_000_000,
						},
					] as GraduatedPriceItem[],
				},
				Traces: {
					free: 1_000_000_000,
					unit: 1_000_000,
					items: [
						{
							rate: 0.5 / 1_000_000,
						},
					] as GraduatedPriceItem[],
				},
			},
		},
	},
} as const
