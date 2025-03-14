import { Box, Form, Stack } from '@highlight-run/ui/components'
import { Divider } from 'antd'
import React, { useMemo } from 'react'

import { OptionDropdown } from '@/pages/Graphing/OptionDropdown'
import { Panel } from '@/pages/Graphing/components/Panel'
import {
	convertSettingsToSql,
	SqlEditor,
} from '@/pages/Graphing/components/SqlEditor'
import { useGraphingEditorContext } from '@/pages/Graphing/GraphingEditor/GraphingEditorContext'
import { useGraphingVariables } from '@/pages/Graphing/hooks/useGraphingVariables'
import { EDITOR_OPTIONS, Editor } from '@pages/Graphing/constants'

import { SidebarSection } from './SidebarSection'
import { VisualizationSection } from './VisualizationSection'
import { QueryBuilder } from './QueryBuilder'
import { GroupBySection } from './GroupBySection'
import { BucketBySection } from './BucketBySection'
import * as style from '../GraphingEditor.css'
import { RunQueryButton } from '@/pages/Graphing/components/RunQueryButton'
import { useGraphContext } from '@/pages/Graphing/context/GraphContext'

type Props = {
	startDate: Date
	endDate: Date
	currentDashboardId: string
	isPreview: boolean
	loading: boolean
}

export const FormPanel: React.FC<Props> = ({
	startDate,
	endDate,
	currentDashboardId,
	isPreview,
}) => {
	const { settings, setEditor, setSql, sqlInternal, setSqlInternal } =
		useGraphingEditorContext()

	const { errors } = useGraphContext()

	const searchOptionsConfig = useMemo(() => {
		return {
			productType: settings.productType,
			startDate,
			endDate,
		}
	}, [endDate, settings.productType, startDate])

	const { values } = useGraphingVariables(currentDashboardId)

	const variableKeys = Array.from(values).map(([key]) => {
		return `$${key}`
	})

	const isSqlEditor = settings.editor === Editor.SqlEditor

	const handleEditorChange = (e: Editor) => {
		if (e === Editor.SqlEditor) {
			const convertedSql = convertSettingsToSql(
				settings,
				startDate,
				endDate,
			)
			setSqlInternal(convertedSql)
			setSql(convertedSql)
		}
		setEditor(e)
	}

	return (
		<Panel>
			<Form>
				<Stack gap="16">
					<VisualizationSection isPreview={isPreview} />
					<Divider className="m-0" />
					<SidebarSection isError={errors.length > 0}>
						<Box>
							<Box cssClass={style.editorHeader}>
								<Box cssClass={style.editorSelect}>
									<OptionDropdown<Editor>
										options={EDITOR_OPTIONS}
										selection={settings.editor}
										setSelection={handleEditorChange}
										disabled={isPreview}
									/>
								</Box>
								{isSqlEditor && (
									<>
										<RunQueryButton
											onRunQuery={() => {
												setSql(sqlInternal)
											}}
										/>
									</>
								)}
							</Box>
							{isSqlEditor && (
								<Box cssClass={style.sqlEditorWrapper}>
									<SqlEditor
										value={sqlInternal}
										setValue={setSqlInternal}
										startDate={startDate}
										endDate={endDate}
										onRunQuery={() => {
											setSql(sqlInternal)
										}}
									/>
								</Box>
							)}
						</Box>
						{!isSqlEditor && (
							<QueryBuilder
								isPreview={isPreview}
								startDate={startDate}
								endDate={endDate}
								searchOptionsConfig={searchOptionsConfig}
								variableKeys={variableKeys}
							/>
						)}
					</SidebarSection>
					{!isSqlEditor && (
						<>
							<GroupBySection
								isPreview={isPreview}
								searchOptionsConfig={searchOptionsConfig}
								variableKeys={variableKeys}
							/>
							<BucketBySection
								isPreview={isPreview}
								searchOptionsConfig={searchOptionsConfig}
								variableKeys={variableKeys}
							/>
						</>
					)}
				</Stack>
			</Form>
		</Panel>
	)
}
