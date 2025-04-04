import { LazyQueryExecFunction, QueryResult } from '@apollo/client'
import log from '@util/log'
import moment from 'moment'
import { useEffect, useRef, useState } from 'react'

import { QueryInput } from '@/graph/generated/schemas'

export const POLL_INTERVAL = 5000
const POLL_EXPIRY_MINUTES = 15

// usePollQuery polls a lazy query function and returns a 'more' count
export function usePollQuery<
	T,
	U extends {
		params: QueryInput
	},
>({
	variableFn,
	moreDataQuery,
	getResultCount,
	skip,
	maxResults,
}: {
	variableFn: () => U | undefined
	moreDataQuery: LazyQueryExecFunction<T, U>
	getResultCount: (variables: QueryResult<T, U>) => number | undefined
	skip?: boolean
	maxResults: number
}) {
	const pollTimeout = useRef<number | undefined>(undefined)
	const [numMore, setNumMore] = useState<number>(0)
	const [pollingExpired, setPollingExpired] = useState<boolean>(false)

	useEffect(() => {
		if (numMore >= maxResults) {
			clearTimeout(pollTimeout.current)
			pollTimeout.current = undefined
		}
	}, [numMore, maxResults])

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

			const startDate = variables.params.date_range.start_date
			const endDate = variables.params.date_range.end_date

			const isExpired =
				moment(endDate).diff(startDate, 'minutes') >=
				POLL_EXPIRY_MINUTES
			if (isExpired) {
				setPollingExpired(true)
				pollTimeout.current = undefined
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
			setPollingExpired(false)
			clearTimeout(pollTimeout.current)
			pollTimeout.current = undefined
		}
	}, [getResultCount, moreDataQuery, variableFn, skip])
	return {
		numMore,
		pollingExpired,
		reset: () => {
			setNumMore(0)
			setPollingExpired(false)
			clearTimeout(pollTimeout.current)
			pollTimeout.current = undefined
		},
	}
}
