import { Form, Select as UiSelect, SelectOption } from '@highlight-run/ui/components'
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

	const options: SelectOption[] = React.useMemo(() => {
		return (
			data?.search_issues.map((s) => ({
				name: s.title,
				value: s.issue_url,
			})) || []
		)
	}, [data])

	return (
		<Form.NamedSection label="Link an issue" name="issue_id">
			<UiSelect
				value={selectedOption?.value}
				options={options}
				onValueChange={(newValue) => {
					const option = data?.search_issues.find(
						(s) => s.issue_url === (typeof newValue === 'string' ? newValue : newValue?.value),
					)
					if (option) {
						const searchOption: SearchOption = {
							id: option.id,
							url: option.issue_url,
							value: option.issue_url,
							label: option.title,
						}
						onSelect(searchOption)
						setSelectOption(searchOption)
					}
				}}
				filterable
				onSearchValueChange={setQuery}
				loading={loading}
				resultsLoading={loading}
			>
				<UiSelect.SelectTrigger className={styles.select}>
					Search Issues
				</UiSelect.SelectTrigger>
				<UiSelect.Popover>
					{options.length === 0 ? (
						<span>No issues found</span>
					) : (
						options.map((option) => (
							<UiSelect.Option
								key={option.value}
								value={option.value}
							>
								{option.name}
							</UiSelect.Option>
						))
					)}
				</UiSelect.Popover>
			</UiSelect>
		</Form.NamedSection>
	)
}
