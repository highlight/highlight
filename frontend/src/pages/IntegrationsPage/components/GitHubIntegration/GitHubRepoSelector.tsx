import { Form } from '@highlight-run/ui/components'
import {
	GitHubRepoSelectionKey,
	useGitHubIntegration,
} from '@pages/IntegrationsPage/components/GitHubIntegration/utils'
import { ContainerSelectionProps } from '@pages/IntegrationsPage/IssueTrackerIntegrations'
import useLocalStorage from '@rehooks/local-storage'
import { useEffect, useMemo } from 'react'

import { OptionDropdown } from '@/pages/Graphing/OptionDropdown'

const GitHubRepoSelector: React.FC<ContainerSelectionProps> = ({
	setSelectionId,
	disabled,
}) => {
	const { data } = useGitHubIntegration()

	const githubReposOptions = useMemo(() => {
		return (
			data?.github_repos?.map((repo) => ({
				value: repo.name,
				id: repo.name,
				displayValue: repo.name,
			})) || []
		)
	}, [data])

	const [selectedGitHubRepoId, setGitHubRepoId, removeGitHubRepoId] =
		useLocalStorage(GitHubRepoSelectionKey, '')

	useEffect(() => {
		setSelectionId(selectedGitHubRepoId)
	}, [selectedGitHubRepoId, setSelectionId])

	useEffect(() => {
		if (githubReposOptions.length > 0) {
			if (selectedGitHubRepoId === '') {
				setGitHubRepoId(githubReposOptions[0].value)
			}
		} else {
			removeGitHubRepoId()
		}
	}, [
		selectedGitHubRepoId,
		githubReposOptions,
		setGitHubRepoId,
		removeGitHubRepoId,
	])

	return (
		<Form.NamedSection label="Repository" name="githubRepo">
			<OptionDropdown
				options={githubReposOptions.map((o) => o.id)}
				labels={githubReposOptions.map((o) => o.displayValue)}
				selection={selectedGitHubRepoId}
				setSelection={setGitHubRepoId}
				disabled={disabled}
			/>
		</Form.NamedSection>
	)
}

export default GitHubRepoSelector
