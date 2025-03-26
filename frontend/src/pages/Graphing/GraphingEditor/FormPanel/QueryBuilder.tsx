import {
	Box,
	Button,
	ButtonIcon,
	IconSolidX,
	Stack,
} from '@highlight-run/ui/components'
import React, { useCallback, useMemo } from 'react'

import { SearchContext } from '@/components/Search/SearchContext'
import { Search } from '@/components/Search/SearchForm/SearchForm'

import { MetricAggregator, ProductType } from '@/graph/generated/schemas'
import { LabeledRow } from '@/pages/Graphing/LabeledRow'
import { OptionDropdown } from '@/pages/Graphing/OptionDropdown'
import { EventSteps } from '@pages/Graphing/EventSelection/EventSteps'
import { EventSelection } from '@pages/Graphing/EventSelection'
import { useGraphingEditorContext } from '@/pages/Graphing/GraphingEditor/GraphingEditorContext'
import { Combobox } from '@/pages/Graphing/Combobox'
import {
	FUNCTION_TYPE_OPTIONS,
	PRODUCT_OPTIONS,
} from '@pages/Graphing/constants'

type Props = {
	isPreview: boolean
	startDate: Date
	endDate: Date
	searchOptionsConfig: any
	variableKeys: string[]
}

export const QueryBuilder: React.FC<Props> = ({
	isPreview,
	startDate,
	endDate,
	searchOptionsConfig,
	variableKeys,
}) => {
	const {
		settings,
		setProductType,
		setQuery,
		setExpressions,
		setFunnelSteps,
	} = useGraphingEditorContext()

	const productOptions = useMemo(() => {
		if (settings.viewType === 'Funnel chart') {
			return PRODUCT_OPTIONS.filter((p) => p.value === ProductType.Events)
		}

		return PRODUCT_OPTIONS
	}, [settings.viewType])

	const handleFunctionTypeChange = useCallback(
		(i: number) => (aggregator: MetricAggregator) => {
			setExpressions((expressions) => {
				const copy = [...expressions]
				copy[i].aggregator = aggregator

				if (aggregator === MetricAggregator.Count) {
					copy[i].column = ''
				}

				return copy
			})
		},
		[setExpressions],
	)

	const handleFunctionColumnChange = useCallback(
		(i: number) => (column: string) => {
			setExpressions((expressions) => {
				const copy = [...expressions]
				copy[i].column = column
				return copy
			})
		},
		[setExpressions],
	)

	return (
		<>
			<LabeledRow
				label="Source"
				name="source"
				tooltip="The resource being queried, one of the five highlight.io resources."
			>
				<OptionDropdown<ProductType>
					options={productOptions}
					selection={settings.productType}
					setSelection={(s) => {
						s !== settings.productType && setProductType(s)
					}}
					disabled={isPreview}
				/>
			</LabeledRow>
			{settings.productType === ProductType.Events ? (
				settings.viewType === 'Funnel chart' ? (
					<EventSteps
						steps={settings.funnelSteps}
						setSteps={setFunnelSteps}
						startDate={startDate}
						endDate={endDate}
						// disabled={isPreview}
					/>
				) : (
					<EventSelection
						initialQuery={settings.query}
						setQuery={setQuery}
						startDate={startDate}
						endDate={endDate}
						// disabled={isPreview}
					/>
				)
			) : (
				<LabeledRow
					label="Filters"
					name="query"
					tooltip="The search query used to filter which data points are included before aggregating."
				>
					<Box border="divider" width="full" borderRadius="6">
						<SearchContext
							initialQuery={settings.query}
							onSubmit={setQuery}
							disabled={isPreview}
						>
							<Search
								startDate={new Date(startDate)}
								endDate={new Date(endDate)}
								productType={settings.productType}
								hideIcon
								defaultValueOptions={variableKeys}
							/>
						</SearchContext>
					</Box>
				</LabeledRow>
			)}
			<LabeledRow
				label="Function"
				name="function"
				tooltip="Determines how data points are aggregated. If the function requires a numeric field as input, one can be chosen."
			>
				<Stack width="full" gap="12">
					{settings.expressions.map((e, i) => (
						<Stack
							direction="row"
							width="full"
							gap="4"
							key={`${e.aggregator}:${e.column}:${i}`}
						>
							<OptionDropdown
								options={FUNCTION_TYPE_OPTIONS}
								selection={e.aggregator}
								setSelection={handleFunctionTypeChange(i)}
								disabled={
									settings.viewType === 'Funnel chart' ||
									isPreview
								}
							/>
							<Combobox
								selection={e.column}
								setSelection={handleFunctionColumnChange(i)}
								searchConfig={searchOptionsConfig}
								disabled={
									e.aggregator === MetricAggregator.Count ||
									settings.viewType === 'Funnel chart' ||
									isPreview
								}
								onlyNumericKeys={
									e.aggregator !==
									MetricAggregator.CountDistinct
								}
								defaultKeys={variableKeys}
								placeholder={
									e.aggregator === MetricAggregator.Count
										? 'Rows'
										: undefined
								}
							/>
							{settings.expressions.length > 1 && (
								<ButtonIcon
									icon={<IconSolidX />}
									onClick={() => {
										setExpressions((expressions) => {
											const copy = [...expressions]
											copy.splice(i, 1)
											return copy
										})
									}}
									kind="secondary"
									emphasis="low"
								/>
							)}
						</Stack>
					))}
				</Stack>
			</LabeledRow>
			<Button
				kind="secondary"
				onClick={() => {
					setExpressions((expressions) => {
						return [
							...expressions,
							{
								aggregator: MetricAggregator.Count,
								column: '',
							},
						]
					})
				}}
			>
				Add function
			</Button>
		</>
	)
}
