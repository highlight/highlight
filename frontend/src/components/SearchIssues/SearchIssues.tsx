import { ComboboxSelect, Form, Text } from '@highlight-run/ui/components'
import React, { useState } from 'react'

import { useSearchIssuesLazyQuery } from '@/graph/generated/hooks'
import { IntegrationType } from '@/graph/generated/schemas'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { IssueTrackerIntegration } from '@/pages/IntegrationsPage/IssueTrackerIntegrations'

export interface SearchOption {
	value: string
	label: string
	id: string
	url: string
}

export interface SearchIssuesProps {
	onSelect: (option: SearchOption) => void
	integration: IssueTrackerIntegration
	project_id: string
}

export const SearchIssues = ({
	onSelect,
	integration,
	project_id,
}: SearchIssuesProps) => {
	const [selectedValue, setSelectedValue] = useState<string | undefined>(
		undefined,
	)
	const [query, setQuery] = useState<string>('')

	const debouncedQuery = useDebouncedValue(query) || ''
	const [searchIssues, { data, loading }] = useSearchIssuesLazyQuery()

	React.useEffect(() => {
		debouncedQuery &&
			searchIssues({
				variables: {
					project_id,
					query: debouncedQuery,
					integration_type: integration.name as IntegrationType,
				},
				fetchPolicy: 'no-cache',
			})
	}, [searchIssues, project_id, debouncedQuery, integration])

	const options = React.useMemo(() => {
		return (
			data?.search_issues.map((s) => ({
				id: s.id,
				url: s.issue_url,
				value: s.issue_url,
				label: s.title,
			})) || []
		)
	}, [data]) as SearchOption[]

	const comboboxOptions = React.useMemo(
		() =>
			options.map((o) => ({
				key: o.value,
				render: <Text size="small">{o.label}</Text>,
			})),
		[options],
	)

	return (
		<Form.NamedSection label="Link an issue" name="issue_id">
			<ComboboxSelect
				label="Search Issues"
				value={selectedValue}
				options={comboboxOptions}
				onChange={(newValue: string) => {
					const option = options.find((o) => o.value === newValue)
					if (option) {
						onSelect(option)
						setSelectedValue(option.value)
					}
				}}
				onChangeQuery={setQuery}
				queryPlaceholder="Search Issues"
				loadingRender={loading ? <Text>Loading...</Text> : undefined}
				emptyStateRender={<Text>No issues found</Text>}
			/>
		</Form.NamedSection>
	)
}
