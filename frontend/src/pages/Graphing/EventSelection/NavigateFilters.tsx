import _ from 'lodash'
import moment from 'moment'
import React, { useEffect, useMemo, useState } from 'react'
import { useDebounce } from 'react-use'

import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'
import { LabeledRow } from '@/pages/Graphing/LabeledRow'
import { Box, ComboboxSelect, Text } from '@highlight-run/ui/components'
import { ProductType } from '@/graph/generated/schemas'
import { useGetKeyValuesLazyQuery } from '@/graph/generated/hooks'
import { useProjectId } from '@/hooks/useProjectId'
import { SearchContext } from '@/components/Search/SearchContext'
import { Search } from '@/components/Search/SearchForm/SearchForm'

import * as comboBoxStyle from '../Combobox/styles.css'
import { OptionDropdown } from '@/pages/Graphing/OptionDropdown'
import { parseSearch } from '@/components/Search/utils'

const EVENT_NAME = 'Navigate'

enum NavigateType {
	Visited = 'Visited',
	Reloaded = 'Reloaded',
	LandingPage = 'Landing Page',
	ExitPage = 'Exit Page',
}

enum NavigateTypeFilter {
	Url = 'url',
	Reload = 'reload',
	LandingPage = 'landing_page',
	ExitPage = 'exit_page',
}

const NAVIGATE_TYPES: NavigateType[] = [
	NavigateType.Visited,
	NavigateType.Reloaded,
	NavigateType.LandingPage,
	NavigateType.ExitPage,
]

const NAVIGATE_TYPE_TO_FILTER = {
	[NavigateType.Visited]: NavigateTypeFilter.Url,
	[NavigateType.Reloaded]: NavigateTypeFilter.Reload,
	[NavigateType.LandingPage]: NavigateTypeFilter.LandingPage,
	[NavigateType.ExitPage]: NavigateTypeFilter.ExitPage,
}

const NAVIGATE_FILTER_TO_TYPE = {
	[NavigateTypeFilter.Url]: NavigateType.Visited,
	[NavigateTypeFilter.Reload]: NavigateType.Reloaded,
	[NavigateTypeFilter.LandingPage]: NavigateType.LandingPage,
	[NavigateTypeFilter.ExitPage]: NavigateType.ExitPage,
}

type Props = {
	initialQuery: string
	setQuery: (query: string) => void
	startDate: Date
	endDate: Date
}

export const NavigateFilters: React.FC<Props> = ({
	startDate,
	endDate,
	initialQuery,
	setQuery,
}) => {
	const { projectId } = useProjectId()

	const [navigateType, setNavigateType] = useState<NavigateType>(
		NavigateType.Visited,
	)
	const [navigateUrl, setNavigateUrl] = useState('')
	const [navigateFilters, setNavigateFilters] = useState('')

	// create initial navigate type and filters
	useEffect(() => {
		const { queryParts } = parseSearch(initialQuery)

		let foundNavigateType = ''
		let foundNavigateUrl = ''
		const foundFilters: string[] = []

		queryParts.forEach((part) => {
			if (
				!foundNavigateType &&
				!!NAVIGATE_FILTER_TO_TYPE[part.key as NavigateTypeFilter] &&
				part.operator === '='
			) {
				foundNavigateType =
					NAVIGATE_FILTER_TO_TYPE[part.key as NavigateTypeFilter]
				foundNavigateUrl = part.value.replace(/^["](.*)["]$/, '$1')
			} else {
				foundFilters.push(part.text)
			}
		})

		if (foundNavigateType) {
			setNavigateType(foundNavigateType as NavigateType)
			setNavigateUrl(foundNavigateUrl)
		}

		setNavigateFilters(foundFilters.join(' '))
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// recreate query when navigateTypeValue or filters change
	useEffect(() => {
		const queryArray = []
		if (!!navigateUrl) {
			queryArray.push(
				`${NAVIGATE_TYPE_TO_FILTER[navigateType]}="${navigateUrl}"`,
			)
		}
		if (!!navigateFilters) {
			queryArray.push(navigateFilters)
		}
		setQuery(queryArray.join(' '))
	}, [setQuery, navigateUrl, navigateFilters, navigateType])

	const [navigateQuery, setNavigateQuery] = useState('')
	const [debouncedNavigateQuery, setDebouncedNavigateQuery] = useState('')
	useDebounce(
		() => {
			setDebouncedNavigateQuery(navigateQuery)
		},
		300,
		[navigateQuery],
	)

	const [getKeyValues, { data }] = useGetKeyValuesLazyQuery()
	const keyValueOptions = useMemo(() => {
		const searchKeys =
			_.chain(data?.key_values || [])
				.uniq()
				.value() ?? []

		return searchKeys.map((o) => ({
			key: o,
			render: o,
		}))
	}, [data?.key_values])

	useEffect(() => {
		getKeyValues({
			variables: {
				product_type: ProductType.Events,
				key_name: NAVIGATE_TYPE_TO_FILTER[navigateType],
				project_id: projectId,
				date_range: {
					start_date: moment(startDate).format(TIME_FORMAT),
					end_date: moment(endDate).format(TIME_FORMAT),
				},
				query: debouncedNavigateQuery,
				count: 25,
				event: EVENT_NAME,
			},
		})
	}, [
		navigateType,
		debouncedNavigateQuery,
		endDate,
		getKeyValues,
		projectId,
		startDate,
	])

	return (
		<>
			<Box display="flex" flexDirection="row" gap="4">
				<LabeledRow label="Navigate type" name="navigateType">
					<OptionDropdown
						options={NAVIGATE_TYPES}
						selection={navigateType}
						setSelection={setNavigateType}
					/>
				</LabeledRow>
				<LabeledRow label="Url" name="navigateUrl">
					<ComboboxSelect
						label="Url"
						value={navigateUrl}
						valueRender={
							<Text cssClass={comboBoxStyle.comboboxText}>
								{navigateUrl || 'All urls'}
							</Text>
						}
						options={keyValueOptions}
						onChange={setNavigateUrl}
						onChangeQuery={setNavigateQuery}
						cssClass={comboBoxStyle.combobox}
						wrapperCssClass={comboBoxStyle.comboboxWrapper}
						popoverCssClass={comboBoxStyle.comboboxPopover}
						queryPlaceholder="Filter..."
						creatableRender={(value) => (
							<Text cssClass={comboBoxStyle.comboboxText}>
								{value}
							</Text>
						)}
						clearable
					/>
				</LabeledRow>
			</Box>
			<LabeledRow label="Filters" name="query">
				<Box border="divider" width="full" borderRadius="6">
					<SearchContext
						initialQuery={navigateFilters}
						onSubmit={setNavigateFilters}
					>
						<Search
							startDate={startDate}
							endDate={endDate}
							productType={ProductType.Events}
							event={EVENT_NAME}
							hideIcon
						/>
					</SearchContext>
				</Box>
			</LabeledRow>
		</>
	)
}
