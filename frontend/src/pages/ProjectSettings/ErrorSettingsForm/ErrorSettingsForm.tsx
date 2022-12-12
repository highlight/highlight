import { FieldsBox } from '@components/FieldsBox/FieldsBox'
import { CircularSpinner, LoadingBar } from '@components/Loading/Loading'
import Select from '@components/Select/Select'
import { useEditProjectMutation, useGetProjectQuery } from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import classNames from 'classnames/bind'
import React, { useEffect, useState } from 'react'

import commonStyles from '../../../Common.module.scss'
import Button from '../../../components/Button/Button/Button'
import styles from './ErrorSettingsForm.module.scss'

export const ErrorSettingsForm = () => {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const [errorJsonPaths, setErrorJsonPaths] = useState<string[]>([])
	const { data, loading } = useGetProjectQuery({
		variables: {
			id: project_id,
		},
	})

	const [editProject, { loading: editProjectLoading }] =
		useEditProjectMutation({
			refetchQueries: [
				namedOperations.Query.GetProjects,
				namedOperations.Query.GetProject,
			],
		})

	const onSubmit = (e: { preventDefault: () => void }) => {
		e.preventDefault()
		editProject({
			variables: {
				id: project_id,
				error_json_paths: errorJsonPaths,
			},
		}).then(() => {
			message.success('Updated error grouping rules!', 5)
		})
	}

	useEffect(() => {
		if (!loading) {
			setErrorJsonPaths(data?.project?.error_json_paths || [])
		}
	}, [data?.project?.error_json_paths, loading])

	if (loading) {
		return <LoadingBar />
	}

	return (
		<FieldsBox id="errors">
			<h3>Error Grouping</h3>

			<form onSubmit={onSubmit} key={project_id}>
				<p>Enter JSON expressions to use for grouping your errors.</p>
				<div className={styles.inputAndButtonRow}>
					<Select
						mode="tags"
						placeholder="$.context.messages[0]"
						defaultValue={
							data?.project?.error_json_paths || undefined
						}
						onChange={(paths: string[]) => {
							setErrorJsonPaths(paths)
						}}
					/>
					<Button
						trackingId="UpdateErrorJsonPaths"
						htmlType="submit"
						type="primary"
						className={classNames(
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
			</form>
		</FieldsBox>
	)
}
