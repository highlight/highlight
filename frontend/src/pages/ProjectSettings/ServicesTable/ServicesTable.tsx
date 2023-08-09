import { Button } from '@components/Button'
import { useEditServiceMutation, useGetServicesLazyQuery } from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import {
	Badge,
	Box,
	Combobox,
	IconSolidCubeTransparent,
	IconSolidExternalLink,
	IconSolidGithub,
	Stack,
	Table,
	useComboboxState,
} from '@highlight-run/ui'
import { useGitHubIntegration } from '@pages/IntegrationsPage/components/GitHubIntegration/utils'
import { useParams } from '@util/react-router/useParams'
import { capitalize } from 'lodash'
import { debounce } from 'lodash'
import React, { useEffect, useMemo, useState } from 'react'

import { GitHubSettingsModal } from '../GitHubSettingsModal/GitHubSettingsModal'
import * as styles from './ServicesTable.css'

type Pagination = {
	after?: string
	before?: string
}

export const ServicesTable = () => {
	const { project_id } = useParams<{ project_id: string }>()
	const [loadServices, { error, data, loading }] = useGetServicesLazyQuery()
	const [query, setQuery] = useState<string>('')
	const [pagination, setPagination] = useState<Pagination>({})
	const [selectedService, setService] = useState<any>(null)

	const {
		settings: { isIntegrated },
		data: githubData,
	} = useGitHubIntegration()

	const [editService] = useEditServiceMutation()

	useEffect(() => {
		loadServices({
			variables: {
				project_id: project_id!,
				query: query!,
				before: pagination.before!,
				after: pagination.after!,
			},
		})
	}, [loadServices, project_id, query, pagination])

	const state = useComboboxState()
	const handleQueryChange = useMemo(
		() =>
			debounce((e) => {
				setQuery(e.target.value)
				setPagination({})
			}, 300),
		[],
	)

	const handlePreviousPage = () => {
		setPagination({
			before: data?.services?.pageInfo.startCursor,
		})
	}

	const handleNextPage = () => {
		setPagination({
			after: data?.services?.pageInfo.endCursor,
		})
	}

	const updateServiceSettings = (service: any, repo?: any) => {
		editService({
			variables: {
				id: service.id,
				project_id: service.projectID!,
				github_repo_path: repo,
			},
			refetchQueries: [namedOperations.Query.GetServices],
		})
	}

	const columns = [
		{
			name: 'Service',
			width: 'auto',
			dataFormat: {
				icon: (
					<Badge
						variant="outlineGray"
						p="4"
						iconStart={<IconSolidCubeTransparent size={12} />}
					/>
				),
			},
			renderData: (service: any) => (
				<Box
					display="flex"
					alignItems="center"
					justifyContent="space-between"
					width="full"
				>
					<Box>{service.name}</Box>
					{service.githubRepoPath && (
						<Table.Discoverable>
							<a
								href={`https://github.com/${service.githubRepoPath}`}
								target="_blank"
								rel="noreferrer"
								style={{ display: 'flex' }}
							>
								<Badge
									variant="outlineGray"
									label="Open in GitHub"
									size="medium"
									iconEnd={<IconSolidExternalLink />}
								/>
							</a>
						</Table.Discoverable>
					)}
				</Box>
			),
		},
		{
			name: 'GitHub repo',
			width: '160px',
			dataFormat: {},
			renderData: (service: any) => {
				const repoName = service.githubRepoPath?.split('/').pop()

				return (
					<Button
						trackingId="edit-github-settings-repo"
						kind="secondary"
						size="small"
						emphasis="low"
						onClick={() => setService(service)}
					>
						<Badge
							variant="outlineGray"
							iconStart={
								repoName && <IconSolidGithub size={12} />
							}
							label={repoName || 'None'}
							gap="4"
							size="medium"
						/>
					</Button>
				)
			},
		},
		{
			name: 'Status',
			width: '80px',
			dataFormat: {},
			renderData: (service: any) => (
				<Badge
					variant={determineStatusVariant(service.status)}
					label={capitalize(service.status)}
					size="medium"
				/>
			),
		},
	]

	const gridColumns = columns.map((column) => column.width)

	return (
		<Stack direction="column" gap="4" align="center" paddingRight="4">
			<Combobox
				state={state}
				name="search"
				placeholder="Search services..."
				className={styles.combobox}
				onChange={handleQueryChange}
			/>
			<Table loading={loading} error={error?.message}>
				<Table.Head>
					<Table.Row gridColumns={gridColumns}>
						{columns.map((column) => (
							<Table.Header key={column.name}>
								{column.name}
							</Table.Header>
						))}
					</Table.Row>
				</Table.Head>
				<Table.Body>
					{data?.services?.edges.map((edge: any) => {
						const service = edge.node

						return (
							<Table.Row
								key={service.cursor}
								gridColumns={gridColumns}
							>
								{columns.map((column) => (
									<Table.Cell
										key={column.name}
										icon={column.dataFormat.icon}
									>
										{column.renderData(service)}
									</Table.Cell>
								))}
							</Table.Row>
						)
					})}
				</Table.Body>
			</Table>
			<Stack direction="row" justifyContent="flex-end">
				<Button
					kind="secondary"
					trackingId="services-previous-page"
					disabled={!data?.services?.pageInfo?.hasPreviousPage}
					onClick={handlePreviousPage}
				>
					Previous
				</Button>
				<Button
					kind="secondary"
					trackingId="services-next-page"
					disabled={!data?.services?.pageInfo?.hasNextPage}
					onClick={handleNextPage}
				>
					Next
				</Button>
			</Stack>
			{selectedService && (
				<GitHubSettingsModal
					githubIntegrated={!!isIntegrated}
					githubRepos={githubData?.github_repos || []}
					service={selectedService}
					closeModal={() => setService(null)}
					handleSave={updateServiceSettings}
				/>
			)}
		</Stack>
	)
}

export const determineStatusVariant = (status: any) => {
	switch (status) {
		case 'healthy':
			return 'green'
		case 'error':
			return 'red'
		case 'created':
		default:
			return 'yellow'
	}
}
