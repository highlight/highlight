import { LoadingBar } from '@components/Loading/Loading'
import { toast } from '@components/Toaster'
import { useGetIdentifierSuggestionsQuery } from '@graph/hooks'
import {
	Form,
	Select,
	SelectOption,
	Stack,
} from '@highlight-run/ui/components'
import { useParams } from '@util/react-router/useParams'
import { useState } from 'react'

import BorderBox from '@/components/BorderBox/BorderBox'
import BoxLabel from '@/components/BoxLabel/BoxLabel'
import { useProjectSettingsContext } from '@/pages/ProjectSettings/ProjectSettingsContext/ProjectSettingsContext'

const partitionExcludedExpressions = (
	excluded: string[],
): { validRegexes: string[]; invalidRegexes: string[] } => {
	const validRegexes: string[] = []
	const invalidRegexes: string[] = []
	excluded.forEach((expression) => {
		try {
			new RegExp(expression)
			validRegexes.push(expression)
		} catch {
			invalidRegexes.push(expression)
		}
	})
	return { validRegexes, invalidRegexes }
}

const notifyIfLatestExcludedInvalid = (
	excluded: string[],
	invalidRegexes: string[],
) => {
	const latestExpression = excluded[excluded.length - 1]
	const latestInvalid = invalidRegexes[invalidRegexes.length - 1]
	if (!latestExpression || !latestInvalid) {
		return
	}
	if (latestExpression === latestInvalid) {
		toast.error(`'${latestExpression}' is not a valid regular expression`, {
			duration: 5000,
		})
	}
}

const mapIdentifierSuggestions = (
	loading: boolean,
	suggestions?: string[],
): SelectOption[] => {
	if (loading || !suggestions) {
		return []
	}
	return suggestions.map((suggestion) => ({
		name: suggestion,
		value: suggestion,
		id: suggestion,
	}))
}

export const ExcludedUsersForm = () => {
	const { project_id } = useParams<{
		project_id: string
	}>()
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

	const identifierSuggestions = mapIdentifierSuggestions(
		identifierSuggestionsLoading,
		identifierSuggestionsApiResponse?.identifier_suggestion,
	)

	const handleIdentifierSearch = (query = '') => {
		refetchIdentifierSuggestions({ query, project_id })
	}

	const handleExcludedUsersChange = (options: SelectOption[]) => {
		const excluded = options.map((option) => String(option.value))
		const { validRegexes, invalidRegexes } =
			partitionExcludedExpressions(excluded)
		notifyIfLatestExcludedInvalid(excluded, invalidRegexes)
		setInvalidExcludedUsers(invalidRegexes)
		handleIdentifierSearch('')
		setAllProjectSettings((currentProjectSettings) => {
			if (!currentProjectSettings?.projectSettings) {
				return currentProjectSettings
			}
			return {
				projectSettings: {
					...currentProjectSettings.projectSettings,
					excluded_users: validRegexes,
				},
			}
		})
	}

	const excludedUsersValue = data?.projectSettings?.excluded_users ?? []

	return (
		<BorderBox>
			<Form>
				<Stack gap="8">
					<BoxLabel
						label="Excluded users"
						info="Enter user identifiers or emails to filter (regular expressions are accepted). On completion, sessions from these users will be excluded from your searches and quota."
					/>
					<Form.NamedSection
						label="Filtered users"
						name="Filtered users"
					>
						<Select
							creatable
							filterable
							displayMode="tags"
							loading={identifierSuggestionsLoading}
							placeholder=".*@yourdomain.com"
							value={excludedUsersValue}
							onSearchValueChange={handleIdentifierSearch}
							options={identifierSuggestions}
							onValueChange={handleExcludedUsersChange}
						/>
					</Form.NamedSection>
					{invalidExcludedUsers.length > 0 && <div></div>}
				</Stack>
			</Form>
		</BorderBox>
	)
}
