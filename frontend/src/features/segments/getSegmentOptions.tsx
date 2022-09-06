import { SegmentFragment } from '@graph/operations'
import { Maybe } from '@graph/schemas'

import { STARRED_SEGMENT_ID } from '../../pages/Sessions/SearchSidebar/SegmentPicker/SegmentPicker'

export function getSegmentOptions(segments: Array<Maybe<SegmentFragment>>) {
	return [
		{
			id: STARRED_SEGMENT_ID,
			value: 'Starred',
			displayValue: 'Starred',
		},
		...(segments || [])
			.map((segment) => ({
				id: segment?.id || '',
				value: segment?.name || '',
				displayValue: segment?.name || '',
			}))
			.sort((a, b) =>
				a.displayValue
					.toLowerCase()
					.localeCompare(b.displayValue.toLowerCase()),
			),
	]
}
