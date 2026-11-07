import { LoadingBar } from '@components/Loading/Loading'
import { toast } from '@components/Toaster'
import { Select, SelectOption, Stack } from '@highlight-run/ui/components'

import BoxLabel from '@/components/BoxLabel/BoxLabel'
import { useProjectSettingsContext } from '@/pages/ProjectSettings/ProjectSettingsContext/ProjectSettingsContext'

import styles from './ErrorFiltersForm.module.css'

const isValidRegex = (pattern: string): boolean => {
	try {
		new RegExp(pattern)
		return true
	} catch {
		toast.error(`Pattern \`${pattern}\` is not valid regex.`)
		return false
	}
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

	const currentFilters = data?.projectSettings?.error_filters || []

	const handleValueChange = (options: SelectOption[]) => {
		const patterns = options.map((option) => String(option.value))
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
						creatable
						filterable
						displayMode="tags"
						placeholder="TypeError: Failed to fetch"
						value={currentFilters}
						options={currentFilters}
						onValueChange={handleValueChange}
					/>
				</div>
			</Stack>
		</form>
	)
}
