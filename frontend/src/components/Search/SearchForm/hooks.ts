import {
	DateRangePreset,
	DEFAULT_TIME_PRESETS,
	EXTENDED_TIME_PRESETS,
	presetStartDate,
} from '@highlight-run/ui/components'
import _ from 'lodash'

import { useGetProjectQuery } from '@/graph/generated/hooks'
import { ProductType, RetentionPeriod } from '@/graph/generated/schemas'
import { useProjectId } from '@/hooks/useProjectId'

export const useRetentionPresets = (productType: ProductType) => {
	const { projectId } = useProjectId()
	const { data } = useGetProjectQuery({
		variables: {
			id: projectId,
		},
	})

	let defaultPresets = DEFAULT_TIME_PRESETS
	let retentionPeriod = RetentionPeriod.ThirtyDays
	switch (productType) {
		case ProductType.Errors:
			retentionPeriod =
				data?.workspace?.errors_retention_period ??
				RetentionPeriod.ThreeYears
			defaultPresets = EXTENDED_TIME_PRESETS
			break
		case ProductType.Sessions:
			retentionPeriod =
				data?.workspace?.retention_period ?? RetentionPeriod.ThreeYears
			defaultPresets = EXTENDED_TIME_PRESETS
			break
	}

	let retentionPreset: DateRangePreset
	switch (retentionPeriod) {
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

	const presets = _.uniqWith(
		defaultPresets.concat([retentionPreset]),
		_.isEqual,
	)
	const minDate = presetStartDate(presets[presets.length - 1])

	return {
		presets,
		minDate,
		loading: data === undefined,
	}
}
