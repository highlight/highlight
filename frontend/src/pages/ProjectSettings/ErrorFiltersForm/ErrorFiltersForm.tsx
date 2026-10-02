import { LoadingBar } from '@components/Loading/Loading'
import { toast } from '@components/Toaster'
import { Select, Stack, type SelectOption } from '@highlight-run/ui/components'

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

const selectValuesToStrings = (values: Array<string | SelectOption>) =>
	values.map((value) =>
		typeof value === 'string' ? value : String(value.value),
	)

export const ErrorFiltersForm = () => {
	const {
		allProjectSettings: data,
		loading,
		setAllProjectSettings,
	} = useProjectSettingsContext()

	if (loading) {
		return <LoadingBar />
	}

	const errorFilters = data?.projectSettings?.error_filters || []

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
						creatable
						filterable
						displayMode="tags"
						placeholder="TypeError: Failed to fetch"
						value={errorFilters}
						options={errorFilters}
						onValueChange={(
							patternValues: Array<string | SelectOption>,
						) => {
							const patterns =
								selectValuesToStrings(patternValues)
							patterns.forEach(isValidRegex)
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
