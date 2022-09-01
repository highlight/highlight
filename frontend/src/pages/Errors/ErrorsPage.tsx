import { ErrorState } from '../../graph/generated/schemas'
import { Complete } from '../../util/types'
import { ErrorSearchParams } from './ErrorSearchContext/ErrorSearchContext'

export const EmptyErrorsSearchParams: Complete<ErrorSearchParams> = {
	browser: undefined,
	date_range: undefined,
	event: undefined,
	state: ErrorState.Open,
	os: undefined,
	visited_url: undefined,
	type: undefined,
	query: undefined,
}
