import { ErrorSearchParamsInput } from '@graph/schemas'

import { ErrorState } from '../../graph/generated/schemas'
import { Complete } from '../../util/types'

export const EmptyErrorsSearchParams: Complete<ErrorSearchParamsInput> = {
	browser: undefined,
	date_range: undefined,
	event: undefined,
	state: ErrorState.Open,
	os: undefined,
	visited_url: undefined,
	type: undefined,
	query: undefined,
}
