import { Button } from '@components/Button'
import LoadingBox from '@components/LoadingBox'
import {
	useEditServiceGithubSettingsMutation,
	useGetServicesQuery,
} from '@graph/hooks'
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
	Text,
	Tooltip,
	useComboboxStore,
} from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import { useGitHubIntegration } from '@pages/IntegrationsPage/components/GitHubIntegration/utils'
import { capitalize } from 'lodash'
import { debounce } from 'lodash'
import React, { useEffect, useMemo, useState } from 'react'

import { Service, ServiceStatus } from '@/graph/generated/schemas'

import {
	GithubSettingsFormValues,
	GitHubSettingsModal,
} from '../GitHubSettingsModal/GitHubSettingsModal'
import * as styles from './ServicesTable.css'

type Pagination = {
	after?: string
	before?: string
}

export const ServicesTable: React.FC = () => {
	const { projectId } = useProjectId()
	const {
		error,
		data,
		loading,
		refetch: refetchServices,
	} = useGetServicesQuery({
		variables: {
			project_id: projectId!,
		},
		skip: !projectId,
	})
	const [query, setQuery] = useState<string>('')
	const [pagination, setPagination] = useState<Pagination>({})
	const [selectedService, setService] = useState<Service | null>(null)

	const {
		settings: { isIntegrated },
		data: githubData,
	} = useGitHubIntegration()

	const [editServiceGithubSettings] = useEditServiceGithubSettingsMutation()

	useEffect(() => {
		refetchServices({
			project_id: projectId!,
			query: query,
			before: pagination.before,
			after: pagination.after,
		})
	}, [refetchServices, projectId, query, pagination])

	const comboboxStore = useComboboxStore()
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

	const updateServiceSettings = (
		service: Service,
		formValues: GithubSettingsFormValues,
	) => {
		editServiceGithubSettings({
			variables: {
				id: service.id,
				project_id: service.projectID!,
				github_repo_path: formValues.githubRepo,
				build_prefix: formValues.buildPrefix,
				github_prefix: formValues.githubPrefix,
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
			renderData: (service: Service) => (
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
			renderData: (service: Service) => {
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
			renderData: (service: Service) => {
				const renderBadge = () => (
					<Badge
						variant={determineStatusVariant(service.status)}
						label={capitalize(service.status)}
						size="medium"
					/>
				)

				if (
					service.status === ServiceStatus.Error &&
					service.errorDetails?.length
				) {
					return (
						<Tooltip trigger={renderBadge()}>
							<Box style={{ maxWidth: 250 }} p="8">
								{service.errorDetails?.map((error) => (
									<Text key={error} color="bad">
										{error}
									</Text>
								))}
							</Box>
						</Tooltip>
					)
				}

				return renderBadge()
			},
		},
	]

	const gridColumns = columns.map((column) => column.width)

	const renderTableContent = () => {
		if (loading) {
			return (
				<Table.FullRow>
					<LoadingBox />
				</Table.FullRow>
			)
		}

		if (error?.message) {
			return (
				<Table.FullRow>
					<Text size="small" color="bad">
						{error.message}
					</Text>
				</Table.FullRow>
			)
		}

		if (!data?.services?.edges.length) {
			return (
				<Table.FullRow>
					<Text size="small" color="weak">
						No services found
					</Text>
				</Table.FullRow>
			)
		}

		return data?.services?.edges.map((edge) => {
			const service = edge?.node

			return (
				<Table.Row key={edge?.cursor} gridColumns={gridColumns}>
					{columns.map((column) => (
						<Table.Cell
							key={column.name}
							icon={column.dataFormat.icon}
						>
							{column.renderData(service as Service)}
						</Table.Cell>
					))}
				</Table.Row>
			)
		})
	}

	return (
		<Stack direction="column" gap="4" align="center" paddingRight="4">
			<Combobox
				store={comboboxStore}
				name="search"
				placeholder="Search services..."
				className={styles.combobox}
				onChange={handleQueryChange}
			/>
			<Table>
				<Table.Head>
					<Table.Row gridColumns={gridColumns}>
						{columns.map((column) => (
							<Table.Header key={column.name}>
								{column.name}
							</Table.Header>
						))}
					</Table.Row>
				</Table.Head>
				<Table.Body>{renderTableContent()}</Table.Body>
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

export const determineStatusVariant = (status: ServiceStatus) => {
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
