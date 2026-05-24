import { LoadingBar } from '@components/Loading/Loading'
import { toast } from '@components/Toaster'
import { Select, Stack } from '@highlight-run/ui/components'
import type { SelectOption } from '@highlight-run/ui/components'

import BoxLabel from '@/components/BoxLabel/BoxLabel'
import { useProjectSettingsContext } from '@/pages/ProjectSettings/ProjectSettingsContext/ProjectSettingsContext'

import styles from './ErrorFiltersForm.module.css'

type SelectStringValue = SelectOption | string | number

const toStringValues = (values: SelectStringValue[]) =>
	values.map((value) =>
		typeof value === 'object' ? String(value.value) : String(value),
	)

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

	const filters = data?.projectSettings?.error_filters || []

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
						options={filters}
						value={filters}
						onValueChange={(
							selectedPatterns: SelectStringValue[],
						) => {
							const patterns =
								toStringValues(selectedPatterns).filter(
									isValidRegex,
								)

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
