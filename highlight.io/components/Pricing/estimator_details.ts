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
	annualPrice?: number
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
} as const
