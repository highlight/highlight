import { LoadingBar } from '@components/Loading/Loading'
import TextHighlighter from '@components/TextHighlighter/TextHighlighter'
import { toast } from '@components/Toaster'
import { useGetIdentifierSuggestionsQuery } from '@graph/hooks'
import { Form, Select, Stack } from '@highlight-run/ui/components'
import { useParams } from '@util/react-router/useParams'
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
					name: (
						<TextHighlighter
							searchWords={[identifierQuery]}
							textToHighlight={suggestion}
						/>
					) as unknown as string,
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
							creatable
							customFilterable
							displayMode="tags"
							placeholder=".*@yourdomain.com"
							value={
								data?.projectSettings?.excluded_users ||
								undefined
							}
							onSearchValueChange={handleIdentifierSearch}
							options={identifierSuggestions}
							onValueChange={(
								excluded: { value: string | number }[],
							) => {
								const excludedValues = excluded.map((option) =>
									String(option.value),
								)
								const validRegexes: string[] = []
								const invalidRegexes: string[] = []
								excludedValues.forEach((expression) => {
									try {
										new RegExp(expression)
										validRegexes.push(expression)
									} catch (e) {
										invalidRegexes.push(expression)
									}
								})
								if (
									excludedValues.length > 0 &&
									invalidRegexes.length > 0 &&
									excludedValues[
										excludedValues.length - 1
									] ===
										invalidRegexes[
											invalidRegexes.length - 1
										]
								) {
									toast.error(
										"'" +
											excludedValues[
												excludedValues.length - 1
											] +
											"' is not a valid regular expression",
										{ duration: 5000 },
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
