import { FieldsBox } from '@components/FieldsBox/FieldsBox'
import { LoadingBar } from '@components/Loading/Loading'
import Select from '@components/Select/Select'
import { useEditProjectMutation, useGetProjectQuery } from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { useProjectId } from '@hooks/useProjectId'
import { message } from 'antd'
import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import { Text } from 'recharts'

import commonStyles from '../../../Common.module.scss'
import Button from '../../../components/Button/Button/Button'
import styles from './ErrorFiltersForm.module.scss'

const isValidRegex = function (p: string) {
	try {
		new RegExp(p)
	} catch (e: any) {
		message.error(`Pattern \`${p}\` is not valid regex.`)
		return false
	}
	return true
}

export const ErrorFiltersForm = () => {
	const { projectId } = useProjectId()
	const [errorFilters, setErrorFilters] = useState<string[]>([])
	const { data, loading } = useGetProjectQuery({
		variables: {
			id: projectId!,
		},
		skip: !projectId,
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
		if (!projectId) {
			return
		}
		if (errorFilters.filter(isValidRegex).length < errorFilters.length) {
			message.error(
				`Please correct invalid regex patterns before saving.`,
			)
			return
		}

		editProject({
			variables: {
				id: projectId!,
				error_filters: errorFilters,
			},
		}).then(() => {
			message.success('Updated error filters!', 5)
		})
	}

	useEffect(() => {
		setErrorFilters(data?.project?.error_filters ?? [])
	}, [data?.project?.error_filters])

	if (loading) {
		return <LoadingBar />
	}

	return (
		<FieldsBox id="filters">
			<h3>Error Filters</h3>

			<form onSubmit={onSubmit}>
				<p>Enter regular expression patterns to filter out errors.</p>
				<div className={styles.inputAndButtonRow}>
					<Select
						className={styles.input}
						mode="tags"
						placeholder="TypeError: Failed to fetch"
						defaultValue={data?.project?.error_filters}
						notFoundContent={
							<Text>
								Provide a regex pattern to filter out errors.
							</Text>
						}
						onChange={(patterns: string[]) => {
							patterns.filter(isValidRegex)
							setErrorFilters(patterns)
						}}
					/>
					<Button
						loading={editProjectLoading}
						trackingId="UpdateErrorFilters"
						htmlType="submit"
						type="primary"
						className={clsx(
							commonStyles.submitButton,
							styles.saveButton,
						)}
					>
						Save
					</Button>
				</div>
			</form>
		</FieldsBox>
	)
}
