import Select from '@components/Select/Select'
import { Form, Text } from '@highlight-run/ui'
import {
	GitHubRepoSelectionKey,
	useGitHubIntegration,
} from '@pages/IntegrationsPage/components/GitHubIntegration/utils'
import * as style from '@pages/IntegrationsPage/components/style.css'
import { ContainerSelectionProps } from '@pages/IntegrationsPage/IssueTrackerIntegrations'
import useLocalStorage from '@rehooks/local-storage'
import { useEffect, useMemo } from 'react'

const GitHubRepoSelector: React.FC<ContainerSelectionProps> = ({
	setSelectionId,
}) => {
	const { data } = useGitHubIntegration()

	const githubReposOptions = useMemo(() => {
		return (
			data?.github_repos?.map((repo) => ({
				value: repo.name,
				id: repo.name,
				displayValue: (
					<Text size="small" weight="medium">
						{repo.name}
					</Text>
				),
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
		<Form.NamedSection label="GitHub Repository" name="githubRepo">
			<Select
				aria-label="GitHub Repository"
				placeholder="Choose a repo to create the issue in"
				options={githubReposOptions}
				onChange={setGitHubRepoId}
				value={selectedGitHubRepoId}
				notFoundContent={<p>No repos found</p>}
				className={style.selectContainer}
			/>
		</Form.NamedSection>
	)
}

export default GitHubRepoSelector
