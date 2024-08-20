import Button from '@components/Button/Button/Button'
import Card from '@components/Card/Card'
import { useSearchContext } from '@components/Search/SearchContext'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { useGetSessionsQuery } from '@graph/hooks'
import SvgShareIcon from '@icons/ShareIcon'
import { useFrontContext } from '@pages/FrontPlugin/Front/FrontContext'
import EmptyCardPlaceholder from '@pages/Home/components/EmptyCardPlaceholder/EmptyCardPlaceholder'
import MinimalSessionCard from '@pages/Sessions/SessionsFeedV3/MinimalSessionCard/MinimalSessionCard'
import { useParams } from '@util/react-router/useParams'
import { GetBaseURL } from '@util/window'
import moment from 'moment/moment'
import { useEffect } from 'react'

import { useRetentionPresets } from '@/components/Search/SearchForm/hooks'
import { SearchForm } from '@/components/Search/SearchForm/SearchForm'
import { ProductType, SavedSegmentEntityType } from '@/graph/generated/schemas'

export function HighlightSessions() {
	const { setLoadingState } = useAppLoadingContext()
	const {
		loading,
		setQuery,
		query,
		totalCount,
		startDate,
		endDate,
		selectedPreset,
		updateSearchTime,
	} = useSearchContext()
	const frontContext = useFrontContext()
	const { project_id } = useParams<{
		project_id: string
	}>()

	const { data, called } = useGetSessionsQuery({
		variables: {
			project_id: project_id!,
			count: 100,
			page: 1,
			params: {
				query,
				date_range: {
					start_date: startDate!.toISOString(),
					end_date: endDate!.toISOString(),
				},
			},
			sort_desc: true,
		},
		skip: !project_id,
		fetchPolicy: 'network-only',
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
						rules: [['user_email', 'contains', email]],
					})

					updateSearchTime!(start.toDate(), end.toDate())
					setQuery(query)
				}
			})
		}
	}, [email, frontContext, setQuery, updateSearchTime])

	useEffect(() => {
		if (called) {
			setLoadingState(AppLoadingState.LOADED)
		}
	}, [called, setLoadingState])

	const qs = encodeURI(
		`?end_date=${startDate!.toISOString()}&start_date=${endDate!.toISOString()}&query=` +
			(email ? `email=*${email}*` : ''),
	)
	const url = `${GetBaseURL()}/${project_id}/sessions${qs}`

	const { presets, minDate } = useRetentionPresets(ProductType.Sessions)

	return (
		<div className="flex w-full flex-row justify-center p-2">
			<div className="flex w-full flex-col gap-2">
				<SearchForm
					startDate={startDate!}
					endDate={endDate!}
					onDatesChange={updateSearchTime!}
					presets={presets}
					minDate={minDate}
					selectedPreset={selectedPreset}
					productType={ProductType.Sessions}
					timeMode="fixed-range"
					savedSegmentType={SavedSegmentEntityType.Session}
					resultCount={totalCount}
					loading={loading}
					hideCreateAlert
					isPanelView
				/>
				<div className="flex w-full flex-col">
					{data?.sessions.sessions.map((s) => (
						<MinimalSessionCard
							compact
							session={{
								...s,
								payload_updated_at: new Date().toISOString(),
							}}
							key={s.secure_id}
							selected={false}
							urlParams={qs}
							autoPlaySessions={false}
							showDetailedSessionView={true}
							target="_blank"
							configuration={{
								countFormat: 'Short',
								datetimeFormat: 'Date and Time',
							}}
						/>
					))}
					{data?.sessions.sessions.length === 0 && (
						<Card className="m-0 px-4 py-0">
							<EmptyCardPlaceholder
								compact
								message="No sessions matched the given filters. Please try adjusting the date range."
								title="No sessions found 😢"
							/>
						</Card>
					)}
				</div>
				<Button
					className="flex w-full justify-center gap-2 align-middle"
					onClick={() => {
						window.open(url, '_blank')
					}}
					trackingId="ClickHighlightSessions"
					trackProperties={{
						projectId: project_id?.toString() ?? '',
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
