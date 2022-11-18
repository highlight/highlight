import { SearchEmptyState } from '@components/SearchEmptyState/SearchEmptyState'
import SearchPagination, {
	DEFAULT_PAGE_SIZE,
	START_PAGE,
} from '@components/SearchPagination/SearchPagination'
import { Skeleton } from '@components/Skeleton/Skeleton'
import { useGetErrorGroupsOpenSearchQuery } from '@graph/hooks'
import { ErrorGroup, ErrorResults, Maybe } from '@graph/schemas'
import {
	Box,
	Button,
	ButtonIcon,
	IconChevronDown,
	IconClock,
	IconLogout,
	IconRefresh,
	Text,
} from '@highlight-run/ui'
import ErrorQueryBuilderV1 from '@pages/Error/components/ErrorQueryBuilder/ErrorQueryBuilder'
import useErrorPageConfiguration from '@pages/Error/utils/ErrorPageUIConfiguration'
import { useErrorSearchContext } from '@pages/Errors/ErrorSearchContext/ErrorSearchContext'
import { ErrorFeedCard } from '@pages/ErrorsV2/ErrorFeedCard/ErrorFeedCard'
import ErrorFeedHistogram from '@pages/ErrorsV2/ErrorFeedHistogram/ErrorFeedHistogram'
import ErrorQueryBuilder from '@pages/ErrorsV2/ErrorQueryBuilder/ErrorQueryBuilder'
import { gqlSanitize } from '@util/gqlSanitize'
import { useParams } from '@util/react-router/useParams'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { useLocalStorage } from 'react-use'

import * as style from './SearchPanel.css'

const PAGE_SIZE = DEFAULT_PAGE_SIZE

const SearchPanel = () => {
	const { showLeftPanel, setShowLeftPanel } = useErrorPageConfiguration()
	const {
		backendSearchQuery,
		page,
		setPage,
		searchResultsLoading,
		setSearchResultsLoading,
		update,
	} = useErrorSearchContext()

	useEffect(() => {
		if (backendSearchQuery) {
			setSearchResultsLoading(true)
		}
	}, [backendSearchQuery, page, setSearchResultsLoading])

	const { project_id: projectId } = useParams<{ project_id: string }>()

	const [$errorCount, setErrorCount] = useLocalStorage<number>(
		`errorsCount-project-${projectId}`,
		0,
	)

	const errorCount = $errorCount ?? 0
	const useCachedErrors = errorCount > PAGE_SIZE

	const [fetchedData, setFetchedData] = useState<ErrorResults>({
		error_groups: [],
		totalCount: 0,
	})

	useGetErrorGroupsOpenSearchQuery({
		variables: {
			query: backendSearchQuery?.searchQuery || '',
			count: PAGE_SIZE,
			page: page && page > 0 ? page : 1,
			project_id: projectId,
		},
		onCompleted: (r) => {
			const results = r?.error_groups_opensearch
			if (results) {
				setFetchedData(gqlSanitize(results))
				setErrorCount(results.totalCount)
			}
			setSearchResultsLoading(false)
		},
		skip: !backendSearchQuery,
		fetchPolicy: useCachedErrors ? 'cache-first' : 'no-cache',
	})

	const showHistogram = searchResultsLoading || errorCount > 0

	const [syncButtonDisabled, setSyncButtonDisabled] = useState<boolean>(false)

	useEffect(() => {
		if (searchResultsLoading === false) {
			const timer = setTimeout(() => {
				setSyncButtonDisabled(false)
			}, 5000)
			return () => {
				clearTimeout(timer)
			}
		} else {
			setSyncButtonDisabled(true)
		}
	}, [searchResultsLoading])

	return (
		<Box
			display="flex"
			flex="fixed"
			flexDirection="column"
			borderRight="neutral"
			position="relative"
			cssClass={clsx(style.searchPanel, {
				[style.searchPanelHidden]: !showLeftPanel,
			})}
			background="neutral50"
		>
			<Box
				display="flex"
				alignItems="center"
				px="12"
				borderBottom="neutral"
				cssClass={style.controlBar}
			>
				<Box display="flex" gap="8" alignItems="center">
					<Button
						kind="secondary"
						size="small"
						emphasis="high"
						iconLeft={<IconClock size={14} />}
						iconRight={<IconChevronDown size={14} />}
					/>
					<Text
						size="xSmall"
						weight="medium"
						color="neutral300"
						userSelect="none"
					>
						Last 30 days
					</Text>
				</Box>
				<Box marginLeft="auto" display="flex" gap="4">
					<ButtonIcon
						kind="secondary"
						size="small"
						shape="square"
						emphasis="low"
						icon={<IconRefresh size={14} />}
						disabled={syncButtonDisabled}
						onClick={update}
					/>
					<ButtonIcon
						kind="secondary"
						size="small"
						shape="square"
						emphasis="medium"
						icon={<IconLogout size={14} />}
						onClick={() => setShowLeftPanel(false)}
					/>
				</Box>
			</Box>
			<Box p="8">
				<ErrorQueryBuilder />
			</Box>
			<Box py="6" px="8">
				<ErrorQueryBuilderV1 />
			</Box>
			{showHistogram && (
				<Box
					borderBottom="neutral"
					paddingTop="10"
					paddingBottom="12"
					px="8"
				>
					<ErrorFeedHistogram useCachedErrors={useCachedErrors} />
				</Box>
			)}
			<Box
				padding="6"
				overflowX="hidden"
				overflowY="auto"
				cssClass={style.content}
			>
				{searchResultsLoading ? (
					<Skeleton
						height={80}
						count={3}
						style={{
							borderRadius: 8,
							marginBottom: 2,
						}}
					/>
				) : (
					<>
						{!fetchedData.error_groups.length ? (
							<SearchEmptyState item="errors" />
						) : (
							fetchedData.error_groups?.map(
								(eg: Maybe<ErrorGroup>, ind: number) => (
									<ErrorFeedCard
										key={ind}
										errorGroup={eg}
										urlParams={`?page=${
											page || START_PAGE
										}`}
									/>
								),
							)
						)}
					</>
				)}
			</Box>
			<SearchPagination
				page={page}
				setPage={setPage}
				totalCount={errorCount}
				pageSize={PAGE_SIZE}
			/>
		</Box>
	)
}

export default SearchPanel
