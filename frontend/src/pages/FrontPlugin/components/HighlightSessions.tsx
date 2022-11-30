import Button from '@components/Button/Button/Button'
import Card from '@components/Card/Card'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { useGetSessionsOpenSearchQuery } from '@graph/hooks'
import SvgShareIcon from '@icons/ShareIcon'
import { useFrontContext } from '@pages/FrontPlugin/Front/FrontContext'
import EmptyCardPlaceholder from '@pages/Home/components/EmptyCardPlaceholder/EmptyCardPlaceholder'
import { EmptySessionsSearchParams } from '@pages/Sessions/EmptySessionsSearchParams'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'
import MinimalSessionCard from '@pages/Sessions/SessionsFeedV2/components/MinimalSessionCard/MinimalSessionCard'
import { getUnprocessedSessionsQuery } from '@pages/Sessions/SessionsFeedV2/components/QueryBuilder/utils/utils'
import SessionsQueryBuilder from '@pages/Sessions/SessionsFeedV2/components/SessionsQueryBuilder/SessionsQueryBuilder'
import { useParams } from '@util/react-router/useParams'
import { GetBaseURL } from '@util/window'
import moment from 'moment/moment'
import React, { useEffect, useState } from 'react'

function HighlightSessions() {
	const { setLoadingState } = useAppLoadingContext()
	const { backendSearchQuery, setSearchParams } = useSearchContext()
	const frontContext = useFrontContext()
	const { project_id } = useParams<{
		project_id: string
	}>()
	const { data, called } = useGetSessionsOpenSearchQuery({
		variables: {
			project_id,
			count: 100,
			page: 1,
			query: getUnprocessedSessionsQuery(
				backendSearchQuery?.searchQuery || '',
			),
			sort_desc: true,
		},
		skip: !backendSearchQuery,
		fetchPolicy: 'network-only',
	})
	const [dateRange, setDateRange] = useState<{
		start?: moment.Moment
		end?: moment.Moment
	}>({
		start: backendSearchQuery?.startDate,
		end: backendSearchQuery?.endDate,
	})

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
		setDateRange({
			start: backendSearchQuery?.startDate,
			end: backendSearchQuery?.endDate,
		})
	}, [backendSearchQuery?.startDate, backendSearchQuery?.endDate])

	useEffect(() => {
		if (frontContext?.type === 'singleConversation') {
			frontContext.listMessages().then((response) => {
				if (response.results.length > 0) {
					const latestMessageIndex = response.results.length - 1
					const start = moment(response.results[0].date)
					// offset by 7 days
					start.add(-7, 'days')
					const end = moment(
						response.results[latestMessageIndex].date,
					)
					const query = JSON.stringify({
						isAnd: true,
						rules: [
							['user_email', 'contains', email],
							[
								'custom_created_at',
								'between_date',
								`${start.format()}_${end.format()}`,
							],
						],
					})
					setDateRange({
						start,
						end,
					})
					setSearchParams({
						...EmptySessionsSearchParams,
						query,
					})
				}
			})
		}
	}, [frontContext])

	useEffect(() => {
		if (called) {
			setLoadingState(AppLoadingState.LOADED)
		}
	}, [called])

	const qs = encodeURI(
		`?query=and` +
			(email ? `||user_email,contains,${email}` : '') +
			`||custom_created_at,between_date,${dateRange.start?.format()}_${dateRange.end?.format()}`,
	)
	const url = `${GetBaseURL()}/${project_id}/sessions${qs}`

	return (
		<div className={'flex w-full flex-row justify-center p-2'}>
			<div className={'flex w-full flex-col gap-2'}>
				<SessionsQueryBuilder />
				<div className={'flex w-full flex-col'}>
					{data?.sessions_opensearch.sessions.map((s) => (
						<MinimalSessionCard
							compact
							session={s}
							key={s.secure_id}
							selected={false}
							urlParams={qs}
							autoPlaySessions={false}
							showDetailedSessionView={true}
							target={'_blank'}
							configuration={{
								countFormat: 'Short',
								datetimeFormat: 'Date and Time',
							}}
						/>
					))}
					{data?.sessions_opensearch.sessions.length === 0 && (
						<Card className={'m-0 px-4 py-0'}>
							<EmptyCardPlaceholder
								compact
								message={`No sessions matched the given filters. Please try adjusting the date range.`}
								title={'No sessions found 😢'}
							/>
						</Card>
					)}
				</div>
				<Button
					className={'flex w-full justify-center gap-2 align-middle'}
					onClick={() => {
						window.open(url, '_blank')
					}}
					trackingId={'ClickHighlightSessions'}
					trackProperties={{
						projectId: project_id.toString(),
						email,
						url,
					}}
				>
					<span>Custom Search for {recipient}</span>
					<SvgShareIcon />
				</Button>
			</div>
		</div>
	)
}

export default HighlightSessions
