import { Form } from '@highlight-run/ui/components'
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
	>({ label: '', value: '', id: '', url: '' })
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

	return (
		<Form.NamedSection label="Link an issue" name="issue_id">
			<select
				className={styles.select}
				autoFocus
				value={selectedOption?.value || ''}
				onChange={(e) => {
					const option = options.find((o) => o.value === e.target.value)
					if (option) {
						onSelect(option)
						setSelectOption(option)
					}
				}}
			>
				<option value="" disabled>
					Search Issues
				</option>
				{loading && (
					<option disabled>Loading...</option>
				)}
				{!loading && options.length === 0 && debouncedQuery && (
					<option disabled>No issues found</option>
				)}
				{options.map((o) => (
					<option key={o.id} value={o.value}>
						{o.label}
					</option>
				))}
			</select>
			<input
				className={styles.select}
				placeholder="Search Issues"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
			/>
		</Form.NamedSection>
	)
}
