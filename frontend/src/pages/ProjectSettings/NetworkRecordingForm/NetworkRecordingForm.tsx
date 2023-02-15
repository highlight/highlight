import { FieldsBox } from '@components/FieldsBox/FieldsBox'
import InfoTooltip from '@components/InfoTooltip/InfoTooltip'
import { CircularSpinner, LoadingBar } from '@components/Loading/Loading'
import Select from '@components/Select/Select'
import { useEditProjectMutation, useGetProjectQuery } from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import clsx from 'clsx'
import React, { useEffect, useState } from 'react'

import commonStyles from '../../../Common.module.scss'
import Button from '../../../components/Button/Button/Button'
import styles from './NetworkRecordingForm.module.scss'

export const NetworkRecordingForm = () => {
	const { project_id } = useParams<{ project_id: string }>()
	const [backendDomains, setBackendDomains] = useState<string[]>([])
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
				message.success('Updated network recording settings!', 5)
			},
		})

	const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (!project_id) {
			return
		}
		editProject({
			variables: {
				id: project_id!,
				backend_domains: backendDomains,
			},
		}).catch(console.error)
	}

	useEffect(() => {
		if (!loading) {
			setBackendDomains(data?.project?.backend_domains ?? [])
		}
	}, [data?.project?.backend_domains, loading])

	if (loading) {
		return <LoadingBar />
	}

	return (
		<FieldsBox id="network">
			<h3>Network Recording Settings</h3>
			<form onSubmit={onSubmit} key={project_id}>
				<p>
					Adjust how we process your network requests at the project
					level.
				</p>
				<div className={styles.fieldRow}>
					<label className={styles.fieldKey}>
						Recorded Domains
						<InfoTooltip
							title="Record aggregate metrics for network requests that are sent to these domains."
							size="medium"
							className={styles.tooltip}
						/>
					</label>
					<Select
						mode="tags"
						placeholder="api.highlight.run"
						notFoundContent={null}
						defaultValue={data?.project?.backend_domains || []}
						onChange={(domains: string[]) => {
							setBackendDomains(domains)
						}}
					/>
				</div>
				<div className={styles.fieldRow}>
					<div className={styles.fieldKey}></div>
					<div className={styles.saveButton}>
						<Button
							trackingId="NetworkRecordingSettingsUpdate"
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
