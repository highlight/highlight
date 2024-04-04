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
	DEFAULT_TIME_PRESETS,
	presetStartDate,
} from '@highlight-run/ui/components'
import { ErrorFeedHistogram } from '@pages/ErrorsV2/ErrorFeedHistogram/ErrorFeedHistogram'
import { useGlobalContext } from '@routers/ProjectRouter/context/GlobalContext'
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'

import { SearchForm } from '@/components/Search/SearchForm/SearchForm'
import { useSearchTime } from '@/hooks/useSearchTime'
import { ErrorFeedCard } from '@/pages/ErrorsV2/ErrorFeedCard/ErrorFeedCard'
import usePlayerConfiguration from '@/pages/Player/PlayerHook/utils/usePlayerConfiguration'
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
}: SearchPanelProps) => {
	const { showLeftPanel } = usePlayerConfiguration()
	const { showBanner } = useGlobalContext()
	const textAreaRef = useRef<HTMLTextAreaElement | null>(null)

	const {
		startDate,
		endDate,
		selectedPreset,
		updateSearchTime,
		rebaseSearchTime,
	} = useSearchTime({
		presets: DEFAULT_TIME_PRESETS,
		initialPreset: DEFAULT_TIME_PRESETS[5],
	})

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

	return (
		<Box
			display="flex"
			flex="fixed"
			flexDirection="column"
			borderRight="secondary"
			position="relative"
			cssClass={clsx(style.searchPanel, {
				[style.searchPanelHidden]: !showLeftPanel,
				[style.searchPanelWithBanner]: showBanner,
			})}
			background="n2"
		>
			<SearchForm
				initialQuery={query}
				onFormSubmit={setQuery}
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
				hideCreateAlert
				isPanelView
			/>
			{showHistogram && (
				<Box borderBottom="secondary" paddingBottom="8" px="8">
					<ErrorFeedHistogram
						histogramBucketSize={histogramBucketSize}
					/>
				</Box>
			)}
			<AdditionalFeedResults
				more={moreErrors}
				type="errors"
				onClick={() => {
					resetMoreErrors()
					rebaseSearchTime()
				}}
			/>
			<Box
				paddingTop="4"
				padding="8"
				overflowX="hidden"
				overflowY="auto"
				cssClass={[style.content, styledVerticalScrollbar]}
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
