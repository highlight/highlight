import { IconAnimatedLoading } from '@components/Loading/Loading'
import {
	Box,
	Form,
	IconSolidInformationCircle,
	Stack,
	Tooltip,
} from '@highlight-run/ui/components'
import { useParams } from '@util/react-router/useParams'
import { useEffect, useState } from 'react'

import BorderBox from '@/components/BorderBox/BorderBox'
import BoxLabel from '@/components/BoxLabel/BoxLabel'
import { useProjectSettingsContext } from '@/pages/ProjectSettings/ProjectSettingsContext/ProjectSettingsContext'

const RAGE_CLICK_WINDOW_TOOLTIP =
	'The maximum time allowed between clicks in a rage click event'
const RAGE_CLICK_RADIUS_TOOLTIP =
	'The maximum distance allowed between clicks in a rage click event'
const RAGE_CLICK_COUNT_TOOLTIP =
	'The minimum number of clicks needed to be considered a rage click event'

const RAGE_CLICK_SETTINGS = {
	window: 'rage_click_window_seconds',
	radius: 'rage_click_radius_pixels',
	count: 'rage_click_count',
} as const

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

	const updateRageClickSetting = (
		key: (typeof RAGE_CLICK_SETTINGS)[keyof typeof RAGE_CLICK_SETTINGS],
		value: number,
	) => {
		setAllProjectSettings((currentProjectSettings) =>
			currentProjectSettings?.projectSettings
				? {
						projectSettings: {
							...currentProjectSettings.projectSettings,
							[key]: value,
						},
					}
				: currentProjectSettings,
		)
	}

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
		<BorderBox>
			<Form key={project_id}>
				<Stack gap="8">
					<BoxLabel
						label="Rage clicks"
						info="Use these settings to adjust the sensitivity for detecting
					rage clicks."
					/>
					<Box display="flex" gap="8">
						<Form.Input
							label="Elapsed Time (seconds)"
							name="rage_click_window_seconds"
							type="number"
							value={rageClickWindowSeconds}
							labelTag={
								<Tooltip
									trigger={
										<IconSolidInformationCircle size={12} />
									}
									renderInLine
								>
									{RAGE_CLICK_WINDOW_TOOLTIP}
								</Tooltip>
							}
							onChange={(e) => {
								const val = Number(e.target.value)
								setRageClickWindowSeconds(val)
								updateRageClickSetting(
									RAGE_CLICK_SETTINGS.window,
									val,
								)
							}}
							min={1}
						/>
						<Form.Input
							label="Radius (pixels)"
							labelTag={
								<Tooltip
									trigger={
										<IconSolidInformationCircle size={12} />
									}
									renderInLine
								>
									{RAGE_CLICK_RADIUS_TOOLTIP}
								</Tooltip>
							}
							name="rage_click_radius_pixels"
							type="number"
							value={rageClickRadiusPixels}
							onChange={(e) => {
								const val = Number(e.target.value)
								setRageClickRadiusPixels(val)
								updateRageClickSetting(
									RAGE_CLICK_SETTINGS.radius,
									val,
								)
							}}
							min={1}
						/>
						<Form.Input
							name="rage_click_minimum_clicks"
							label="Minimum clicks"
							labelTag={
								<Tooltip
									trigger={
										<IconSolidInformationCircle size={12} />
									}
									renderInLine
								>
									{RAGE_CLICK_COUNT_TOOLTIP}
								</Tooltip>
							}
							type="number"
							value={rageClickCount}
							onChange={(e) => {
								const val = Number(e.target.value)
								setRageClickCount(val)
								updateRageClickSetting(
									RAGE_CLICK_SETTINGS.count,
									val,
								)
							}}
							min={1}
						/>
					</Box>
				</Stack>
			</Form>
		</BorderBox>
	)
}
