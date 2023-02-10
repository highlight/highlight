import { useGetLogsQuery } from '@graph/hooks'
import { Box } from '@highlight-run/ui'
import { LogsTable } from '@pages/LogsPage/LogsTable/LogsTable'
import { SearchForm } from '@pages/LogsPage/SearchForm/SearchForm'
import { useParams } from '@util/react-router/useParams'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useHistory, useLocation } from 'react-router-dom'

const FORMAT = 'YYYY-MM-DDTHH:mm:00.000000000Z'

function useQuery() {
	const { search } = useLocation()

	return React.useMemo(() => new URLSearchParams(search), [search])
}

const LogsPage = () => {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const queryParams = useQuery()

	const innerLogsPageProps: Props = {
		project_id,
		initialQuery: '',
		initialStartDate: undefined,
		initialEndDate: undefined,
	}

	const query = queryParams.get('query')
	const startDate = queryParams.get('start_date')
	const endDate = queryParams.get('end_date')
	if (query) {
		innerLogsPageProps.initialQuery = query
	}
	if (startDate) {
		innerLogsPageProps.initialStartDate = new Date(startDate)
	}

	if (endDate) {
		innerLogsPageProps.initialEndDate = new Date(endDate)
	}

	return <LogsPageInner {...innerLogsPageProps} />
}

type Props = {
	project_id: string
	initialQuery: string
	initialStartDate: Date | undefined
	initialEndDate: Date | undefined
}

const LogsPageInner = ({
	project_id,
	initialQuery,
	initialStartDate,
	initialEndDate,
}: Props) => {
	const [query, setQuery] = useState<string>(initialQuery)
	const [startDate, setStartDate] = useState<Date | undefined>(
		initialStartDate,
	)
	const [endDate, setEndDate] = useState<Date | undefined>(initialEndDate)
	const history = useHistory()

	useEffect(() => {
		const params = new URLSearchParams()
		if (query) {
			params.append('query', query)
		} else {
			params.delete('query')
		}

		if (startDate) {
			params.append('start_date', moment(startDate).format(FORMAT))
		} else {
			params.delete('start_date')
		}

		if (endDate) {
			params.append('end_date', moment(endDate).format(FORMAT))
		} else {
			params.delete('end_date')
		}
		history.push({ search: params.toString() })
	}, [query, startDate, endDate, history])

	const { data, loading } = useGetLogsQuery({
		variables: {
			project_id,
			params: {
				query,
				date_range: {
					start_date: moment(startDate).format(FORMAT),
					end_date: moment(endDate).format(FORMAT),
				},
			},
		},
	})

	const handleFormSubmit = (value: string) => {
		setQuery(value)
	}

	const handleDatesSelected = (startDate: Date, endDate: Date) => {
		setStartDate(startDate)
		setEndDate(endDate)
	}

	return (
		<>
			<Helmet>
				<title>Logs</title>
			</Helmet>
			<Box background="n2" padding="8" flex="stretch">
				<Box background="white" borderRadius="12">
					<SearchForm
						initialQuery={query}
						initialStartDate={startDate}
						initialEndDate={endDate}
						onFormSubmit={handleFormSubmit}
						onDatesSelected={handleDatesSelected}
					/>
					<LogsTable data={data} loading={loading} query={query} />
				</Box>
			</Box>
		</>
	)
}

export default LogsPage
