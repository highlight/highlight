import Select from '@components/Select/Select'
import { useLinearIntegration } from '@pages/IntegrationsPage/components/LinearIntegration/utils'
import { ContainerSelectionProps } from '@pages/IntegrationsPage/IssueTrackerIntegrations'
import useLocalStorage from '@rehooks/local-storage'
import { Form } from 'antd'
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

	const [selectedlinearTeamId, setLinearTeamId] = useLocalStorage(
		'highlight-linear-default-team',
		'',
	)

	useEffect(() => {
		setSelectionId(selectedlinearTeamId)
	}, [selectedlinearTeamId, setSelectionId])

	useEffect(() => {
		if (selectedlinearTeamId === '' && linearTeamsOptions.length > 0) {
			setLinearTeamId(linearTeamsOptions[0].value)
		}
	}, [selectedlinearTeamId, linearTeamsOptions, setLinearTeamId])

	return (
		<Form.Item label={`Linear Team`}>
			<Select
				aria-label={`Linear Team`}
				placeholder={`Choose a team to create the issue in`}
				options={linearTeamsOptions}
				onChange={setLinearTeamId}
				value={selectedlinearTeamId}
				notFoundContent={<p>No teams found</p>}
			/>
		</Form.Item>
	)
}

export default LinearTeamSelector
