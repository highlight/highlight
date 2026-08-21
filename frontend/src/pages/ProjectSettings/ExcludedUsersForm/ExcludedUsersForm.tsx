import { IconAnimatedLoading } from '@components/Loading/Loading'
import { toast } from '@components/Toaster'
import { useGetIdentifierSuggestionsQuery } from '@graph/hooks'
import {
	Box,
	Form,
	Select,
	type SelectOption,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import { useParams } from '@util/react-router/useParams'
import { useState, type ReactNode } from 'react'

import BorderBox from '@/components/BorderBox/BorderBox'
import BoxLabel from '@/components/BoxLabel/BoxLabel'
import { useProjectSettingsContext } from '@/pages/ProjectSettings/ProjectSettingsContext/ProjectSettingsContext'
import * as styles from './ExcludedUsersForm.css'

const renderHighlightedSuggestion = (value: string, query: string) => {
	if (!query) {
		return value
	}

	const lowerValue = value.toLowerCase()
	const lowerQuery = query.toLowerCase()
	const parts: ReactNode[] = []
	let startIndex = 0
	let matchIndex = lowerValue.indexOf(lowerQuery, startIndex)

	while (matchIndex !== -1) {
		if (matchIndex > startIndex) {
			parts.push(value.slice(startIndex, matchIndex))
		}

		const matchedText = value.slice(matchIndex, matchIndex + query.length)
		parts.push(
			<Text
				key={`${matchIndex}-${parts.length}`}
				as="mark"
				cssClass={styles.highlightMatch}
			>
				{matchedText}
			</Text>,
		)

		startIndex = matchIndex + query.length
		matchIndex = lowerValue.indexOf(lowerQuery, startIndex)
	}

	if (startIndex < value.length) {
		parts.push(value.slice(startIndex))
	}

	return <>{parts}</>
}

export const ExcludedUsersForm = () => {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const [identifierSearchQuery, setIdentifierSearchQuery] = useState('')
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
		return (
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				py="12"
			>
				<IconAnimatedLoading />
			</Box>
		)
	}

	const identifierSuggestions = identifierSuggestionsLoading
		? []
		: (identifierSuggestionsApiResponse?.identifier_suggestion || []).map(
				(suggestion) => ({
					name: suggestion,
					value: suggestion,
				}),
			)

	const handleIdentifierSearch = (query = '') => {
		setIdentifierSearchQuery(query)
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
							value={data?.projectSettings?.excluded_users || []}
							resultsLoading={identifierSuggestionsLoading}
							onSearchValueChange={handleIdentifierSearch}
							renderOption={(option) =>
								renderHighlightedSuggestion(
									String(option.name),
									identifierSearchQuery,
								)
							}
							options={identifierSuggestions}
							onValueChange={(excluded: SelectOption[]) => {
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
