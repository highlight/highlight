import { LoadingBar } from '@components/Loading/Loading'
import Select from '@components/Select/Select'
import TextHighlighter from '@components/TextHighlighter/TextHighlighter'
import { useGetIdentifierSuggestionsQuery } from '@graph/hooks'
import { Form, Stack } from '@highlight-run/ui/components'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import { useState } from 'react'

import BorderBox from '@/components/BorderBox/BorderBox'
import BoxLabel from '@/components/BoxLabel/BoxLabel'
import { useProjectSettingsContext } from '@/pages/ProjectSettings/ProjectSettingsContext/ProjectSettingsContext'

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
		<BorderBox>
			<Form>
				<Stack gap="8">
					<BoxLabel
						label="Excluded users"
						info="
					Enter user identifiers or emails to filter (regular
					expressions are accepted). On completion, sessions from
					these users will be excluded from your searches and quota."
					/>
					<Form.NamedSection
						label="Filtered users"
						name="Filtered users"
					>
						<Select
							mode="tags"
							placeholder=".*@yourdomain.com"
							value={
								data?.projectSettings?.excluded_users ||
								undefined
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
										invalidRegexes[
											invalidRegexes.length - 1
										]
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
								setAllProjectSettings(
									(currentProjectSettings) =>
										currentProjectSettings?.projectSettings
											? {
													projectSettings: {
														...currentProjectSettings.projectSettings,
														excluded_users:
															validRegexes,
													},
											  }
											: currentProjectSettings,
								)
							}}
						/>
					</Form.NamedSection>
					{invalidExcludedUsers.length > 0 && <div></div>}
				</Stack>
			</Form>
		</BorderBox>
	)
}
