import moment from 'moment'

export type DateRangePreset = {
	unit: moment.DurationInputArg2
	quantity: number
	label?: string // defaults to `Last ${quantity} ${unit}`
	value?: string // defaults to `last_${quantity}_${unit}`
}

export enum MenuState {
	Default,
	Custom,
}

export type DateRangeValue = {
	startDate?: Date
	endDate?: Date
	selectedPreset?: DateRangePreset
}
