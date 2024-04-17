import {
	EmptySearchResults,
	SearchResultsKind,
} from '@components/EmptySearchResults/EmptySearchResults'
import { AdditionalFeedResults } from '@components/FeedResults/FeedResults'
import LoadingBox from '@components/LoadingBox'
import SearchPagination, {
	PAGE_SIZE,
} from '@components/SearchPagination/SearchPagination'
import { DateHistogramBucketSize, ProductType } from '@graph/schemas'
import {
	Box,
	ButtonIcon,
	DateRangePreset,
	DEFAULT_TIME_PRESETS,
	IconSolidLogout,
	presetStartDate,
} from '@highlight-run/ui/components'
import { ErrorFeedHistogram } from '@pages/ErrorsV2/ErrorFeedHistogram/ErrorFeedHistogram'
import { useGlobalContext } from '@routers/ProjectRouter/context/GlobalContext'
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'

import { SearchContext } from '@/components/Search/SearchContext'
import { SearchForm } from '@/components/Search/SearchForm/SearchForm'
import { ErrorFeedCard } from '@/pages/ErrorsV2/ErrorFeedCard/ErrorFeedCard'
import { useErrorPageNavigation } from '@/pages/ErrorsV2/ErrorsV2'
import { OverageCard } from '@/pages/Sessions/SessionsFeedV3/OverageCard/OverageCard'
import { styledVerticalScrollbar } from '@/style/common.css'

import * as style from './SearchPanel.css'

type SearchPanelProps = {
	query: string
	setQuery: (query: string) => void
	page: number
	setPage: (page: number) => void
	errorGroups: any[]
	loading: boolean
	moreErrors: number
	resetMoreErrors: () => void
	totalCount: number
	histogramBucketSize: DateHistogramBucketSize
	updateSearchTime: (start: Date, end: Date) => void
	rebaseSearchTime: () => void
	startDate: Date
	endDate: Date
	selectedPreset?: DateRangePreset
}

export const SearchPanel = ({
	query,
	setQuery,
	page,
	setPage,
	errorGroups,
	loading,
	moreErrors,
	resetMoreErrors,
	totalCount,
	histogramBucketSize,
	updateSearchTime,
	rebaseSearchTime,
	startDate,
	endDate,
	selectedPreset,
}: SearchPanelProps) => {
	const { setShowLeftPanel } = useErrorPageNavigation()
	const { showBanner } = useGlobalContext()
	const textAreaRef = useRef<HTMLTextAreaElement | null>(null)

	const showHistogram = totalCount >= 0

	const [, setSyncButtonDisabled] = useState<boolean>(false)

	useEffect(() => {
		if (!loading) {
			const timer = setTimeout(() => {
				setSyncButtonDisabled(false)
			}, 3000)
			return () => {
				clearTimeout(timer)
			}
		} else {
			setSyncButtonDisabled(true)
		}
	}, [loading])

	const actions = () => {
		return (
			<Box marginLeft="auto" display="flex" gap="0">
				<ButtonIcon
					kind="secondary"
					size="small"
					shape="square"
					emphasis="low"
					icon={<IconSolidLogout size={14} />}
					onClick={() => setShowLeftPanel(false)}
				/>
			</Box>
		)
	}

	return (
		<Box
			display="flex"
			flex="fixed"
			flexDirection="column"
			borderRight="secondary"
			position="relative"
			cssClass={clsx(style.searchPanel, {
				[style.searchPanelWithBanner]: showBanner,
			})}
			background="n2"
		>
			<SearchContext initialQuery={query} onSubmit={setQuery}>
				<SearchForm
					startDate={startDate}
					endDate={endDate}
					onDatesChange={updateSearchTime}
					presets={DEFAULT_TIME_PRESETS}
					minDate={presetStartDate(DEFAULT_TIME_PRESETS[5])}
					selectedPreset={selectedPreset}
					productType={ProductType.Errors}
					timeMode="fixed-range"
					savedSegmentType="Error"
					textAreaRef={textAreaRef}
					actions={actions}
					resultCount={totalCount}
					loading={loading}
					hideCreateAlert
					isPanelView
				/>
			</SearchContext>
			{showHistogram && (
				<Box borderBottom="secondary" paddingBottom="8" px="8">
					<ErrorFeedHistogram
						query={query}
						histogramBucketSize={histogramBucketSize}
						startDate={startDate}
						endDate={endDate}
						updateSearchTime={updateSearchTime}
					/>
				</Box>
			)}
			<AdditionalFeedResults
				more={moreErrors}
				type="errors"
				onClick={() => {
					resetMoreErrors()
					setPage(1)
					rebaseSearchTime()
				}}
			/>
			<Box
				paddingTop="4"
				padding="8"
				overflowX="hidden"
				overflowY="auto"
				height="full"
				cssClass={styledVerticalScrollbar}
			>
				{loading ? (
					<LoadingBox />
				) : (
					<>
						<OverageCard productType={ProductType.Errors} />
						{totalCount === 0 || !errorGroups ? (
							<EmptySearchResults
								kind={SearchResultsKind.Errors}
							/>
						) : (
							errorGroups.map((eg) => (
								<ErrorFeedCard
									key={eg.secure_id}
									errorGroup={eg}
								/>
							))
						)}
					</>
				)}
			</Box>
			<SearchPagination
				page={page}
				setPage={setPage}
				totalCount={totalCount ?? 0}
				pageSize={PAGE_SIZE}
			/>
		</Box>
	)
}
