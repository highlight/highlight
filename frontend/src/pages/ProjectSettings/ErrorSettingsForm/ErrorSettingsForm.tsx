import { LoadingBar } from '@components/Loading/Loading'
import { Select, Stack } from '@highlight-run/ui/components'
import type { SelectOption } from '@highlight-run/ui/components'
import { useParams } from '@util/react-router/useParams'

import BoxLabel from '@/components/BoxLabel/BoxLabel'
import { useProjectSettingsContext } from '@/pages/ProjectSettings/ProjectSettingsContext/ProjectSettingsContext'

type SelectStringValue = SelectOption | string | number

const toStringValues = (values: SelectStringValue[]) =>
	values.map((value) =>
		typeof value === 'object' ? String(value.value) : String(value),
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

	const paths = data?.projectSettings?.error_json_paths || []

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
					options={paths}
					value={paths}
					onValueChange={(selectedPaths: SelectStringValue[]) => {
						const paths = toStringValues(selectedPaths)

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
