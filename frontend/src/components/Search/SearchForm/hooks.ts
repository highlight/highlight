import {
	DateRangePreset,
	DEFAULT_TIME_PRESETS,
	EXTENDED_TIME_PRESETS,
	presetStartDate,
} from '@highlight-run/ui/components'
import _ from 'lodash'
import moment from 'moment'

import { ProductType, RetentionPeriod } from '@/graph/generated/schemas'
import { useApplicationContext } from '@/routers/AppRouter/context/ApplicationContext'

export const useRetentionPresets = (productType: ProductType) => {
	const { currentWorkspace } = useApplicationContext()

	let defaultPresets = DEFAULT_TIME_PRESETS
	let retentionPeriod: RetentionPeriod | undefined =
		RetentionPeriod.ThirtyDays
	switch (productType) {
		case ProductType.Errors:
			retentionPeriod =
				currentWorkspace?.errors_retention_period ??
				RetentionPeriod.ThreeMonths
			defaultPresets = EXTENDED_TIME_PRESETS
			break
		case ProductType.Sessions:
			retentionPeriod =
				currentWorkspace?.retention_period ??
				RetentionPeriod.ThreeMonths
			defaultPresets = EXTENDED_TIME_PRESETS
			break
	}

	let retentionPreset: DateRangePreset
	switch (retentionPeriod) {
		case RetentionPeriod.SevenDays:
			retentionPreset = {
				unit: 'days',
				quantity: 7,
			}
			break
		case RetentionPeriod.ThirtyDays:
			retentionPreset = {
				unit: 'days',
				quantity: 30,
			}
			break
		case RetentionPeriod.ThreeMonths:
			retentionPreset = {
				unit: 'months',
				quantity: 3,
			}
			break
		case RetentionPeriod.SixMonths:
			retentionPreset = {
				unit: 'months',
				quantity: 6,
			}
			break
		case RetentionPeriod.TwelveMonths:
			retentionPreset = {
				unit: 'months',
				quantity: 12,
			}
			break
		case RetentionPeriod.TwoYears:
			retentionPreset = {
				unit: 'years',
				quantity: 2,
			}
			break
		case RetentionPeriod.ThreeYears:
			retentionPreset = {
				unit: 'years',
				quantity: 3,
			}
			break
	}

	// Add the retention preset as a selectable preset
	// Filter out any presets larger than the retention duration
	const presets = _.uniqWith(
		defaultPresets.concat([retentionPreset]),
		_.isEqual,
	).filter((p) => {
		return (
			moment.duration(p.quantity, p.unit) <=
			moment.duration(retentionPreset.quantity, retentionPreset.unit)
		)
	})

	const minDate = presetStartDate(presets[presets.length - 1])

	return {
		presets,
		minDate,
	}
}
