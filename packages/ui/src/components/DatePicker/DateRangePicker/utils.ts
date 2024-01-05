import moment from 'moment'
import { DateRangePreset } from './types'

export const presetLabel = (preset: DateRangePreset) => {
	return preset.label || `Last ${preset.quantity} ${preset.unit}`
}

export const presetValue = (preset: DateRangePreset) => {
	return preset.value || `last_${preset.quantity}_${preset.unit}`
}

export const presetStartDate = (preset: DateRangePreset): Date => {
	return moment().subtract(preset.quantity, preset.unit).toDate()
}
