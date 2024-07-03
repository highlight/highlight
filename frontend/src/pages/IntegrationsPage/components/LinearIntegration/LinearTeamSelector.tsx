import { Form } from '@highlight-run/ui/components'
import { useLinearIntegration } from '@pages/IntegrationsPage/components/LinearIntegration/utils'
import { ContainerSelectionProps } from '@pages/IntegrationsPage/IssueTrackerIntegrations'
import useLocalStorage from '@rehooks/local-storage'
import { useEffect, useMemo } from 'react'

import { OptionDropdown } from '@/pages/Graphing/OptionDropdown'

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
		<Form.NamedSection label="Team" name="linearTeam">
			<OptionDropdown
				options={linearTeamsOptions.map((o) => o.id)}
				labels={linearTeamsOptions.map((o) => o.displayValue)}
				selection={selectedLinearTeamId}
				setSelection={setLinearTeamId}
				disabled={disabled}
			/>
		</Form.NamedSection>
	)
}

export default LinearTeamSelector
