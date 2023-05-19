import { FieldsBox } from '@components/FieldsBox/FieldsBox'
import InfoTooltip from '@components/InfoTooltip/InfoTooltip'
import InputNumber from '@components/InputNumber/InputNumber'
import { LoadingBar } from '@components/Loading/Loading'
import { useParams } from '@util/react-router/useParams'
import React, { useEffect, useState } from 'react'

import { useProjectSettingsContext } from '@/pages/ProjectSettings/ProjectSettingsContext/ProjectSettingsContext'

import styles from './RageClicksForm.module.scss'

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
		<FieldsBox id="rage">
			<h3>Rage Clicks</h3>
			<form key={project_id}>
				<p>
					Use these settings to adjust the sensitivity for detecting
					rage clicks.
				</p>
				<div className={styles.fieldRow}>
					<label className={styles.fieldKey}>
						Elapsed Time (seconds)
						<InfoTooltip
							title="The maximum time allowed between clicks in a rage click event"
							size="medium"
							className={styles.tooltip}
						/>
					</label>
					<InputNumber
						value={rageClickWindowSeconds}
						onChange={(val) => {
							setRageClickWindowSeconds(val as number)
							setAllProjectSettings((currentProjectSettings) =>
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
				</div>
				<div className={styles.fieldRow}>
					<label className={styles.fieldKey}>
						Radius (pixels)
						<InfoTooltip
							title="The maximum distance allowed between clicks in a rage click event"
							size="medium"
							className={styles.tooltip}
						/>
					</label>
					<InputNumber
						value={rageClickRadiusPixels}
						onChange={(val) => {
							setRageClickRadiusPixels(val as number)
							setAllProjectSettings((currentProjectSettings) =>
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
				</div>
				<div className={styles.fieldRow}>
					<label className={styles.fieldKey}>
						Minimum Clicks
						<InfoTooltip
							title="The minimum number of clicks needed to be considered a rage click event"
							size="medium"
							className={styles.tooltip}
						/>
					</label>
					<InputNumber
						value={rageClickCount}
						onChange={(val) => {
							setRageClickCount(val as number)
							setAllProjectSettings((currentProjectSettings) =>
								currentProjectSettings?.projectSettings
									? {
											projectSettings: {
												...currentProjectSettings.projectSettings,
												rage_click_count: val as number,
											},
									  }
									: currentProjectSettings,
							)
						}}
						min={1}
					/>
				</div>
			</form>
		</FieldsBox>
	)
}
