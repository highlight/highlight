import { useGetLogsQuery } from '@graph/hooks'
import { Box } from '@highlight-run/ui'
import { LogsTable } from '@pages/LogsPage/LogsTable/LogsTable'
import { PRESETS } from '@pages/LogsPage/SearchForm/DatePicker/RelativeTimePicker/presets'
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
		initialStartDate: PRESETS.last_15_minutes.startDate,
		initialEndDate: PRESETS.last_15_minutes.endDate,
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
	initialStartDate: Date
	initialEndDate: Date
}

const LogsPageInner = ({
	project_id,
	initialQuery,
	initialStartDate,
	initialEndDate,
}: Props) => {
	const [query, setQuery] = useState<string>(initialQuery)
	const [selectedDates, onDatesSelected] = useState<Date[]>([
		initialStartDate,
		initialEndDate,
	])
	const history = useHistory()

	useEffect(() => {
		const params = new URLSearchParams()
		if (query) {
			params.append('query', query)
		} else {
			params.delete('query')
		}

		if (selectedDates[0]) {
			params.append('start_date', moment(selectedDates[0]).format(FORMAT))
		} else {
			params.delete('start_date')
		}

		if (selectedDates[1]) {
			params.append('end_date', moment(selectedDates[1]).format(FORMAT))
		} else {
			params.delete('end_date')
		}
		history.push({ search: params.toString() })
	}, [query, selectedDates, history])

	const { data, loading } = useGetLogsQuery({
		variables: {
			project_id,
			params: {
				query,
				date_range: {
					start_date: moment(selectedDates[0]).format(FORMAT),
					end_date: moment(selectedDates[1]).format(FORMAT),
				},
			},
		},
	})

	const handleFormSubmit = (value: string) => {
		setQuery(value)
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
						onFormSubmit={handleFormSubmit}
						selectedDates={selectedDates}
						onDatesSelected={onDatesSelected}
					/>
					<LogsTable data={data} loading={loading} query={query} />
				</Box>
			</Box>
		</>
	)
}

export default LogsPage
