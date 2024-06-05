import { LoadingBar } from '@components/Loading/Loading'
import Select from '@components/Select/Select'
import { toast } from '@components/Toaster'
import { Stack } from '@highlight-run/ui/components'
import { Text } from 'recharts'

import BoxLabel from '@/components/BoxLabel/BoxLabel'
import { useProjectSettingsContext } from '@/pages/ProjectSettings/ProjectSettingsContext/ProjectSettingsContext'

import styles from './ErrorFiltersForm.module.css'

const isValidRegex = function (p: string) {
	try {
		new RegExp(p)
	} catch (e: any) {
		toast.error(`Pattern \`${p}\` is not valid regex.`)
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
		<form>
			<Stack gap="8">
				<BoxLabel
					label="Error filters"
					info="Enter regular expression patterns to filter out newly created errors. Any error filtered out will not count towards your billing quota."
				/>
				<div className={styles.inputAndButtonRow}>
					<Select
						className={styles.input}
						mode="tags"
						placeholder="TypeError: Failed to fetch"
						value={data?.projectSettings?.error_filters || []}
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
			</Stack>
		</form>
	)
}
