import Select, { OptionType } from '@components/Select/Select'
import { Form, Text } from '@highlight-run/ui'
import { useJiraIntegration } from '@pages/IntegrationsPage/components/JiraIntegration/utils'
import * as style from '@pages/IntegrationsPage/components/style.css'
import { ContainerSelectionProps } from '@pages/IntegrationsPage/IssueTrackerIntegrations'
import { useEffect, useMemo, useState } from 'react'
// TODO: Figure out what to do with this
const JiraTeamSelector: React.FC<ContainerSelectionProps> = ({
	setIssueTypeId,
	setIssueProjectId,
	disabled,
}) => {
	const { data } = useJiraIntegration()

	// const jira_projects = data?.jira_projects || []
	// const jiraIssueTypeOptions: OptionType[] = []

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
	// useLocalStorage('highlight-jira-default-team', '')

	const [selectedJiraIssueTypeId, setJiraIssueTypeId] = useState('')
	// useLocalStorage('highlight-jira-default-issue-type', '')

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
		console.log('SETTING ISSUE Project ID', selectedJiraProjectId)
		setIssueProjectId && setIssueProjectId(selectedJiraProjectId)
	}, [selectedJiraProjectId, setIssueProjectId])

	useEffect(() => {
		console.log('SETTING ISSUE Project ID', selectedJiraIssueTypeId)
		setIssueTypeId && setIssueTypeId(selectedJiraIssueTypeId)
	}, [selectedJiraIssueTypeId, setIssueTypeId])

	// useEffect(() => {
	// 	if (jiraProjectsOptions.length > 0) {
	// 		if (selectedJiraProjectId === '') {
	// 			setJiraProjectId(jiraProjectsOptions[0].value)
	// 		}
	// 	} else {
	// 		removeJiraProjectId()
	// 	}
	// }, [
	// 	selectedJiraProjectId,
	// 	jiraProjectsOptions,
	// 	setJiraProjectId,
	// 	removeJiraProjectId,
	// ])

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

export default JiraTeamSelector
