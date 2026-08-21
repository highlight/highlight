import {
	useEditProjectSettingsMutation,
	useGetIdentifierSuggestionsQuery,
} from '@graph/hooks'
import {
	Box,
	Heading,
	Select,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import { useParams } from '@util/react-router/useParams'
import React, { useEffect, useState } from 'react'

import BorderBox from '@/components/BorderBox/BorderBox'
import { Button } from '@/components/Button'
import { LoadingBar } from '@components/Loading/Loading'
import TextHighlighter from '@/components/TextHighlighter/TextHighlighter'
import { toast } from '@/components/Toaster'
import { useProjectSettingsContext } from '@/pages/ProjectSettings/ProjectSettingsContext/ProjectSettingsContext'

export const ExcludedUsersForm = () => {
	const { project_id } = useParams<{ project_id: string }>()
	const {
		allProjectSettings: data,
		loading,
		setAllProjectSettings,
	} = useProjectSettingsContext()

	const [excludedUsers, setExcludedUsers] = useState<string[]>([])
	const [identifierQuery, setIdentifierQuery] = useState('')

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

	const [editProjectSettings, { loading: editLoading }] =
		useEditProjectSettingsMutation()

	useEffect(() => {
		if (data?.projectSettings?.excluded_users) {
			setExcludedUsers(data.projectSettings.excluded_users)
		}
	}, [data?.projectSettings?.excluded_users])

	const handleIdentifierSearch = (query = '') => {
		setIdentifierQuery(query)
		refetchIdentifierSuggestions({ query, project_id })
	}

	const onSave = (e: React.FormEvent) => {
		e.preventDefault()
		editProjectSettings({
			variables: {
				projectId: project_id!,
				excluded_users: excludedUsers,
			},
		}).then(() => {
			toast.success('Updated excluded sessions!', { duration: 5000 })
			setAllProjectSettings((current) =>
				current?.projectSettings
					? {
							projectSettings: {
								...current.projectSettings,
								excluded_users: excludedUsers,
							},
					  }
					: current,
			)
		})
	}

	const onDiscard = () => {
		setExcludedUsers(data?.projectSettings?.excluded_users || [])
	}

	const isDirty =
		JSON.stringify(excludedUsers) !==
		JSON.stringify(data?.projectSettings?.excluded_users || [])

	const identifierSuggestions = identifierSuggestionsLoading
		? []
		: (identifierSuggestionsApiResponse?.identifier_suggestion || [])

	return (
		<Box
			id="excluded-users"
			background="white"
			border="dividerWeak"
			borderRadius="8"
			p="24"
		>
			<Stack gap="16">
				<Stack gap="4">
					<Heading level="h4">Excluded sessions</Heading>
					<Text color="moderate">
						The sessions of users whose email or identifier matches
						any of the entries in this list will not be recorded.
					</Text>
				</Stack>

				{loading ? (
					<LoadingBar />
				) : (
					<Stack gap="16">
						<Box display="flex" flexDirection="column" gap="4">
							<Text weight="bold" size="small">
								Emails / Identifiers
							</Text>
							<Select
								placeholder="email@example.com, 1a2b3c, ..."
								value={excludedUsers.map((u) => ({
									name: u,
									value: u,
								}))}
								onValueChange={(v: any) => {
									const newUsers = Array.isArray(v)
										? v.map((o) => o.value)
										: v
										? [v.value]
										: []
									setExcludedUsers(newUsers)
									setAllProjectSettings((current) =>
										current?.projectSettings
											? {
													projectSettings: {
														...current.projectSettings,
														excluded_users:
															newUsers,
													},
											  }
											: current,
									)
								}}
								onSearchValueChange={(value: string) =>
									handleIdentifierSearch(value)
								}
								options={identifierSuggestions.map((s) => ({
									name: s,
									value: s,
								}))}
								creatable
								displayMode="tags"
							/>
						</Box>

						<Box
							background="raised"
							p="16"
							borderRadius="8"
							border="dividerWeak"
						>
							<Stack gap="8">
								<Text size="xSmall" color="moderate">
									Example regex patterns:
								</Text>
								<Stack gap="4">
									<Text size="xSmall" family="monospace">
										<TextHighlighter
											searchWords={['.*@highlight.io']}
											textToHighlight=".*@highlight.io - matches all emails ending in @highlight.io"
										/>
									</Text>
									<Text size="xSmall" family="monospace">
										<TextHighlighter
											searchWords={['^123$']}
											textToHighlight="^123$ - matches identifier '123' exactly"
										/>
									</Text>
								</Stack>
							</Stack>
						</Box>
					</Stack>
				)}
			</Stack>
		</Box>

	)
}
