import { useGetLogsLazyQuery } from '@graph/hooks'
import { PageInfo } from '@graph/schemas'
import { LOG_TIME_FORMAT } from '@pages/LogsPage/constants'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'

export const useGetLogs = ({
	query,
	project_id,
	logCursor,
	startDate,
	endDate,
}: {
	query: string
	project_id: string | undefined
	logCursor: string | undefined
	startDate: Date
	endDate: Date
}) => {
	// The backend can only tell us page info about a single page.
	// It has no idea what pages have already been loaded.
	//
	// For example: say we make the initial request for 100 logs and hasNextPage=true and hasPreviousPage=false
	// That means that we should not make any requests when going backwards.
	//
	// If the user scrolls forward to get the next 100 logs, the server will say that hasPreviousPage is `true` since we're on page 2.
	// Hence, we track the initial information (where "window" is effectively multiple pages) to ensure we aren't making requests unnecessarily.
	const [windowInfo, setWindowInfo] = useState<PageInfo>({
		hasNextPage: false,
		hasPreviousPage: false,
		startCursor: '',
		endCursor: '',
	})
	const [loadingAfter, setLoadingAfter] = useState(false)
	const [loadingBefore, setLoadingBefore] = useState(false)

	const [getLogs, { data, loading, error, fetchMore }] = useGetLogsLazyQuery({
		variables: {
			project_id: project_id!,
			at: logCursor,
			params: {
				query,
				date_range: {
					start_date: moment(startDate).format(LOG_TIME_FORMAT),
					end_date: moment(endDate).format(LOG_TIME_FORMAT),
				},
			},
		},
		fetchPolicy: 'cache-and-network',
	})

	useEffect(() => {
		getLogs().then((result) => {
			if (result.data?.logs) {
				setWindowInfo(result.data.logs.pageInfo)
			}
		})
	}, [getLogs])

	const fetchMoreForward = useCallback(() => {
		if (!windowInfo.hasNextPage) {
			return
		}

		setLoadingAfter(true)

		fetchMore({
			variables: {
				after: windowInfo.endCursor,
				before: undefined,
				at: undefined,
			},
		})
			.then((result) => {
				if (result.data?.logs) {
					const { pageInfo } = result.data?.logs
					setWindowInfo({
						...windowInfo,
						hasNextPage: pageInfo.hasNextPage,
						endCursor: pageInfo.endCursor,
					})
				}
			})
			.finally(() => {
				setLoadingAfter(false)
			})
	}, [fetchMore, windowInfo])

	const fetchMoreBackward = useCallback(() => {
		if (!windowInfo.hasPreviousPage) {
			return
		}

		setLoadingBefore(false)
		fetchMore({
			variables: {
				after: undefined,
				before: windowInfo.startCursor,
				at: undefined,
			},
		})
			.then((result) => {
				if (result.data?.logs) {
					const { pageInfo } = result.data?.logs
					setWindowInfo({
						...windowInfo,
						hasPreviousPage: pageInfo.hasPreviousPage,
						startCursor: pageInfo.startCursor,
					})
				}
			})
			.finally(() => {
				setLoadingBefore(false)
			})
	}, [fetchMore, windowInfo])

	return {
		logEdges: data?.logs.edges || [],
		loading,
		loadingAfter,
		loadingBefore,
		error,
		fetchMoreForward,
		fetchMoreBackward,
	}
}
