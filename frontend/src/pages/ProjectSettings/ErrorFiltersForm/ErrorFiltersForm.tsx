import { toast } from '@components/Toaster'
import { IconAnimatedLoading } from '@components/Loading/Loading'
import {
	Box,
	Select,
	Stack,
	type SelectOption,
} from '@highlight-run/ui/components'

import BoxLabel from '@/components/BoxLabel/BoxLabel'
import { useProjectSettingsContext } from '@/pages/ProjectSettings/ProjectSettingsContext/ProjectSettingsContext'

import styles from './ErrorFiltersForm.module.css'

const isValidRegex = function (p: string) {
	try {
		new RegExp(p)
	} catch {
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
		return (
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				py="12"
			>
				<IconAnimatedLoading />
			</Box>
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
						creatable
						customFilterable
						displayMode="tags"
						placeholder="TypeError: Failed to fetch"
						value={data?.projectSettings?.error_filters || []}
						options={[]}
						onValueChange={(patterns: SelectOption[]) => {
							const regexPatterns = patterns.map((pattern) =>
								String(pattern.value),
							)
							regexPatterns.filter(isValidRegex)
							setAllProjectSettings((currentProjectSettings) =>
								currentProjectSettings?.projectSettings
									? {
											projectSettings: {
												...currentProjectSettings.projectSettings,
												error_filters: regexPatterns,
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
