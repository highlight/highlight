import { LoadingBar } from '@components/Loading/Loading'
import { toast } from '@components/Toaster'
import { useGetIdentifierSuggestionsQuery } from '@graph/hooks'
import { Box, Form, Stack, Input, Text } from '@highlight-run/ui/components'
import { useParams } from '@util/react-router/useParams'
import React, { useState } from 'react'

import BorderBox from '@/components/BorderBox/BorderBox'
import BoxLabel from '@/components/BoxLabel/BoxLabel'
import { Button } from '@/components/Button'
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
		: identifierSuggestionsApiResponse?.identifier_suggestion || []

	const excludedUsers = data?.projectSettings?.excluded_users || []

	const handleIdentifierSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		const query = e.target.value
		setIdentifierQuery(query)
		refetchIdentifierSuggestions({ query, project_id })
	}

	const handleAdd = () => {
		if (!identifierQuery || excludedUsers.includes(identifierQuery)) return

		try {
			new RegExp(identifierQuery)
			updateExcluded([...excludedUsers, identifierQuery])
			setIdentifierQuery('')
			setInvalidExcludedUsers([])
		} catch (e) {
			setInvalidExcludedUsers([identifierQuery])
			toast.error(
				`'${identifierQuery}' is not a valid regular expression`,
				{ duration: 5000 },
			)
		}
	}

	const handleRemove = (userToRemove: string) => {
		updateExcluded(excludedUsers.filter((u) => u !== userToRemove))
	}

	const updateExcluded = (newExcluded: string[]) => {
		setAllProjectSettings((current) =>
			current?.projectSettings
				? {
						projectSettings: {
							...current.projectSettings,
							excluded_users: newExcluded,
						},
					}
				: current,
		)
	}

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
						<Stack direction="row" gap="8" align="center">
							<Input
								name="excludedUser"
								placeholder=".*@yourdomain.com"
								value={identifierQuery}
								onChange={handleIdentifierSearch}
								onKeyDown={(
									e: React.KeyboardEvent<HTMLInputElement>,
								) => {
									if (e.key === 'Enter') {
										e.preventDefault()
										handleAdd()
									}
								}}
								list="identifier-suggestions"
							/>
							<datalist id="identifier-suggestions">
								{identifierSuggestions.map((suggestion) => (
									<option
										key={suggestion}
										value={suggestion}
									/>
								))}
							</datalist>
							<Button
								onClick={handleAdd}
								size="small"
								kind="secondary"
								trackingId="excluded-user-add"
							>
								Add
							</Button>
						</Stack>

						{excludedUsers.length > 0 && (
							<Stack direction="row" gap="4" wrap="wrap" mt="8">
								{excludedUsers.map((user) => (
									<Box
										key={user}
										display="flex"
										alignItems="center"
										gap="4"
										p="4"
										border="secondary"
										borderRadius="4"
									>
										<Text>{user}</Text>
										<div
											style={{
												cursor: 'pointer',
												padding: '0 4px',
											}}
											onClick={() => handleRemove(user)}
										>
											✕
										</div>
									</Box>
								))}
							</Stack>
						)}
					</Form.NamedSection>
					{invalidExcludedUsers.length > 0 && <div></div>}
				</Stack>
			</Form>
		</BorderBox>
	)
}
