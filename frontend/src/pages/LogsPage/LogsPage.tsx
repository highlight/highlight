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

	return <LogsPageInner project_id={project_id} queryParams={queryParams} />
}

type Props = {
	project_id: string
	queryParams: URLSearchParams
}

const defaultEndDate = new Date()
const dateOffset = 24 * 60 * 60 * 1000 * 30 // 30 days
const defaultStartDate = new Date(defaultEndDate.getTime() - dateOffset)

const LogsPageInner = ({ project_id, queryParams }: Props) => {
	const [query, setQuery] = useState<string>(queryParams.get('query') ?? '')
	const [startDate, setStartDate] = useState<Date>(
		new Date(queryParams.get('start_date') ?? defaultStartDate),
	)
	const [endDate, setEndDate] = useState<Date>(
		new Date(queryParams.get('end_date') ?? defaultEndDate),
	)
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
