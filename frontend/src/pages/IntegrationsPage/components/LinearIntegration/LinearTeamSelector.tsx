import Select from '@components/Select/Select'
import { Form } from '@highlight-run/ui/components'
import { useLinearIntegration } from '@pages/IntegrationsPage/components/LinearIntegration/utils'
import * as style from '@pages/IntegrationsPage/components/style.css'
import { ContainerSelectionProps } from '@pages/IntegrationsPage/IssueTrackerIntegrations'
import useLocalStorage from '@rehooks/local-storage'
import { useEffect, useMemo } from 'react'

const LinearTeamSelector: React.FC<ContainerSelectionProps> = ({
	setSelectionId,
	disabled,
}) => {
	const { teams } = useLinearIntegration()

	const linearTeamsOptions = useMemo(() => {
		return (
			teams?.map((team) => ({
				value: team.team_id,
				id: team.team_id,
				displayValue: `${team.name} (${team.key})`,
			})) || []
		)
	}, [teams])

	const [selectedLinearTeamId, setLinearTeamId, removeLinearTeamId] =
		useLocalStorage('highlight-linear-default-team', '')

	useEffect(() => {
		setSelectionId(selectedLinearTeamId)
	}, [selectedLinearTeamId, setSelectionId])

	useEffect(() => {
		if (linearTeamsOptions.length > 0) {
			if (selectedLinearTeamId === '') {
				setLinearTeamId(linearTeamsOptions[0].value)
			}
		} else {
			removeLinearTeamId()
		}
	}, [
		selectedLinearTeamId,
		linearTeamsOptions,
		setLinearTeamId,
		removeLinearTeamId,
	])

	return (
		<Form.NamedSection label="Linear Team" name="linearTeam">
			<Select
				aria-label="Linear Team"
				placeholder="Choose a team to create the issue in"
				options={linearTeamsOptions}
				onChange={setLinearTeamId}
				value={selectedLinearTeamId}
				notFoundContent={<p>No teams found</p>}
				className={style.selectContainer}
				disabled={disabled}
			/>
		</Form.NamedSection>
	)
}

export default LinearTeamSelector
