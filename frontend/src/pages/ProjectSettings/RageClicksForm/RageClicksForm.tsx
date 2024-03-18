import InfoTooltip from '@components/InfoTooltip/InfoTooltip'
import InputNumber from '@components/InputNumber/InputNumber'
import { LoadingBar } from '@components/Loading/Loading'
import { Box, Form, Stack } from '@highlight-run/ui/components'
import { useParams } from '@util/react-router/useParams'
import { useEffect, useState } from 'react'

import BorderBox from '@/components/BorderBox/BorderBox'
import BoxLabel from '@/components/BoxLabel/BoxLabel'
import { useProjectSettingsContext } from '@/pages/ProjectSettings/ProjectSettingsContext/ProjectSettingsContext'

export const RageClicksForm = () => {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const [rageClickWindowSeconds, setRageClickWindowSeconds] =
		useState<number>(0)
	const [rageClickRadiusPixels, setRageClickRadiusPixels] =
		useState<number>(0)
	const [rageClickCount, setRageClickCount] = useState<number>(0)
	const {
		allProjectSettings: data,
		loading,
		setAllProjectSettings,
	} = useProjectSettingsContext()

	useEffect(() => {
		if (!loading) {
			setRageClickWindowSeconds(
				data?.projectSettings?.rage_click_window_seconds ?? 0,
			)
			setRageClickRadiusPixels(
				data?.projectSettings?.rage_click_radius_pixels ?? 0,
			)
			setRageClickCount(data?.projectSettings?.rage_click_count ?? 0)
		}
	}, [
		data?.projectSettings?.rage_click_count,
		data?.projectSettings?.rage_click_radius_pixels,
		data?.projectSettings?.rage_click_window_seconds,
		loading,
	])

	if (loading) {
		return <LoadingBar />
	}

	return (
		<BorderBox>
			<Form key={project_id}>
				<Stack gap="8">
					<BoxLabel
						label="Rage clicks"
						info="Use these settings to adjust the sensitivity for detecting
					rage clicks."
					/>
					<Box display="flex" gap="8">
						<Form.NamedSection
							label="Elapsed Time (seconds)"
							name="Elapsed Time (seconds)"
							tag={
								<InfoTooltip
									title="The maximum time allowed between clicks in a rage click event"
									size="small"
								/>
							}
						>
							<InputNumber
								value={rageClickWindowSeconds}
								onChange={(val) => {
									setRageClickWindowSeconds(val as number)
									setAllProjectSettings(
										(currentProjectSettings) =>
											currentProjectSettings?.projectSettings
												? {
														projectSettings: {
															...currentProjectSettings.projectSettings,
															rage_click_window_seconds:
																val as number,
														},
												  }
												: currentProjectSettings,
									)
								}}
								min={1}
							/>
						</Form.NamedSection>
						<Form.NamedSection
							label="Radius (pixels)"
							name="Radius (pixels)"
							tag={
								<InfoTooltip
									title="The maximum distance allowed between clicks in a rage click event"
									size="small"
								/>
							}
						>
							<InputNumber
								value={rageClickRadiusPixels}
								onChange={(val) => {
									setRageClickRadiusPixels(val as number)
									setAllProjectSettings(
										(currentProjectSettings) =>
											currentProjectSettings?.projectSettings
												? {
														projectSettings: {
															...currentProjectSettings.projectSettings,
															rage_click_radius_pixels:
																val as number,
														},
												  }
												: currentProjectSettings,
									)
								}}
								min={1}
							/>
						</Form.NamedSection>
						<Form.NamedSection
							label="Minimum clicks"
							name="Minimum clicks"
							tag={
								<InfoTooltip
									title="The minimum number of clicks needed to be considered a rage click event"
									size="small"
								/>
							}
						>
							<InputNumber
								value={rageClickCount}
								onChange={(val) => {
									setRageClickCount(val as number)
									setAllProjectSettings(
										(currentProjectSettings) =>
											currentProjectSettings?.projectSettings
												? {
														projectSettings: {
															...currentProjectSettings.projectSettings,
															rage_click_count:
																val as number,
														},
												  }
												: currentProjectSettings,
									)
								}}
								min={1}
							/>
						</Form.NamedSection>
					</Box>
				</Stack>
			</Form>
		</BorderBox>
	)
}
