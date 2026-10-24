import { LoadingBar } from '@components/Loading/Loading'
import { Select, Stack, type SelectOption } from '@highlight-run/ui/components'
import { useParams } from '@util/react-router/useParams'

import BoxLabel from '@/components/BoxLabel/BoxLabel'
import { useProjectSettingsContext } from '@/pages/ProjectSettings/ProjectSettingsContext/ProjectSettingsContext'

const selectValuesToStrings = (values: Array<string | SelectOption>) =>
	values.map((value) =>
		typeof value === 'string' ? value : String(value.value),
	)

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

	const errorJsonPaths = data?.projectSettings?.error_json_paths || []

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
					value={errorJsonPaths}
					options={errorJsonPaths}
					onValueChange={(
						pathValues: Array<string | SelectOption>,
					) => {
						const paths = selectValuesToStrings(pathValues)
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
			</Stack>
		</form>
	)
}
