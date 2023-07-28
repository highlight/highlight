import { Button } from '@components/Button'
import LoadingBox from '@components/LoadingBox'
import Popover from '@components/Popover/Popover'
import { useGetServicesLazyQuery } from '@graph/hooks'
import {
	Box,
	Combobox,
	Stack,
	Tag,
	Text,
	useComboboxState,
} from '@highlight-run/ui'
import { useGitHubIntegration } from '@pages/IntegrationsPage/components/GitHubIntegration/utils'
import { useParams } from '@util/react-router/useParams'
import { debounce } from 'lodash'
import React, { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'

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
	} = useGitHubIntegration()

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
	const virtuoso = useRef<VirtuosoHandle>(null)

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
			<Box className={styles.container}>
				<Box className={styles.header}>
					<Text color="n11">Service</Text>
					<Text color="n11">Status</Text>
					<Text color="n11">Github repo</Text>
				</Box>
				{loading && <LoadingBox height={640} />}
				{error && error.message}
				{data?.services?.edges?.length && (
					<Box className={styles.resultsContainer}>
						<Virtuoso
							ref={virtuoso}
							data={data.services.edges}
							itemContent={(index, service) => (
								<ServiceRow
									key={service?.cursor}
									service={service?.node}
									gitHubIntegrated={isIntegrated}
								/>
							)}
						/>
					</Box>
				)}
			</Box>
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

type ServiceRowProps = { service: any; gitHubIntegrated?: boolean }

const ServiceRow = ({ service, gitHubIntegrated }: ServiceRowProps) => {
	const [visible, setVisible] = useState(false)

	return (
		<Box key={service.id}>
			<Box
				borderBottom="dividerWeak"
				display="flex"
				flexDirection="row"
				gap="24"
			>
				<Text size="small" weight="medium">
					{service.name}
				</Text>

				<Text size="small" weight="medium">
					{service.status}
				</Text>

				<Popover
					trigger="hover"
					content={
						<Box style={{ maxWidth: 250 }} p="8">
							{!gitHubIntegrated ? (
								<Link to={`/${service.projectID}/integrations`}>
									<Text size="small" weight="medium">
										Integrate GitHub into Highlight
									</Text>
								</Link>
							) : service.githubRepoPath ? (
								<Text size="small" weight="medium">
									Edit
								</Text>
							) : (
								<Text size="small" weight="medium">
									Connect
								</Text>
							)}
						</Box>
					}
				>
					<Tag size="small">{service.githubRepoPath || 'None'}</Tag>
				</Popover>
			</Box>
		</Box>
	)
}
