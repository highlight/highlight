import Select, { OptionType } from '@components/Select/Select'
import { Form } from '@highlight-run/ui/components'
import { useJiraIntegration } from '@pages/IntegrationsPage/components/JiraIntegration/utils'
import * as style from '@pages/IntegrationsPage/components/style.css'
import { ContainerSelectionProps } from '@pages/IntegrationsPage/IssueTrackerIntegrations'
import { useEffect, useMemo } from 'react'
import { useLocalStorage } from 'react-use'

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

	const jiraIssueTypeOptions: OptionType[] = (
		selectedJiraProject?.issueTypes || []
	).map((issueType: any) => ({
		value: issueType.id,
		id: issueType.id,
		displayValue: `${issueType.name} - (${issueType.description})`,
	}))

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
			<Form.NamedSection label="Jira Project" name="jiraProject">
				<Select
					aria-label="Jira Project"
					placeholder="Choose a project to create the issue in"
					options={jiraProjectsOptions}
					onChange={setJiraProjectId}
					value={selectedJiraProjectId}
					notFoundContent={<p>No projects found</p>}
					className={style.selectContainer}
					disabled={disabled}
				/>
			</Form.NamedSection>
			<Form.NamedSection label="Jira Issue Type" name="jiraIssue">
				<Select
					aria-label="Jira Issue Type"
					placeholder="Choose an issue type"
					options={jiraIssueTypeOptions}
					onChange={setJiraIssueTypeId}
					value={selectedJiraIssueTypeId}
					notFoundContent={<p>No issue types found</p>}
					className={style.selectContainer}
					disabled={disabled}
				/>
			</Form.NamedSection>
		</>
	)
}

export default JiraProjectAndIssueTypeSelector
