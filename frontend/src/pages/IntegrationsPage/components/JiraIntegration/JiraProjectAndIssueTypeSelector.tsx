import Select, { OptionType } from '@components/Select/Select'
import { Form, Text } from '@highlight-run/ui'
import { useJiraIntegration } from '@pages/IntegrationsPage/components/JiraIntegration/utils'
import * as style from '@pages/IntegrationsPage/components/style.css'
import { ContainerSelectionProps } from '@pages/IntegrationsPage/IssueTrackerIntegrations'
import { useEffect, useMemo, useState } from 'react'

const JiraProjectAndIssueTypeSelector: React.FC<ContainerSelectionProps> = ({
	setIssueTypeId,
	setIssueProjectId,
	disabled,
}) => {
	const { data } = useJiraIntegration()

	const jiraProjectsOptions = useMemo(() => {
		return (
			(data?.jira_projects || []).map((team: any) => ({
				value: team.id,
				id: team.id,
				displayValue: (
					<Text size="small" weight="medium">
						{team.name} ({team.key})
					</Text>
				),
			})) || []
		)
	}, [data?.jira_projects])

	const [selectedJiraProjectId, setJiraProjectId] = useState('')

	const [selectedJiraIssueTypeId, setJiraIssueTypeId] = useState('')

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
		displayValue: (
			<Text size="small" weight="medium">
				{issueType.name} - ({issueType.description})
			</Text>
		),
	}))

	useEffect(() => {
		setIssueProjectId && setIssueProjectId(selectedJiraProjectId)
	}, [selectedJiraProjectId, setIssueProjectId])

	useEffect(() => {
		setIssueTypeId && setIssueTypeId(selectedJiraIssueTypeId)
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
			<Form.NamedSection label="Jira Issue" name="jiraIssue">
				<Select
					aria-label="Issue Type"
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
