import { useGetLogsLazyQuery } from '@graph/hooks'
import { LogEdge } from '@graph/schemas'
import { FORMAT } from '@pages/LogsPage/constants'
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
	const [logEdges, setLogEdges] = useState<LogEdge[]>([])
	const [windowInfo, setWindowInfo] = useState({
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
	}, [getLogs])

	useEffect(() => {
		if (data?.logs) {
			setLogEdges(data.logs.edges)
		}
	}, [data])

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
		logEdges,
		loading,
		loadingAfter,
		loadingBefore,
		error,
		fetchMoreForward,
		fetchMoreBackward,
	}
}
