import { LoadingBar } from '@components/Loading/Loading'
import { Select, SelectOption, Stack } from '@highlight-run/ui/components'
import { useParams } from '@util/react-router/useParams'

import BoxLabel from '@/components/BoxLabel/BoxLabel'
import { useProjectSettingsContext } from '@/pages/ProjectSettings/ProjectSettingsContext/ProjectSettingsContext'

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

	const currentPaths = data?.projectSettings?.error_json_paths || []

	const handleValueChange = (options: SelectOption[]) => {
		const paths = options.map((option) => String(option.value))
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
	}

	return (
		<form key={project_id}>
			<Stack gap="8">
				<BoxLabel
					label="Error grouping"
					info="Enter JSON expressions to use for grouping your errors."
				/>
				<Select
					creatable
					filterable
					displayMode="tags"
					placeholder="$.context.messages[0]"
					value={currentPaths}
					options={currentPaths}
					onValueChange={handleValueChange}
				/>
			</Stack>
		</form>
	)
}
