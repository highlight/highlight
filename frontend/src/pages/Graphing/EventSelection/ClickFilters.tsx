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

const EVENT_NAME = 'Click'

enum ClickType {
	Text = 'Text',
	Target = 'Target',
	Selector = 'Selector',
}

enum ClickTypeFilter {
	ClickTextContent = 'clickTextContent',
	ClickTarget = 'clickTarget',
	ClickSelector = 'clickSelector',
}

const CLICK_TYPES: ClickType[] = [
	ClickType.Text,
	ClickType.Target,
	ClickType.Selector,
]

const CLICK_TYPE_TO_FILTER = {
	[ClickType.Text]: ClickTypeFilter.ClickTextContent,
	[ClickType.Target]: ClickTypeFilter.ClickTarget,
	[ClickType.Selector]: ClickTypeFilter.ClickSelector,
}

const CLICK_FILTER_TO_TYPE = {
	[ClickTypeFilter.ClickTextContent]: ClickType.Text,
	[ClickTypeFilter.ClickTarget]: ClickType.Target,
	[ClickTypeFilter.ClickSelector]: ClickType.Selector,
}

type Props = {
	initialQuery: string
	setQuery: (query: string) => void
	startDate: Date
	endDate: Date
}

export const ClickFilters: React.FC<Props> = ({
	startDate,
	endDate,
	initialQuery,
	setQuery,
}) => {
	const { projectId } = useProjectId()

	const [clickType, setClickType] = useState<ClickType>(ClickType.Text)
	const [clickTypeValue, setClickTypeValue] = useState('')
	const [clickFilters, setClickFilters] = useState('')

	// create initial click type and filters
	useEffect(() => {
		const { queryParts } = parseSearch(initialQuery)

		let foundClickType = ''
		let foundClickTypeValue = ''
		const foundFilters: string[] = []

		queryParts.forEach((part) => {
			if (
				!foundClickType &&
				!!CLICK_FILTER_TO_TYPE[part.key as ClickTypeFilter] &&
				part.operator === '='
			) {
				foundClickType =
					CLICK_FILTER_TO_TYPE[part.key as ClickTypeFilter]
				foundClickTypeValue = part.value.replace(/^["](.*)["]$/, '$1')
			} else {
				foundFilters.push(part.text)
			}
		})

		if (foundClickType) {
			setClickType(foundClickType as ClickType)
			setClickTypeValue(foundClickTypeValue)
		}

		setClickFilters(foundFilters.join(' '))
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// recreate query when clickTypeValue or filters change
	useEffect(() => {
		const queryArray = []
		if (!!clickTypeValue) {
			queryArray.push(
				`${CLICK_TYPE_TO_FILTER[clickType]}="${clickTypeValue}"`,
			)
		}
		if (!!clickFilters) {
			queryArray.push(clickFilters)
		}
		setQuery(queryArray.join(' '))
	}, [setQuery, clickTypeValue, clickFilters, clickType])

	const [clickQuery, setClickQuery] = useState('')
	const [debouncedClickQuery, setDebouncedClickQuery] = useState('')
	useDebounce(
		() => {
			setDebouncedClickQuery(clickQuery)
		},
		300,
		[clickQuery],
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
				key_name: CLICK_TYPE_TO_FILTER[clickType],
				project_id: projectId,
				date_range: {
					start_date: moment(startDate).format(TIME_FORMAT),
					end_date: moment(endDate).format(TIME_FORMAT),
				},
				query: debouncedClickQuery,
				count: 25,
				event: EVENT_NAME,
			},
		})
	}, [
		clickType,
		debouncedClickQuery,
		endDate,
		getKeyValues,
		projectId,
		startDate,
	])

	return (
		<>
			<Box display="flex" flexDirection="row" gap="4">
				<LabeledRow label="Click type" name="clickType">
					<OptionDropdown
						options={CLICK_TYPES}
						selection={clickType}
						setSelection={setClickType}
					/>
				</LabeledRow>
				<LabeledRow label={clickType} name="clickTypeValue">
					<ComboboxSelect
						label={clickType}
						value={clickTypeValue}
						valueRender={
							<Text cssClass={comboBoxStyle.comboboxText}>
								{clickTypeValue || 'All clicks'}
							</Text>
						}
						options={keyValueOptions}
						onChange={setClickTypeValue}
						onChangeQuery={setClickQuery}
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
						initialQuery={clickFilters}
						onSubmit={setClickFilters}
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
