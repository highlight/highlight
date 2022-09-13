// Return a copy of the current query, replacing any processed sessions filter
// with a filter that only returns live sessions.
export const getUnprocessedSessionsQuery = (query: string): string => {
	return query.replaceAll(
		'{"term":{"processed":"true"}}',
		'{"term":{"processed":"false"}}',
	)
}
