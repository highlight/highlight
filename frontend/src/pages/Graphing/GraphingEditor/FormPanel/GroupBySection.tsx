import { Box, Input } from '@highlight-run/ui/components'
import React, { useCallback } from 'react'

import { MetricAggregator } from '@/graph/generated/schemas'
import { LabeledRow } from '@/pages/Graphing/LabeledRow'
import { OptionDropdown } from '@/pages/Graphing/OptionDropdown'
import { useGraphingEditorContext } from '@/pages/Graphing/GraphingEditor/GraphingEditorContext'
import { Combobox } from '@/pages/Graphing/Combobox'
import { FUNCTION_TYPES, MAX_LIMIT_SIZE } from '@pages/Graphing/constants'
import { SidebarSection } from '@/pages/Graphing/GraphingEditor/FormPanel/SidebarSection'

import * as style from '../GraphingEditor.css'

type Props = {
	isPreview: boolean
	searchOptionsConfig: any
	variableKeys: string[]
}

export const GroupBySection: React.FC<Props> = ({
	isPreview,
	searchOptionsConfig,
	variableKeys,
}) => {
	const {
		settings,
		setGroupByEnabled,
		setGroupByKeys,
		setLimitFunctionType,
		setLimit,
		setLimitMetric,
	} = useGraphingEditorContext()

	const handleLimitChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = Math.min(MAX_LIMIT_SIZE, parseInt(e.target.value))
			setLimit(value)
		},
		[setLimit],
	)

	const expanded =
		settings.groupByEnabled &&
		settings.viewType !== 'Funnel chart' &&
		settings.viewType !== 'Table'

	return (
		<SidebarSection>
			<LabeledRow
				label="Group by"
				name="groupBy"
				enabled={settings.groupByEnabled}
				setEnabled={setGroupByEnabled}
				disabled={settings.viewType === 'Funnel chart' || isPreview}
				tooltip="A categorical field for grouping results into separate series."
			>
				<Combobox
					selection={settings.groupByKeys}
					setSelection={setGroupByKeys}
					searchConfig={searchOptionsConfig}
					defaultKeys={variableKeys}
					disabled={settings.viewType === 'Funnel chart' || isPreview}
				/>
			</LabeledRow>
			{expanded && (
				<Box display="flex" flexDirection="row" gap="4">
					<LabeledRow
						label="Limit"
						name="limit"
						tooltip="The maximum number of groups to include. Currently, the max is 100."
					>
						<Input
							type="number"
							name="limit"
							placeholder="Enter limit"
							value={settings.limit}
							onChange={handleLimitChange}
							cssClass={style.input}
							disabled={isPreview}
						/>
					</LabeledRow>
					<LabeledRow
						label="By"
						name="limitBy"
						tooltip="The function used to determine which groups are included."
					>
						<OptionDropdown
							options={FUNCTION_TYPES}
							selection={settings.limitFunctionType}
							setSelection={setLimitFunctionType}
							disabled={isPreview}
						/>
						<Combobox
							selection={settings.fetchedLimitMetric}
							setSelection={setLimitMetric}
							searchConfig={searchOptionsConfig}
							disabled={
								settings.limitFunctionType ===
									MetricAggregator.Count || isPreview
							}
							onlyNumericKeys
							defaultKeys={variableKeys}
							placeholder={
								settings.limitFunctionType ===
								MetricAggregator.Count
									? 'Rows'
									: undefined
							}
						/>
					</LabeledRow>
				</Box>
			)}
		</SidebarSection>
	)
}
