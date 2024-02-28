import Select from '@components/Select/Select'
import { Form } from '@highlight-run/ui/components'
import { useGitlabIntegration } from '@pages/IntegrationsPage/components/GitlabIntegration/utils'
import * as style from '@pages/IntegrationsPage/components/style.css'
import { ContainerSelectionProps } from '@pages/IntegrationsPage/IssueTrackerIntegrations'
import { useEffect, useMemo } from 'react'
import { useLocalStorage } from 'react-use'

import { GitlabProject } from '@/graph/generated/schemas'

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
			<Form.NamedSection label="GitLab Project" name="gitlabProject">
				<Select
					aria-label="GitLab Project"
					placeholder="Choose a project to create the issue in"
					options={gitlabProjectOptions}
					onChange={setGitlabProjectId}
					value={selectedGitlabProjectId}
					notFoundContent={<p>No projects found</p>}
					className={style.selectContainer}
					disabled={disabled}
				/>
			</Form.NamedSection>
		</>
	)
}

export default GitlabProjectAndIssueTypeSelector
