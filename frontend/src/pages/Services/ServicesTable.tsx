import { Button } from '@components/Button'
import Popover from '@components/Popover/Popover'
import Select from '@components/Select/Select'
import { useEditServiceMutation, useGetServicesLazyQuery } from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import {
	Box,
	Combobox,
	Stack,
	Table,
	Tag,
	Text,
	useComboboxState,
} from '@highlight-run/ui'
import { useGitHubIntegration } from '@pages/IntegrationsPage/components/GitHubIntegration/utils'
import { useParams } from '@util/react-router/useParams'
import { debounce } from 'lodash'
import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

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

	const {
		settings: { isIntegrated },
		data: githubData,
	} = useGitHubIntegration()

	const [editService] = useEditServiceMutation()

	const handleGitHubRepoChange = (service: any, repo?: any) => {
		editService({
			variables: {
				id: service.id,
				project_id: service.projectID!,
				github_repo_path: repo,
			},
			refetchQueries: [namedOperations.Query.GetServices],
		})
	}

	React.useEffect(() => {
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

	return (
		<Stack direction="column" gap="4" align="center" paddingRight="4">
			<Combobox
				state={state}
				name="search"
				placeholder="Search..."
				className={styles.combobox}
				onChange={handleQueryChange}
			/>
			<Table loading={loading} error={error?.message}>
				<Table.Head>
					<Table.Row>
						<Table.Header>Service</Table.Header>
						<Table.Header>GitHub repo</Table.Header>
						<Table.Header>Status</Table.Header>
					</Table.Row>
				</Table.Head>
				{data?.services?.edges.map((edge: any) => {
					const service = edge.node

					return (
						<Table.Row key={service.cursor}>
							<Table.Cell>{service.name}</Table.Cell>
							<Table.Cell>
								<Popover
									trigger="click"
									content={
										<Box style={{ maxWidth: 250 }} p="8">
											{!isIntegrated ? (
												<Link
													to={`/${service.projectID}/integrations`}
												>
													<Text
														size="small"
														weight="medium"
													>
														Integrate GitHub
													</Text>
												</Link>
											) : (
												<>
													{service.githubRepoPath ? (
														<Text
															size="small"
															weight="medium"
														>
															Edit
														</Text>
													) : (
														<Text
															size="small"
															weight="medium"
														>
															Connect
														</Text>
													)}
													<Select
														aria-label="GitHub Repository"
														placeholder="Chose repo to connect to service"
														options={githubData?.github_repos?.map(
															(repo) => ({
																id: repo.key,
																value: repo.repo_id.replace(
																	'https://api.github.com/repos/',
																	'',
																),
																displayValue:
																	repo.name,
															}),
														)}
														onChange={(repo) =>
															handleGitHubRepoChange(
																data,
																repo,
															)
														}
														value={
															service.githubRepoPath
														}
														notFoundContent={
															<p>
																No repos found
															</p>
														}
													/>
													{service.githubRepoPath && (
														<Button
															kind="danger"
															trackingId="remove-repo"
															onClick={() =>
																handleGitHubRepoChange(
																	service,
																)
															}
														>
															Remove
														</Button>
													)}
												</>
											)}
										</Box>
									}
								>
									<Tag size="small">
										{service.githubRepoPath || 'None'}
									</Tag>
								</Popover>
							</Table.Cell>
							<Table.Cell>{service.status}</Table.Cell>
						</Table.Row>
					)
				})}
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
		</Stack>
	)
}
