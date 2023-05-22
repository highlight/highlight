import { FieldsBox } from '@components/FieldsBox/FieldsBox'
import { LoadingBar } from '@components/Loading/Loading'
import Select from '@components/Select/Select'
import { message } from 'antd'
import { Text } from 'recharts'

import { useProjectSettingsContext } from '@/pages/ProjectSettings/ProjectSettingsContext/ProjectSettingsContext'

import styles from './ErrorFiltersForm.module.scss'

const isValidRegex = function (p: string) {
	try {
		new RegExp(p)
	} catch (e: any) {
		message.error(`Pattern \`${p}\` is not valid regex.`)
		return false
	}
	return true
}

export const ErrorFiltersForm = () => {
	const {
		allProjectSettings: data,
		loading,
		setAllProjectSettings,
	} = useProjectSettingsContext()

	if (loading) {
		return <LoadingBar />
	}

	return (
		<FieldsBox id="filters">
			<h3>Error Filters</h3>

			<form>
				<p>Enter regular expression patterns to filter out errors.</p>
				<div className={styles.inputAndButtonRow}>
					<Select
						className={styles.input}
						mode="tags"
						placeholder="TypeError: Failed to fetch"
						value={data?.projectSettings?.error_filters}
						notFoundContent={
							<Text>
								Provide a regex pattern to filter out errors.
							</Text>
						}
						onChange={(patterns: string[]) => {
							patterns.filter(isValidRegex)
							setAllProjectSettings((currentProjectSettings) =>
								currentProjectSettings?.projectSettings
									? {
											projectSettings: {
												...currentProjectSettings.projectSettings,
												error_filters: patterns,
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
