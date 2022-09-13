import moment from 'moment'

import {
	DailyErrorCount,
	DailySessionCount,
	Maybe,
} from '../graph/generated/schemas'

/* Calculate metadata_log frequency over past n days */
export function dailyCountData(
	dailyItemsCount:
		| Maybe<
				{
					__typename?: 'DailySessionCount' | undefined
				} & Pick<DailySessionCount, 'date' | 'count'>
		  >[]
		| Maybe<
				{
					__typename?: 'DailyErrorCount' | undefined
				} & Pick<DailyErrorCount, 'date' | 'count'>
		  >[]
		| undefined,
	n: number,
): Array<number> {
	if (!dailyItemsCount) return []
	const today = moment()
	const dateRangeData = Array(n > 0 ? n : 1).fill(0)
	for (const item of dailyItemsCount ?? []) {
		const itemDate = moment(item?.date)
		const insertIndex =
			dateRangeData.length - 1 - today.diff(itemDate, 'days')
		if (insertIndex >= 0 || insertIndex < dateRangeData.length) {
			dateRangeData[insertIndex] = item?.count
		}
	}
	return dateRangeData
}
