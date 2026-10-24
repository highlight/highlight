import {
	useEditProjectSettingsMutation,
} from '@graph/hooks'
import {
	Box,
	Form,
	Heading,
	IconSolidInformationCircle,
	Stack,
	Text,
	Tooltip,
} from '@highlight-run/ui/components'
import { useParams } from '@util/react-router/useParams'
import React, { useEffect, useState } from 'react'

import BorderBox from '@/components/BorderBox/BorderBox'
import { Button } from '@/components/Button'
import { LoadingBar } from '@components/Loading/Loading'
import { toast } from '@/components/Toaster'
import { useProjectSettingsContext } from '@/pages/ProjectSettings/ProjectSettingsContext/ProjectSettingsContext'

export const RageClicksForm = () => {
	const { project_id } = useParams<{ project_id: string }>()
	const {
		allProjectSettings: data,
		loading,
		setAllProjectSettings,
	} = useProjectSettingsContext()

	const [rageClickWindowSeconds, setRageClickWindowSeconds] = useState<number>(0)
	const [rageClickRadiusPixels, setRageClickRadiusPixels] = useState<number>(0)
	const [rageClickCount, setRageClickCount] = useState<number>(0)

	useEffect(() => {
		if (!loading && data?.projectSettings) {
			setRageClickWindowSeconds(data.projectSettings.rage_click_window_seconds ?? 0)
			setRageClickRadiusPixels(data.projectSettings.rage_click_radius_pixels ?? 0)
			setRageClickCount(data.projectSettings.rage_click_count ?? 0)
		}
	}, [data?.projectSettings, loading])

	const [editProjectSettings, { loading: editLoading }] =
		useEditProjectSettingsMutation()

	const onSave = (e: React.FormEvent) => {
		e.preventDefault()
		editProjectSettings({
			variables: {
				projectId: project_id!,
				rage_click_window_seconds: rageClickWindowSeconds,
				rage_click_radius_pixels: rageClickRadiusPixels,
				rage_click_count: rageClickCount,
			},
		}).then(() => {
			toast.success('Updated rage click settings!', { duration: 5000 })
			setAllProjectSettings((current) =>
				current?.projectSettings
					? {
							projectSettings: {
								...current.projectSettings,
								rage_click_window_seconds: rageClickWindowSeconds,
								rage_click_radius_pixels: rageClickRadiusPixels,
								rage_click_count: rageClickCount,
							},
					  }
					: current,
			)
		})
	}

	const onDiscard = () => {
		if (data?.projectSettings) {
			setRageClickWindowSeconds(data.projectSettings.rage_click_window_seconds ?? 0)
			setRageClickRadiusPixels(data.projectSettings.rage_click_radius_pixels ?? 0)
			setRageClickCount(data.projectSettings.rage_click_count ?? 0)
		}
	}

	const isDirty =
		rageClickWindowSeconds !== (data?.projectSettings?.rage_click_window_seconds ?? 0) ||
		rageClickRadiusPixels !== (data?.projectSettings?.rage_click_radius_pixels ?? 0) ||
		rageClickCount !== (data?.projectSettings?.rage_click_count ?? 0)

	if (loading) {
		return <LoadingBar />
	}

	return (
		<Box
			id="rage-clicks"
			background="white"
			border="dividerWeak"
			borderRadius="8"
			p="24"
		>
			<Stack gap="16">
				<Stack gap="4">
					<Heading level="h4">Rage clicks</Heading>
					<Text color="moderate">
						Use these settings to adjust the sensitivity for
						detecting rage clicks.
					</Text>
				</Stack>

				<Form onSubmit={onSave}>
					<Box display="flex" gap="16" width="full">
						<Box
							display="flex"
							flexDirection="column"
							gap="4"
							flexGrow={1}
						>
							<Box display="flex" alignItems="center" gap="4">
								<Text weight="bold" size="small">
									Elapsed Time (seconds)
								</Text>
								<Tooltip
									trigger={
										<IconSolidInformationCircle
											size={14}
											color="var(--color-gray-400)"
										/>
									}
								>
									The maximum time allowed between clicks in a
									rage click event
								</Tooltip>
							</Box>
							<Form.Input
								name="rage_click_window_seconds"
								type="number"
								value={rageClickWindowSeconds}
								onChange={(e) => {
									const val = Number(e.target.value)
									setRageClickWindowSeconds(val)
									setAllProjectSettings((current) =>
										current?.projectSettings
											? {
													projectSettings: {
														...current.projectSettings,
														rage_click_window_seconds:
															val,
													},
											  }
											: current,
									)
								}}
								min={1}
							/>
						</Box>

						<Box
							display="flex"
							flexDirection="column"
							gap="4"
							flexGrow={1}
						>
							<Box display="flex" alignItems="center" gap="4">
								<Text weight="bold" size="small">
									Radius (pixels)
								</Text>
								<Tooltip
									trigger={
										<IconSolidInformationCircle
											size={14}
											color="var(--color-gray-400)"
										/>
									}
								>
									The maximum distance allowed between clicks
									in a rage click event
								</Tooltip>
							</Box>
							<Form.Input
								name="rage_click_radius_pixels"
								type="number"
								value={rageClickRadiusPixels}
								onChange={(e) => {
									const val = Number(e.target.value)
									setRageClickRadiusPixels(val)
									setAllProjectSettings((current) =>
										current?.projectSettings
											? {
													projectSettings: {
														...current.projectSettings,
														rage_click_radius_pixels:
															val,
													},
											  }
											: current,
									)
								}}
								min={1}
							/>
						</Box>

						<Box
							display="flex"
							flexDirection="column"
							gap="4"
							flexGrow={1}
						>
							<Box display="flex" alignItems="center" gap="4">
								<Text weight="bold" size="small">
									Minimum clicks
								</Text>
								<Tooltip
									trigger={
										<IconSolidInformationCircle
											size={14}
											color="var(--color-gray-400)"
										/>
									}
								>
									The minimum number of clicks needed to be
									considered a rage click event
								</Tooltip>
							</Box>
							<Form.Input
								name="rage_click_minimum_clicks"
								type="number"
								value={rageClickCount}
								onChange={(e) => {
									const val = Number(e.target.value)
									setRageClickCount(val)
									setAllProjectSettings((current) =>
										current?.projectSettings
											? {
													projectSettings: {
														...current.projectSettings,
														rage_click_count: val,
													},
											  }
											: current,
									)
								}}
								min={1}
							/>
						</Box>
					</Box>
				</Form>
			</Stack>
		</Box>

	)
}
