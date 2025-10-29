import { Box } from '@highlight-run/ui/components'
import React, { useCallback, useMemo } from 'react'
import { Helmet } from 'react-helmet'
import { StringParam, useQueryParam, withDefault } from 'use-query-params'

import { AiSuggestion, SearchContext } from '@/components/Search/SearchContext'
import { useRetentionPresets } from '@/components/Search/SearchForm/hooks'
import {
	PAGE_PARAM,
	START_PAGE,
} from '@/components/SearchPagination/SearchPagination'
import {
	useGetAiQuerySuggestionLazyQuery,
	useGetWorkspaceSettingsQuery,
} from '@/graph/generated/hooks'
import { ProductType } from '@/graph/generated/schemas'
import { useSearchTime } from '@/hooks/useSearchTime'
import { useSessionParams } from '@/pages/Sessions/utils'
import { useApplicationContext } from '@/routers/AppRouter/context/ApplicationContext'

import { UsersAnalyticsView } from './UsersAnalyticsView'

export const UsersAnalyticsPage: React.FC = () => {
	const { projectId } = useSessionParams()
	const { currentWorkspace } = useApplicationContext()
	const [query, setQuery] = useQueryParam(
		'query',
		withDefault(StringParam, ''),
	)
	const [page, setPage] = useQueryParam('page', PAGE_PARAM)
	const [aiMode, setAiMode] = React.useState(false)

	const { data: workspaceSettings } = useGetWorkspaceSettingsQuery({
		variables: { workspace_id: String(currentWorkspace?.id) },
		skip: !currentWorkspace?.id,
	})

	const { presets } = useRetentionPresets(ProductType.Sessions)
	const initialPreset = presets[5] ?? presets.at(-1)

	const searchTimeContext = useSearchTime({
		presets: presets,
		initialPreset: initialPreset,
	})

	const [
		getAiQuerySuggestion,
		{ data: aiData, error: aiError, loading: aiLoading },
	] = useGetAiQuerySuggestionLazyQuery({
		fetchPolicy: 'network-only',
	})

	const handleSubmit = useCallback(
		(newQuery: string) => {
			setQuery(newQuery)
			setPage(START_PAGE)
		},
		[setPage, setQuery],
	)

	const onAiSubmit = (aiQuery: string) => {
		if (projectId && aiQuery.length) {
			getAiQuerySuggestion({
				variables: {
					query: aiQuery,
					project_id: projectId,
					product_type: ProductType.Sessions,
					time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
				},
			})
		}
	}

	const aiSuggestion = useMemo(() => {
		const { query, date_range = {} } = aiData?.ai_query_suggestion ?? {}

		return {
			query,
			dateRange: {
				startDate: date_range.start_date
					? new Date(date_range.start_date)
					: undefined,
				endDate: date_range.end_date
					? new Date(date_range.end_date)
					: undefined,
			},
		} as AiSuggestion
	}, [aiData])

	return (
		<SearchContext
			initialQuery={query}
			onSubmit={handleSubmit}
			loading={false}
			results={[]}
			totalCount={0}
			moreResults={0}
			resetMoreResults={() => {}}
			page={page}
			setPage={setPage}
			pollingExpired={false}
			aiMode={aiMode}
			setAiMode={setAiMode}
			onAiSubmit={onAiSubmit}
			aiSuggestion={aiSuggestion}
			aiSuggestionLoading={aiLoading}
			aiSuggestionError={aiError}
			{...searchTimeContext}
		>
			<Helmet>
				<title>User Analytics</title>
			</Helmet>
			<Box
				display="flex"
				flexDirection="column"
				height="full"
				width="full"
				background="n2"
			>
				<UsersAnalyticsView />
			</Box>
		</SearchContext>
	)
}
