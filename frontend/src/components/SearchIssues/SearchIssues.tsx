import { Form } from '@highlight-run/ui/components'
import { Select } from 'antd'
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

	return (
		<Form.NamedSection label="Link an issue" name="issue_id">
			<Select
				className={styles.select}
				// this mode allows using the select component as a single searchable input
				// @ts-ignore
				placeholder="Search Issues"
				autoFocus
				size="middle"
				// @ts-ignore
				onSelect={(newValue: string) => {
					const option = options.find((o) => o.value === newValue)
					if (option) {
						onSelect(option)
						setSelectOption(option)
					}
				}}
				defaultValue={selectedOption as unknown as SearchOption}
				options={options}
				notFoundContent={<span>`No issues found`</span>}
				filterOption={false}
				loading={loading}
				onSearch={setQuery}
				showSearch
				showArrow={loading}
			/>
		</Form.NamedSection>
	)
}
