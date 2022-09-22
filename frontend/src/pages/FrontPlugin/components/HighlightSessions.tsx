import React, { useEffect, useState } from 'react'
import { useFrontContext } from '@pages/FrontPlugin/Front/FrontContext'
import Button from '@components/Button/Button/Button'
import MinimalSessionCard from '@pages/Sessions/SessionsFeedV2/components/MinimalSessionCard/MinimalSessionCard'
import { useGetSessionsOpenSearchQuery } from '@graph/hooks'
import { getUnprocessedSessionsQuery } from '@pages/Sessions/SessionsFeedV2/components/QueryBuilder/utils/utils'
import { useParams } from '@util/react-router/useParams'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'
import SessionsQueryBuilder from '@pages/Sessions/SessionsFeedV2/components/SessionsQueryBuilder/SessionsQueryBuilder'
import { EmptySessionsSearchParams } from '@pages/Sessions/EmptySessionsSearchParams'

function getProjectID() {
	const params = new Proxy(new URLSearchParams(window.location.search), {
		get: (searchParams, prop) => searchParams.get(prop.toString()),
	}) as { project?: number }
	return params.project || 1
}

function HighlightSessions() {
	const { backendSearchQuery, setSearchParams } = useSearchContext()
	const frontContext = useFrontContext()
	const { project_id } = useParams<{
		project_id: string
	}>()
	const { data } = useGetSessionsOpenSearchQuery({
		variables: {
			project_id,
			count: 100,
			page: 1,
			query: getUnprocessedSessionsQuery(
				backendSearchQuery?.searchQuery || '',
			),
			sort_desc: false,
		},
		skip: !backendSearchQuery,
		fetchPolicy: 'network-only',
	})
	const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({
		start: undefined,
		end: undefined,
	})

	const user = frontContext?.teammate?.name || 'there'
	const email =
		frontContext?.type === 'singleConversation'
			? frontContext?.conversation?.recipient?.handle || ''
			: ''
	const recipient =
		frontContext?.type === 'singleConversation'
			? frontContext?.conversation?.recipient?.name ||
			  email ||
			  'recipient'
			: email || 'recipient'

	useEffect(() => {
		if (frontContext?.type === 'singleConversation') {
			frontContext.listMessages().then((response) => {
				if (response.results.length > 0) {
					const latestMessageIndex = response.results.length - 1
					const start = new Date(response.results[0].date)
					// offset by 7 days
					start.setDate(start.getDate() - 7)
					const end = new Date(
						response.results[latestMessageIndex].date,
					)
					setDateRange({
						start,
						end,
					})
					setSearchParams({
						...EmptySessionsSearchParams,
						query: JSON.stringify({
							isAnd: true,
							rules: [
								['user_email', 'contains', email],
								[
									'custom_created_at',
									'between_date',
									`${start}_${end}`,
								],
							],
						}),
					})
				}
			})
		}
	}, [frontContext])

	const projectId = getProjectID()
	const url = encodeURI(
		`https://app.highlight.run/${projectId}/sessions?query=and` +
			`||user_email,contains,${email}` +
			`||custom_created_at,between_date,${dateRange.start}_${dateRange.end}`,
	)
	return (
		<div className={'w-full flex flex-row justify-center p-2'}>
			<div className={'w-full flex flex-col gap-2'}>
				<h2>Hello {user}!</h2>
				<SessionsQueryBuilder />
				<div className={'w-full flex flex-col'}>
					{data?.sessions_opensearch.sessions.map((s) => (
						<MinimalSessionCard
							session={s}
							key={s.secure_id}
							selected={false}
							urlParams={`?page=1`}
							autoPlaySessions={false}
							showDetailedSessionView={true}
							target={'_blank'}
							configuration={{
								countFormat: 'Short',
								datetimeFormat: 'Date and Time',
							}}
						/>
					))}
				</div>
				<Button
					onClick={() => {
						window.open(url, '_blank')
					}}
					trackingId={'ClickHighlightSessions'}
					trackProperties={{
						projectId: projectId.toString(),
						email,
						url,
					}}
				>
					All Sessions for {recipient}
				</Button>
			</div>
		</div>
	)
}

export default HighlightSessions
