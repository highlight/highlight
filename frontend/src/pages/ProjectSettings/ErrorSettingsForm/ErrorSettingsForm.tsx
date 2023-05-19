import { FieldsBox } from '@components/FieldsBox/FieldsBox'
import { LoadingBar } from '@components/Loading/Loading'
import Select from '@components/Select/Select'
import { useParams } from '@util/react-router/useParams'
import React from 'react'

import { useProjectSettingsContext } from '@/pages/ProjectSettings/ProjectSettingsContext/ProjectSettingsContext'

import styles from './ErrorSettingsForm.module.scss'

export const ErrorSettingsForm = () => {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const {
		allProjectSettings: data,
		loading,
		setAllProjectSettings,
	} = useProjectSettingsContext()

	if (loading) {
		return <LoadingBar />
	}

	return (
		<FieldsBox id="grouping">
			<h3>Error Grouping</h3>

			<form key={project_id}>
				<p>Enter JSON expressions to use for grouping your errors.</p>
				<div className={styles.inputAndButtonRow}>
					<Select
						mode="tags"
						placeholder="$.context.messages[0]"
						value={data?.projectSettings?.error_json_paths || []}
						onChange={(paths: string[]) => {
							setAllProjectSettings((currentProjectSettings) =>
								currentProjectSettings?.projectSettings
									? {
											projectSettings: {
												...currentProjectSettings.projectSettings,
												error_json_paths: paths,
											},
									  }
									: currentProjectSettings,
							)
						}}
					/>
				</div>
			</form>
		</FieldsBox>
	)
}
