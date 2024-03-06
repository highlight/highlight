interface GraduatedPriceItem {
	usage?: number
	rate: number
}

interface PriceCategory {
	free: number
	unit: number
	items: GraduatedPriceItem[]
}

export interface Prices {
	monthlyPrice: string
	annualPrice?: string
	Sessions: PriceCategory
	Errors: PriceCategory
	Logs: PriceCategory
	Traces: PriceCategory
}

export const freePrices: Prices = {
	monthlyPrice: '$0',
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

export const professionalPrices: Prices = {
	monthlyPrice: '$50',
	Sessions: {
		free: 500,
		unit: 1_000,
		items: [
			{
				usage: 15_000,
				rate: 20 / 1_000,
			},
			{
				usage: 50_000,
				rate: 15 / 1_000,
			},
			{
				usage: 150_000,
				rate: 12 / 1_000,
			},
			{
				usage: 500_000,
				rate: 6.5 / 1_000,
			},
			{
				usage: 1_000_000,
				rate: 3.5 / 1_000,
			},
			{
				rate: 2.5 / 1_000,
			},
		] as GraduatedPriceItem[],
	},
	Errors: {
		free: 1_000,
		unit: 1_000,
		items: [
			{
				usage: 50_000,
				rate: 2 / 1_000,
			},
			{
				usage: 100_000,
				rate: 0.5 / 1_000,
			},
			{
				usage: 200_000,
				rate: 0.25 / 1_000,
			},
			{
				usage: 500_000,
				rate: 0.2 / 1_000,
			},
			{
				usage: 5_000_000,
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
				usage: 1_000_000,
				rate: 2.5 / 1_000_000,
			},
			{
				usage: 10_000_000,
				rate: 2 / 1_000_000,
			},
			{
				usage: 100_000_000,
				rate: 1.5 / 1_000_000,
			},
			{
				usage: 1_000_000_000,
				rate: 1 / 1_000_000,
			},
			{
				rate: 0.5 / 1_000_000,
			},
		] as GraduatedPriceItem[],
	},
	Traces: {
		free: 25_000_000,
		unit: 1_000_000,
		items: [
			{
				usage: 1_000_000,
				rate: 2.5 / 1_000_000,
			},
			{
				usage: 10_000_000,
				rate: 2 / 1_000_000,
			},
			{
				usage: 100_000_000,
				rate: 1.5 / 1_000_000,
			},
			{
				usage: 1_000_000_000,
				rate: 1 / 1_000_000,
			},
			{
				rate: 0.5 / 1_000_000,
			},
		] as GraduatedPriceItem[],
	},
} as const

export const enterprisePrices: Prices = {
	monthlyPrice: '$3000',
	Sessions: {
		free: 500,
		unit: 1_000,
		items: [
			{
				usage: 15_000,
				rate: 20 / 1_000 / 2,
			},
			{ usage: 50_000, rate: 15 / 1_000 / 2 },
			{
				usage: 150_000,
				rate: 12 / 1_000 / 2,
			},
			{
				usage: 500_000,
				rate: 6.5 / 1_000 / 2,
			},
			{
				usage: 1_000_000,
				rate: 3.5 / 1_000 / 2,
			},
			{
				rate: 2.5 / 1_000 / 2,
			},
		] as GraduatedPriceItem[],
	},
	Errors: {
		free: 1_000,
		unit: 1_000,
		items: [
			{
				usage: 50_000,
				rate: 2 / 1_000 / 2,
			},
			{
				usage: 100_000,
				rate: 0.5 / 1_000 / 2,
			},
			{
				usage: 200_000,
				rate: 0.25 / 1_000 / 2,
			},
			{
				usage: 500_000,
				rate: 0.2 / 1_000 / 2,
			},
			{
				usage: 5_000_000,
				rate: 0.1 / 1_000 / 2,
			},
			{
				rate: 0.05 / 1_000 / 2,
			},
		] as GraduatedPriceItem[],
	},
	Logs: {
		free: 1_000_000,
		unit: 1_000_000,
		items: [
			{
				usage: 1_000_000,
				rate: 2.5 / 1_000_000 / 2,
			},
			{
				usage: 10_000_000,
				rate: 2 / 1_000_000 / 2,
			},
			{
				usage: 100_000_000,
				rate: 1.5 / 1_000_000 / 2,
			},
			{
				usage: 1_000_000_000,
				rate: 1 / 1_000_000 / 2,
			},
			{
				rate: 0.5 / 1_000_000 / 2,
			},
		] as GraduatedPriceItem[],
	},
	Traces: {
		free: 25_000_000,
		unit: 1_000_000,
		items: [
			{
				usage: 1_000_000,
				rate: 2.5 / 1_000_000 / 2,
			},
			{
				usage: 10_000_000,
				rate: 2 / 1_000_000 / 2,
			},
			{
				usage: 100_000_000,
				rate: 1.5 / 1_000_000 / 2,
			},
			{
				usage: 1_000_000_000,
				rate: 1 / 1_000_000 / 2,
			},
			{
				rate: 0.5 / 1_000_000 / 2,
			},
		] as GraduatedPriceItem[],
	},
} as const
