import { Form } from '@highlight-run/ui/components'
import { useGitlabIntegration } from '@pages/IntegrationsPage/components/GitlabIntegration/utils'
import { ContainerSelectionProps } from '@pages/IntegrationsPage/IssueTrackerIntegrations'
import useLocalStorage from '@rehooks/local-storage'
import { useEffect, useMemo } from 'react'

import { GitlabProject } from '@/graph/generated/schemas'
import { OptionDropdown } from '@/pages/Graphing/OptionDropdown'

const GitlabProjectAndIssueTypeSelector: React.FC<ContainerSelectionProps> = ({
	setSelectionId,
	disabled,
}) => {
	const { data } = useGitlabIntegration()

	const gitlabProjectOptions = useMemo(() => {
		return (
			(data?.gitlab_projects || []).map((team: GitlabProject) => ({
				value: team.id.toString(),
				id: team.id.toString(),
				displayValue: team.nameWithNameSpace,
			})) || []
		)
	}, [data?.gitlab_projects])

	const [selectedGitlabProjectId, setGitlabProjectId] = useLocalStorage(
		'highlight-gitlab-default-project',
		'',
	)

	useEffect(() => {
		selectedGitlabProjectId && setSelectionId(selectedGitlabProjectId)
	}, [selectedGitlabProjectId, setSelectionId])

	return (
		<>
			<Form.NamedSection label="Project" name="gitlabProject">
				<OptionDropdown
					options={gitlabProjectOptions.map((o) => o.id)}
					labels={gitlabProjectOptions.map((o) => o.displayValue)}
					selection={selectedGitlabProjectId}
					setSelection={setGitlabProjectId}
					disabled={disabled}
				/>
			</Form.NamedSection>
		</>
	)
}

export default GitlabProjectAndIssueTypeSelector
