import InfoTooltip from '@components/InfoTooltip/InfoTooltip'
import { LoadingBar } from '@components/Loading/Loading'
import Select from '@components/Select/Select'
import { Box, Form, Stack } from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import React from 'react'
import { useLocation } from 'react-router-dom'

import BorderBox from '@/components/BorderBox/BorderBox'
import BoxLabel from '@/components/BoxLabel/BoxLabel'
import { useProjectSettingsContext } from '@/pages/ProjectSettings/ProjectSettingsContext/ProjectSettingsContext'

export const NetworkRecordingForm = () => {
	const location = useLocation()
	const { projectId } = useProjectId()
	const ref = React.useRef<HTMLDivElement>()
	const formStore = Form.useFormStore({})
	const {
		allProjectSettings: data,
		loading,
		setAllProjectSettings,
	} = useProjectSettingsContext()

	React.useEffect(() => {
		if (ref.current && location.hash === '#network') {
			ref.current.scrollIntoView()
		}
	}, [location.hash])

	if (loading) {
		return <LoadingBar />
	}

	return (
		<Box ref={ref}>
			<BorderBox>
				<Form store={formStore} key={projectId}>
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
								value={
									data?.projectSettings?.backend_domains ?? []
								}
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
		</Box>
	)
}
