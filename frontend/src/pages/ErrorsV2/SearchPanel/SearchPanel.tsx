import {
	EmptySearchResults,
	SearchResultsKind,
} from '@components/EmptySearchResults/EmptySearchResults'
import { AdditionalFeedResults } from '@components/FeedResults/FeedResults'
import LoadingBox from '@components/LoadingBox'
import SearchPagination, {
	PAGE_SIZE,
} from '@components/SearchPagination/SearchPagination'
import { ProductType, SavedSegmentEntityType } from '@graph/schemas'
import { Box, ButtonIcon, IconSolidLogout } from '@highlight-run/ui/components'
import { ErrorFeedHistogram } from '@pages/ErrorsV2/ErrorFeedHistogram/ErrorFeedHistogram'
import { useGlobalContext } from '@routers/ProjectRouter/context/GlobalContext'
import clsx from 'clsx'
import { useEffect, useState } from 'react'

import { useSearchContext } from '@/components/Search/SearchContext'
import { useRetentionPresets } from '@/components/Search/SearchForm/hooks'
import { SearchForm } from '@/components/Search/SearchForm/SearchForm'
import { useGetWorkspaceSettingsQuery } from '@/graph/generated/hooks'
import useFeatureFlag, { Feature } from '@/hooks/useFeatureFlag/useFeatureFlag'
import { ErrorFeedCard } from '@/pages/ErrorsV2/ErrorFeedCard/ErrorFeedCard'
import { useErrorPageNavigation } from '@/pages/ErrorsV2/ErrorsV2'
import { OverageCard } from '@/pages/Sessions/SessionsFeedV3/OverageCard/OverageCard'
import { useApplicationContext } from '@/routers/AppRouter/context/ApplicationContext'
import { styledVerticalScrollbar } from '@/style/common.css'

import * as style from './SearchPanel.css'

export const SearchPanel = () => {
	const { currentWorkspace } = useApplicationContext()
	const { setShowLeftPanel } = useErrorPageNavigation()
	const { showBanner } = useGlobalContext()
	const aiQueryBuilderFlag = useFeatureFlag(Feature.AiQueryBuilder)
	const {
		results: errorGroups,
		totalCount,
		moreResults: moreErrors,
		resetMoreResults: resetMoreErrors,
		pollingExpired,
		loading,
		page,
		setPage,
		startDate,
		endDate,
		selectedPreset,
		rebaseSearchTime,
		updateSearchTime,
	} = useSearchContext()

	const showHistogram = totalCount >= 0

	const [, setSyncButtonDisabled] = useState<boolean>(false)

	const { data: workspaceSettings } = useGetWorkspaceSettingsQuery({
		variables: { workspace_id: String(currentWorkspace?.id) },
		skip: !currentWorkspace?.id || !aiQueryBuilderFlag,
	})

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

	const { presets, minDate } = useRetentionPresets(ProductType.Errors)

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
			<SearchForm
				startDate={startDate!}
				endDate={endDate!}
				onDatesChange={updateSearchTime!}
				presets={presets}
				minDate={minDate}
				selectedPreset={selectedPreset}
				productType={ProductType.Errors}
				timeMode="fixed-range"
				savedSegmentType={SavedSegmentEntityType.Error}
				actions={actions}
				resultCount={totalCount}
				loading={loading}
				enableAIMode={
					workspaceSettings?.workspaceSettings?.ai_query_builder
				}
				aiSupportedSearch={aiQueryBuilderFlag}
				hideCreateAlert
				isPanelView
			/>
			{showHistogram && (
				<Box borderBottom="secondary" paddingBottom="8" px="8">
					<ErrorFeedHistogram />
				</Box>
			)}
			<AdditionalFeedResults
				maxResults={PAGE_SIZE}
				more={moreErrors}
				type="errors"
				onClick={() => {
					resetMoreErrors()
					setPage(1)
					rebaseSearchTime!()
				}}
				pollingExpired={pollingExpired}
			/>
			<Box
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
				loading={loading}
			/>
		</Box>
	)
}
