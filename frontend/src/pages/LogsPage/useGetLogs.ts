import { useGetLogsLazyQuery } from '@graph/hooks'
import { LogEdge } from '@graph/schemas'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'

const FORMAT = 'YYYY-MM-DDTHH:mm:00.000000000Z'

export const useGetLogs = ({
	query,
	project_id,
	log_cursor,
	startDate,
	endDate,
}: {
	query: string
	project_id: string | undefined
	log_cursor: string | undefined
	startDate: Date
	endDate: Date
}) => {
	const [logEdges, setLogEdges] = useState<LogEdge[]>([])
	const [windowInfo, setWindowInfo] = useState({
		hasNextPage: false,
		hasPreviousPage: false,
		startCursor: '',
		endCursor: '',
	})

	const [getLogs, { data, loading: logsLoading, error: logsError, fetchMore }] =
		useGetLogsLazyQuery({
			variables: {
				project_id: project_id!,
				at: log_cursor,
				params: {
					query,
					date_range: {
						start_date: moment(startDate).format(FORMAT),
						end_date: moment(endDate).format(FORMAT),
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
	}, [project_id, query, startDate, endDate, getLogs, log_cursor])

	useEffect(() => {
		if (data?.logs) {
			setLogEdges(data.logs.edges)
		}
	}, [data])

	const fetchMoreForward = useCallback(() => {
		if (!windowInfo.hasNextPage) {
			return
		}

		fetchMore({
			variables: {
				after: windowInfo.endCursor,
				before: undefined,
				at: undefined,
			}
		}).then((result) => {
			if (result.data?.logs) {
				const { pageInfo } = result.data?.logs;
				setWindowInfo({...windowInfo, 
					hasNextPage: pageInfo.hasNextPage,
					endCursor: pageInfo.endCursor,
				})
			}
		})
	}, [fetchMore, windowInfo])

	const fetchMoreBackward = useCallback(() => {
		if (!windowInfo.hasPreviousPage) {
			return
		}

		fetchMore({
			variables: {
				after: undefined,
				before: windowInfo.startCursor,
				at: undefined,
			}
		}).then((result) => {
		if (result.data?.logs) {
			const { pageInfo } = result.data?.logs;
			setWindowInfo({...windowInfo, 
				hasPreviousPage: pageInfo.hasPreviousPage,
				startCursor: pageInfo.startCursor,
			})
		}
	})
	}, [fetchMore, windowInfo])

	return {
		logEdges,
		loading: logsLoading,
		error: logsError,
		fetchMoreForward,
		fetchMoreBackward,
	}
}