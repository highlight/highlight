import { ComboboxSelect, Form } from '@highlight-run/ui/components'
import React, { useState } from 'react'

import { useSearchIssuesLazyQuery } from '@/graph/generated/hooks'
import { IntegrationType } from '@/graph/generated/schemas'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { IssueTrackerIntegration } from '@/pages/IntegrationsPage/IssueTrackerIntegrations'

import styles from './SearchIssues.module.css'
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
	const [selectedOption, setSelectOption] = React.useState<
		SearchOption | undefined
	>({
		label: '',
		value: '',
		id: '',
		url: '',
	})
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
		() => options.map((o) => ({ key: o.value, render: o.label })),
		[options],
	)

	return (
		<Form.NamedSection label="Link an issue" name="issue_id">
			<ComboboxSelect
				label="Search Issues"
				queryPlaceholder="Search Issues"
				value={selectedOption?.value}
				options={comboboxOptions}
				onChange={(value: string) => {
					const option = options.find((o) => o.value === value)
					if (option) {
						onSelect(option)
						setSelectOption(option)
					}
				}}
				onQueryChange={setQuery}
				loading={loading}
				emptyStateRender={<span>No issues found</span>}
				cssClass={styles.select}
				autoFocus
			/>
		</Form.NamedSection>
	)
}
