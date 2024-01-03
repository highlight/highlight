import { ErrorState } from '../../graph/generated/schemas'

export const EmptyErrorsSearchQuery = `{"isAnd":true,"rules":[["error_state","is","${ErrorState.Open}"]]}`
