import { Form } from '@highlight-run/ui/components'
import { useJiraIntegration } from '@pages/IntegrationsPage/components/JiraIntegration/utils'
import { ContainerSelectionProps } from '@pages/IntegrationsPage/IssueTrackerIntegrations'
import useLocalStorage from '@rehooks/local-storage'
import { useEffect, useMemo } from 'react'

import { OptionDropdown } from '@/pages/Graphing/OptionDropdown'

const JiraProjectAndIssueTypeSelector: React.FC<ContainerSelectionProps> = ({
	setSelectionId,
	setIssueTypeId,
	disabled,
}) => {
	const { data } = useJiraIntegration()

	const jiraProjectsOptions = useMemo(() => {
		return (
			(data?.jira_projects || []).map((team: any) => ({
				value: team.id,
				id: team.id,
				displayValue: `${team.name} (${team.key})`,
			})) || []
		)
	}, [data?.jira_projects])

	const [selectedJiraProjectId, setJiraProjectId] = useLocalStorage(
		'highlight-jira-default-project',
		'',
	)
	const [selectedJiraIssueTypeId, setJiraIssueTypeId] = useLocalStorage(
		'highlight-jira-default-issue-type',
		'',
	)

	const selectedJiraProject = selectedJiraProjectId
		? (data?.jira_projects || []).find(
				(p) => p.id === selectedJiraProjectId,
		  )
		: null

	const jiraIssueTypeOptions = (selectedJiraProject?.issueTypes || []).map(
		(issueType: any) => ({
			value: issueType.id,
			id: issueType.id,
			displayValue: `${issueType.name} - (${issueType.description})`,
		}),
	)

	useEffect(() => {
		selectedJiraProjectId && setSelectionId(selectedJiraProjectId)
	}, [selectedJiraProjectId, setSelectionId])

	useEffect(() => {
		if (!selectedJiraProjectId && jiraProjectsOptions.length > 0) {
			setJiraProjectId(jiraProjectsOptions[0].value)
		}
	}, [selectedJiraProjectId, jiraProjectsOptions, setJiraProjectId])

	useEffect(() => {
		setIssueTypeId &&
			selectedJiraIssueTypeId &&
			setIssueTypeId(selectedJiraIssueTypeId)
	}, [selectedJiraIssueTypeId, setIssueTypeId])

	return (
		<>
			<Form.NamedSection label="Project" name="jiraProject">
				<OptionDropdown
					options={jiraProjectsOptions.map((o) => o.id)}
					labels={jiraProjectsOptions.map((o) => o.displayValue)}
					selection={selectedJiraProjectId}
					setSelection={setJiraProjectId}
					disabled={disabled}
				/>
			</Form.NamedSection>
			<Form.NamedSection label="Issue Type" name="jiraIssue">
				<OptionDropdown
					options={jiraIssueTypeOptions.map((o) => o.id)}
					labels={jiraIssueTypeOptions.map((o) => o.displayValue)}
					selection={selectedJiraIssueTypeId}
					setSelection={setJiraIssueTypeId}
					disabled={disabled}
				/>
			</Form.NamedSection>
		</>
	)
}

export default JiraProjectAndIssueTypeSelector
