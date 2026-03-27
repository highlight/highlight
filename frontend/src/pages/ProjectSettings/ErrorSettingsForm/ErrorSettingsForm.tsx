import { LoadingBar } from '@components/Loading/Loading'
import { Select, Stack } from '@highlight-run/ui/components'
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
					value={data?.projectSettings?.error_json_paths || []}
					onValueChange={(items: { name: string; value: string }[]) => {
						setAllProjectSettings((currentProjectSettings) =>
							currentProjectSettings?.projectSettings
								? {
										projectSettings: {
											...currentProjectSettings.projectSettings,
											error_json_paths: items.map((i) => i.value),
										},
									}
								: currentProjectSettings,
						)
					}}
				/>
			</Stack>
		</form>
	)
}
