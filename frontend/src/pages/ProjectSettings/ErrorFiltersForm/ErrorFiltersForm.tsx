import { FieldsBox } from '@components/FieldsBox/FieldsBox'
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
import styles from './ErrorFiltersForm.module.scss'

export const ErrorFiltersForm = () => {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const [errorFilters, setErrorFilters] = useState<string[]>([])
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
		})

	const onSubmit = (e: { preventDefault: () => void }) => {
		e.preventDefault()
		if (!project_id) {
			return
		}
		editProject({
			variables: {
				id: project_id!,
				error_filters: errorFilters,
			},
		}).then(() => {
			message.success('Updated error filters!', 5)
		})
	}

	useEffect(() => {
		if (!loading) {
			setErrorFilters(data?.project?.error_filters || [])
		}
	}, [data?.project?.error_filters, loading])

	if (loading) {
		return <LoadingBar />
	}

	return (
		<FieldsBox id="errors">
			<h3>Error Filters</h3>

			<form onSubmit={onSubmit} key={project_id}>
				<p>Enter REGEXP patterns to filter out errors.</p>
				<div className={styles.inputAndButtonRow}>
					<Select
						mode="tags"
						placeholder="TypeError: Failed to fetch"
						defaultValue={data?.project?.error_filters || undefined}
						onChange={(paths: string[]) => {
							setErrorFilters(paths)
						}}
					/>
					<Button
						trackingId="UpdateErrorFilters"
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
			</form>
		</FieldsBox>
	)
}
