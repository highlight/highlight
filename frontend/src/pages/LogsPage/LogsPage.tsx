import JsonViewer from '@components/JsonViewer/JsonViewer'
import { useGetLogsQuery } from '@graph/hooks'
import { IconSolidLoading } from '@highlight-run/ui'
import { useParams } from '@util/react-router/useParams'
import React from 'react'
import { Helmet } from 'react-helmet'

const LogsPage = () => {
	const { project_id } = useParams<{ project_id: string }>()
	const { data, loading } = useGetLogsQuery({
		variables: { project_id },
	})

	if (loading) {
		return <IconSolidLoading />
	}

	return (
		<>
			<Helmet>
				<title>Logs</title>
			</Helmet>
			<JsonViewer src={data as object} />
		</>
	)
}

export default LogsPage
