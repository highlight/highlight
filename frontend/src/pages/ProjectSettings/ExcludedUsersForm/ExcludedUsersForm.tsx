import { FieldsBox } from '@components/FieldsBox/FieldsBox'
import { LoadingBar } from '@components/Loading/Loading'
import Select from '@components/Select/Select'
import TextHighlighter from '@components/TextHighlighter/TextHighlighter'
import { useGetIdentifierSuggestionsQuery } from '@graph/hooks'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import React, { useState } from 'react'

import { useProjectSettingsContext } from '@/pages/ProjectSettings/ProjectSettingsContext/ProjectSettingsContext'

import styles from './ExcludedUsersForm.module.scss'

export const ExcludedUsersForm = () => {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const [identifierQuery, setIdentifierQuery] = useState('')
	const [invalidExcludedUsers, setInvalidExcludedUsers] = useState<string[]>(
		[],
	)
	const {
		allProjectSettings: data,
		loading,
		setAllProjectSettings,
	} = useProjectSettingsContext()

	const {
		refetch: refetchIdentifierSuggestions,
		loading: identifierSuggestionsLoading,
		data: identifierSuggestionsApiResponse,
	} = useGetIdentifierSuggestionsQuery({
		variables: {
			project_id: project_id!,
			query: '',
		},
		skip: !project_id,
	})

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
			<form key={project_id}>
				<p>
					Enter user identifiers or emails to hide (regular
					expressions are accepted). On completion, sessions from
					these users will be excluded from your searches and quota.
				</p>
				<div className={styles.inputAndButtonRow}>
					<Select
						mode="tags"
						placeholder=".*@yourdomain.com"
						value={
							data?.projectSettings?.excluded_users || undefined
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
							setInvalidExcludedUsers(invalidRegexes)
							handleIdentifierSearch('')
							setAllProjectSettings((currentProjectSettings) =>
								currentProjectSettings?.projectSettings
									? {
											projectSettings: {
												...currentProjectSettings.projectSettings,
												excluded_users: validRegexes,
											},
									  }
									: currentProjectSettings,
							)
						}}
					/>
				</div>
				{invalidExcludedUsers.length > 0 && <div></div>}
			</form>
		</FieldsBox>
	)
}
