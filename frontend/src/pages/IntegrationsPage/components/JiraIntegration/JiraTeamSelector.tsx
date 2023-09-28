import Select from '@components/Select/Select'
import { Form, Text } from '@highlight-run/ui'
import { useJiraIntegration } from '@pages/IntegrationsPage/components/JiraIntegration/utils'
import * as style from '@pages/IntegrationsPage/components/style.css'
import { ContainerSelectionProps } from '@pages/IntegrationsPage/IssueTrackerIntegrations'
import useLocalStorage from '@rehooks/local-storage'
import { useEffect, useMemo } from 'react'

const JiraTeamSelector: React.FC<ContainerSelectionProps> = ({
	setSelectionId,
	disabled,
}) => {
	const { teams } = useJiraIntegration()

	const jiraTeamsOptions = useMemo(() => {
		return (
			teams?.map((team: any) => ({
				value: team.team_id,
				id: team.team_id,
				displayValue: (
					<Text size="small" weight="medium">
						{team.name} ({team.key})
					</Text>
				),
			})) || []
		)
	}, [teams])

	const [selectedJiraTeamId, setJiraTeamId, removeJiraTeamId] =
		useLocalStorage('highlight-linear-default-team', '')

	useEffect(() => {
		setSelectionId(selectedJiraTeamId)
	}, [selectedJiraTeamId, setSelectionId])

	useEffect(() => {
		if (jiraTeamsOptions.length > 0) {
			if (selectedJiraTeamId === '') {
				setJiraTeamId(jiraTeamsOptions[0].value)
			}
		} else {
			removeJiraTeamId()
		}
	}, [selectedJiraTeamId, jiraTeamsOptions, setJiraTeamId, removeJiraTeamId])

	return (
		<Form.NamedSection label="Jira Team" name="linearTeam">
			<Select
				aria-label="Jira Team"
				placeholder="Choose a team to create the issue in"
				options={jiraTeamsOptions}
				onChange={setJiraTeamId}
				value={selectedJiraTeamId}
				notFoundContent={<p>No teams found</p>}
				className={style.selectContainer}
				disabled={disabled}
			/>
		</Form.NamedSection>
	)
}

export default JiraTeamSelector
