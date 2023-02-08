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

const defaultEndDate = moment().format(FORMAT)
const defaultStartDate = moment(defaultEndDate)
	.subtract('30', 'days')
	.format(FORMAT)

const LogsPage = () => {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const queryParams = useQuery()

	return (
		<LogsPageInner
			project_id={project_id}
			queryParam={queryParams.get('query') ?? ''}
			start_date={defaultStartDate}
			end_date={defaultEndDate}
		/>
	)
}

type Props = {
	project_id: string
	queryParam: string
	start_date: string
	end_date: string
}

const LogsPageInner = ({
	project_id,
	queryParam,
	start_date,
	end_date,
}: Props) => {
	const [query, setQuery] = useState(queryParam)
	const history = useHistory()

	useEffect(() => {
		const params = new URLSearchParams()
		if (query) {
			params.append('query', query)
		} else {
			params.delete('query')
		}
		history.push({ search: params.toString() })
	}, [query, history])

	const { data, loading } = useGetLogsQuery({
		variables: {
			project_id,
			params: {
				query,
				date_range: {
					start_date,
					end_date,
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
						startDate={start_date}
						endDate={end_date}
					/>
					<LogsTable data={data} loading={loading} query={query} />
				</Box>
			</Box>
		</>
	)
}

export default LogsPage
