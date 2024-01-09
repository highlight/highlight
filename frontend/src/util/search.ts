import { LazyQueryExecFunction, QueryResult } from '@apollo/client'
import { QueryBuilderState } from '@components/QueryBuilder/QueryBuilder'
import { resetRelativeDates } from '@highlight-run/ui/components'
import { useErrorSearchContext } from '@pages/Errors/ErrorSearchContext/ErrorSearchContext'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'
import log from '@util/log'
import { useEffect, useRef, useState } from 'react'

export const POLL_INTERVAL = 5000

// usePollQuery polls a lazy query function and returns a 'more' count
export function usePollQuery<T, U>({
	variableFn,
	moreDataQuery,
	getResultCount,
	skip,
}: {
	variableFn: () => U | undefined
	moreDataQuery: LazyQueryExecFunction<T, U>
	getResultCount: (variables: QueryResult<T, U>) => number | undefined
	skip?: boolean
}) {
	const pollTimeout = useRef<number>()
	const [numMore, setNumMore] = useState<number>(0)

	const { searchQuery, setSearchQuery } = useSearchContext()
	const {
		searchQuery: errorSearchQuery,
		setSearchQuery: setErrorSearchQuery,
	} = useErrorSearchContext()

	useEffect(() => {
		if (skip) {
			return
		}

		// setup a polling interval for sessions after the current date range
		const poll = async () => {
			const variables = variableFn()
			if (variables === undefined) {
				log('search.ts', 'skipping polling for custom time selection')
				pollTimeout.current = setTimeout(
					poll,
					POLL_INTERVAL,
				) as unknown as number
				return
			}
			const currentTimeout = pollTimeout.current
			const result = await moreDataQuery({ variables })
			if (pollTimeout.current === currentTimeout) {
				const count = getResultCount(result)
				if (count !== undefined) {
					setNumMore(count)
				}
				pollTimeout.current = setTimeout(
					poll,
					POLL_INTERVAL,
				) as unknown as number
			}
		}
		pollTimeout.current = setTimeout(
			poll,
			POLL_INTERVAL,
		) as unknown as number
		return () => {
			setNumMore(0)
			clearTimeout(pollTimeout.current)
			pollTimeout.current = undefined
		}
	}, [getResultCount, moreDataQuery, variableFn, skip])
	return {
		numMore,
		reset: () => {
			resetRelativeDates()
			clearTimeout(pollTimeout.current)
			pollTimeout.current = undefined
			setNumMore(0)

			const currentState = JSON.parse(searchQuery) as QueryBuilderState
			const newRules = currentState.rules.filter(
				(rule) => rule[0] !== 'custom_created_at',
			)
			setSearchQuery(
				JSON.stringify({
					isAnd: currentState.isAnd,
					rules: newRules,
				}),
			)

			const currentErrorState = JSON.parse(
				errorSearchQuery,
			) as QueryBuilderState
			const newErrorRules = currentErrorState.rules.filter(
				(rule) => rule[0] !== 'error-field_timestamp',
			)
			setErrorSearchQuery(
				JSON.stringify({
					isAnd: currentState.isAnd,
					rules: newErrorRules,
				}),
			)
		},
	}
}
