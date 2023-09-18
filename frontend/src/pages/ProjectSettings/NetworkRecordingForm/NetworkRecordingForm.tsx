import InfoTooltip from '@components/InfoTooltip/InfoTooltip'
import { LoadingBar } from '@components/Loading/Loading'
import Select from '@components/Select/Select'
import { Form, Stack } from '@highlight-run/ui'
import { useParams } from '@util/react-router/useParams'

import BorderBox from '@/components/BorderBox/BorderBox'
import BoxLabel from '@/components/BoxLabel/BoxLabel'
import { useProjectSettingsContext } from '@/pages/ProjectSettings/ProjectSettingsContext/ProjectSettingsContext'

export const NetworkRecordingForm = () => {
	const { project_id } = useParams<{ project_id: string }>()
	const formStore = Form.useFormStore({})
	const {
		allProjectSettings: data,
		loading,
		setAllProjectSettings,
	} = useProjectSettingsContext()

	if (loading) {
		return <LoadingBar />
	}

	return (
		<BorderBox>
			<Form store={formStore} key={project_id}>
				<Stack gap="8">
					<BoxLabel
						label="Network recording settings"
						info="
						Adjust how we process your network requests at the project
						level."
					/>
					<Form.NamedSection
						label="Recorded domains"
						name="Recorded domains"
						tag={
							<InfoTooltip
								title="Record aggregate metrics for network requests that are sent to these domains."
								size="small"
							/>
						}
					>
						<Select
							mode="tags"
							placeholder="api.highlight.run"
							notFoundContent={null}
							value={data?.projectSettings?.backend_domains ?? []}
							onChange={(domains: string[]) => {
								setAllProjectSettings(
									(currentProjectSettings) =>
										currentProjectSettings?.projectSettings
											? {
													projectSettings: {
														...currentProjectSettings.projectSettings,
														backend_domains:
															domains,
													},
											  }
											: currentProjectSettings,
								)
							}}
						/>
					</Form.NamedSection>
				</Stack>
			</Form>
		</BorderBox>
	)
}
