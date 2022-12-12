import { FieldsBox } from '@components/FieldsBox/FieldsBox'
import { CircularSpinner, LoadingBar } from '@components/Loading/Loading'
import Select from '@components/Select/Select'
import TextHighlighter from '@components/TextHighlighter/TextHighlighter'
import {
	useEditProjectMutation,
	useGetIdentifierSuggestionsQuery,
	useGetProjectQuery,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import classNames from 'classnames/bind'
import React, { useEffect, useState } from 'react'

import commonStyles from '../../../Common.module.scss'
import Button from '../../../components/Button/Button/Button'
import styles from './ExcludedUsersForm.module.scss'

export const ExcludedUsersForm = () => {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const [excludedUsers, setExcludedUsers] = useState<string[]>([])
	const [identifierQuery, setIdentifierQuery] = useState('')
	const [invalidExcludedUsers, setInvalidExcludedUsers] = useState<string[]>(
		[],
	)
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

	const {
		refetch: refetchIdentifierSuggestions,
		loading: identifierSuggestionsLoading,
		data: identifierSuggestionsApiResponse,
	} = useGetIdentifierSuggestionsQuery({
		variables: {
			project_id,
			query: '',
		},
	})

	const onSubmit = (e: { preventDefault: () => void }) => {
		e.preventDefault()
		editProject({
			variables: {
				id: project_id,
				excluded_users: excludedUsers,
			},
		}).then(() => {
			if (invalidExcludedUsers.length == 0) {
				message.success('Updated excluded sessions!', 5)
			} else {
				message.warn(
					'Updated excluded sessions, but the following were ignored: ' +
						JSON.stringify(invalidExcludedUsers),
				)
			}
		})
	}

	useEffect(() => {
		if (!loading) {
			setExcludedUsers(data?.project?.excluded_users || [])
		}
	}, [data?.project?.excluded_users, loading])

	if (loading) {
		return <LoadingBar />
	}

	const identifierSuggestions = identifierSuggestionsLoading
		? []
		: (identifierSuggestionsApiResponse?.identifier_suggestion || []).map(
				(suggestion) => ({
					value: suggestion,
					displayValue: (
						<TextHighlighter
							searchWords={[identifierQuery]}
							textToHighlight={suggestion}
						/>
					),
					id: suggestion,
				}),
		  )

	const handleIdentifierSearch = (query = '') => {
		setIdentifierQuery(query)
		refetchIdentifierSuggestions({ query, project_id })
	}

	return (
		<FieldsBox id="users">
			<h3>Excluded Sessions</h3>
			<form onSubmit={onSubmit} key={project_id}>
				<p>
					Enter user identifiers or emails to hide (regular
					expressions are accepted). On completion, sessions from
					these users will be excluded from your searches and quota.
				</p>
				<div className={styles.inputAndButtonRow}>
					<Select
						mode="tags"
						placeholder=".*@yourdomain.com"
						defaultValue={
							data?.project?.excluded_users || undefined
						}
						onSearch={handleIdentifierSearch}
						options={identifierSuggestions}
						onChange={(excluded: string[]) => {
							const validRegexes: string[] = []
							const invalidRegexes: string[] = []
							excluded.forEach((expression) => {
								try {
									new RegExp(expression)
									validRegexes.push(expression)
								} catch (e) {
									invalidRegexes.push(expression)
								}
							})
							if (
								excluded.length > 0 &&
								invalidRegexes.length > 0 &&
								excluded[excluded.length - 1] ===
									invalidRegexes[invalidRegexes.length - 1]
							) {
								message.error(
									"'" +
										excluded[excluded.length - 1] +
										"' is not a valid regular expression",
									5,
								)
							}
							setExcludedUsers(validRegexes)
							setInvalidExcludedUsers(invalidRegexes)
							handleIdentifierSearch('')
						}}
					/>
					<Button
						trackingId="ExcludedUsersUpdate"
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
				{invalidExcludedUsers.length > 0 && <div></div>}
			</form>
		</FieldsBox>
	)
}
