import Select from '@components/Select/Select'
import { Form, Text } from '@highlight-run/ui/components'
import { useJiraIntegration } from '@pages/IntegrationsPage/components/JiraIntegration/utils'
import * as style from '@pages/IntegrationsPage/components/style.css'
import { ContainerSelectionProps } from '@pages/IntegrationsPage/IssueTrackerIntegrations'
import { useEffect, useMemo } from 'react'
import { useLocalStorage } from 'react-use'

const JiraProjectAndIssueTypeSelector: React.FC<ContainerSelectionProps> = ({
	setSelectionId,
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

	const [selectedJiraProjectId, setJiraProjectId] = useLocalStorage(
		'highlight-jira-default-project',
		'',
	)

	useEffect(() => {
		selectedJiraProjectId && setSelectionId(selectedJiraProjectId)
	}, [selectedJiraProjectId, setSelectionId])

	useEffect(() => {
		if (!selectedJiraProjectId && jiraProjectsOptions.length > 0) {
			setJiraProjectId(jiraProjectsOptions[0].value)
		}
	}, [selectedJiraProjectId, jiraProjectsOptions, setJiraProjectId])

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
		</>
	)
}

export default JiraProjectAndIssueTypeSelector
