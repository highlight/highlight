import { Form } from '@highlight-run/ui'
import { useLinearIntegration } from '@pages/IntegrationsPage/components/LinearIntegration/utils'
import { ContainerSelectionProps } from '@pages/IntegrationsPage/IssueTrackerIntegrations'
import useLocalStorage from '@rehooks/local-storage'
import { useEffect, useMemo } from 'react'

const LinearTeamSelector: React.FC<ContainerSelectionProps> = ({
	setSelectionId,
}) => {
	const { teams } = useLinearIntegration()

	const linearTeamsOptions = useMemo(() => {
		return (
			teams?.map((team) => ({
				value: team.team_id,
				id: team.team_id,
				displayValue: (
					<>
						{team.name} ({team.key})
					</>
				),
			})) || []
		)
	}, [teams])

	const [selectedLinearTeamId, setLinearTeamId] = useLocalStorage(
		'highlight-linear-default-team',
		'',
	)

	useEffect(() => {
		setSelectionId(selectedLinearTeamId)
	}, [selectedLinearTeamId, setSelectionId])

	useEffect(() => {
		if (selectedLinearTeamId === '' && linearTeamsOptions.length > 0) {
			setLinearTeamId(linearTeamsOptions[0].value)
		}
	}, [selectedLinearTeamId, linearTeamsOptions, setLinearTeamId])

	return (
		<Form.Select
			name="teamId"
			label="Linear Team"
			aria-label="Linear Team"
			placeholder="Choose a team to create the issue in"
			onChange={setLinearTeamId}
			value={selectedLinearTeamId}
			options={linearTeamsOptions}
			notFoundContent={<p>No teams found</p>}
			outline
		/>
	)
}

export default LinearTeamSelector
