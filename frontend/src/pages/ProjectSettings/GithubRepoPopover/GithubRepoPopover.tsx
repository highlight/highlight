import { Button } from '@components/Button'
import Popover from '@components/Popover/Popover'
import Select from '@components/Select/Select'
import { Badge, Box, IconSolidGithub, Stack, Text } from '@highlight-run/ui'
import React from 'react'
import { Link } from 'react-router-dom'

type Props = {
	service: any
	githubRepos: any[]
	onRepoChange: (service: any, repo?: any) => void
	githubIntegrated: boolean
}

export const GithubRepoPopover = ({
	service,
	githubRepos,
	onRepoChange,
	githubIntegrated,
}: Props) => {
	const repoName = service.githubRepoPath?.split('/').pop()
	const repoOptions = githubRepos.map((repo) => ({
		id: repo.key,
		value: repo.repo_id.replace('https://api.github.com/repos/', ''),
		displayValue: repo.name.split('/').pop(),
	}))

	return (
		<Popover
			trigger="click"
			content={
				<Box style={{ minWidth: 250 }} p="8">
					{!githubIntegrated ? (
						<Link to={`/${service.projectID}/integrations`}>
							<Text size="small" weight="medium">
								Integrate GitHub
							</Text>
						</Link>
					) : (
						<Stack>
							<Text size="small" weight="medium">
								{service.githubRepoPath ? 'Edit' : 'Connect'}
							</Text>
							<Select
								aria-label="GitHub Repository"
								placeholder="Search repo..."
								options={repoOptions}
								onChange={(repo) => onRepoChange(service, repo)}
								value={service.githubRepoPath}
								notFoundContent={<p>No repos found</p>}
							/>
							{service.githubRepoPath && (
								<Button
									kind="danger"
									trackingId="remove-repo"
									onClick={() => onRepoChange(service)}
								>
									Remove
								</Button>
							)}
						</Stack>
					)}
				</Box>
			}
		>
			<Badge
				variant="outlineGray"
				iconStart={repoName && <IconSolidGithub size={12} />}
				label={repoName || 'None'}
				gap="4"
				size="medium"
			/>
		</Popover>
	)
}
