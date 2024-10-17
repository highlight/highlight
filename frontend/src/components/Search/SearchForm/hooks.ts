import {
	DateRangePreset,
	EXTENDED_TIME_PRESETS,
	presetStartDate,
} from '@highlight-run/ui/components'
import _ from 'lodash'
import moment from 'moment'

import { ProductType, RetentionPeriod } from '@/graph/generated/schemas'
import { useApplicationContext } from '@/routers/AppRouter/context/ApplicationContext'
import { getRetentionDays } from '@/pages/Billing/utils/utils'

export const useRetentionPresets = (productType?: ProductType) => {
	const { currentWorkspace } = useApplicationContext()

	let retentionPeriod: RetentionPeriod | undefined =
		RetentionPeriod.ThirtyDays
	switch (productType) {
		case ProductType.Errors:
			retentionPeriod =
				currentWorkspace?.errors_retention_period ??
				RetentionPeriod.ThreeMonths
			break
		case ProductType.Sessions:
			retentionPeriod =
				currentWorkspace?.retention_period ??
				RetentionPeriod.ThreeMonths
			break
		case undefined:
			// If no product type specified, use the max retention period
			const sessionDays = getRetentionDays(
				currentWorkspace?.retention_period ??
					RetentionPeriod.ThreeMonths,
			)
			const errorDays = getRetentionDays(
				currentWorkspace?.errors_retention_period ??
					RetentionPeriod.ThreeMonths,
			)

			if (sessionDays > errorDays) {
				retentionPeriod = currentWorkspace?.retention_period
			} else {
				retentionPeriod = currentWorkspace?.errors_retention_period
			}
			retentionPeriod = retentionPeriod ?? RetentionPeriod.ThreeMonths
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
		EXTENDED_TIME_PRESETS.concat([retentionPreset]),
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
