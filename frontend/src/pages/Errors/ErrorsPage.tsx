import { ErrorSearchParamsInput } from '@graph/schemas'

import { ErrorState } from '../../graph/generated/schemas'
import { Complete } from '../../util/types'

// TODO: only keep query (remove all other attributes) after deprecating static filters
export const EmptyErrorsSearchParams: Complete<ErrorSearchParamsInput> = {
	browser: undefined,
	date_range: undefined,
	event: undefined,
	state: undefined,
	os: undefined,
	visited_url: undefined,
	type: undefined,
	query: `{\"isAnd\":true,\"rules\":[[\"error_state\",\"is\",\"${ErrorState.Open}\"]]}`,
} as const
