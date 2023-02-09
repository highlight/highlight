import { FieldsBox } from '@components/FieldsBox/FieldsBox'
import InfoTooltip from '@components/InfoTooltip/InfoTooltip'
import InputNumber from '@components/InputNumber/InputNumber'
import { CircularSpinner, LoadingBar } from '@components/Loading/Loading'
import { useEditProjectMutation, useGetProjectQuery } from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import clsx from 'clsx'
import React, { useEffect, useState } from 'react'

import commonStyles from '../../../Common.module.scss'
import Button from '../../../components/Button/Button/Button'
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
	const { data, loading } = useGetProjectQuery({
		variables: {
			id: project_id!,
		},
		skip: !project_id,
	})

	const [editProject, { loading: editProjectLoading }] =
		useEditProjectMutation({
			refetchQueries: [
				namedOperations.Query.GetProjects,
				namedOperations.Query.GetProject,
			],
			onCompleted: () => {
				message.success('Updated rage clicks settings!', 5)
			},
		})

	const onSubmit = (e: { preventDefault: () => void }) => {
		e.preventDefault()
		if (!project_id) {
			return
		}
		editProject({
			variables: {
				id: project_id!,
				rage_click_window_seconds: rageClickWindowSeconds,
				rage_click_radius_pixels: rageClickRadiusPixels,
				rage_click_count: rageClickCount,
			},
		})
	}

	useEffect(() => {
		if (!loading) {
			setRageClickWindowSeconds(
				data?.project?.rage_click_window_seconds ?? 0,
			)
			setRageClickRadiusPixels(
				data?.project?.rage_click_radius_pixels ?? 0,
			)
			setRageClickCount(data?.project?.rage_click_count ?? 0)
		}
	}, [
		data?.project?.rage_click_count,
		data?.project?.rage_click_radius_pixels,
		data?.project?.rage_click_window_seconds,
		loading,
	])

	if (loading) {
		return <LoadingBar />
	}

	return (
		<FieldsBox id="rage">
			<h3>Rage Clicks</h3>
			<form onSubmit={onSubmit} key={project_id}>
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
						}}
						min={1}
					/>
				</div>
				<div className={styles.fieldRow}>
					<div className={styles.fieldKey}></div>
					<div className={styles.saveButton}>
						<Button
							trackingId="RageClickSettingsUpdate"
							htmlType="submit"
							type="primary"
							className={clsx(
								commonStyles.submitButton,
								styles.saveButton,
							)}
						>
							{editProjectLoading ? (
								<CircularSpinner
									style={{
										fontSize: 18,
										color: 'var(--text-primary-inverted)',
									}}
								/>
							) : (
								'Save'
							)}
						</Button>
					</div>
				</div>
			</form>
		</FieldsBox>
	)
}
