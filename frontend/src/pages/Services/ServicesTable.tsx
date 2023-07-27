import { Button } from '@components/Button'
import LoadingBox from '@components/LoadingBox'
import { useGetServicesLazyQuery } from '@graph/hooks'
import { Box, Combobox, Stack, Text, useComboboxState } from '@highlight-run/ui'
import { useParams } from '@util/react-router/useParams'
import { debounce } from 'lodash'
import React, { useMemo, useRef, useState } from 'react'
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
					<Text color="n11">Github repo</Text>
					<Text color="n11">Status</Text>
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
								/>
							)}
						/>
					</Box>
				)}
			</Box>
			<Stack direction="row" justifyContent="flex-end">
				<Button
					kind="secondary"
					trackingId="errorInstancesPreviousButton"
					disabled={!data?.services?.pageInfo?.hasPreviousPage}
					onClick={handlePreviousPage}
				>
					Previous
				</Button>
				<Button
					kind="secondary"
					trackingId="errorInstancesNextButton"
					disabled={!data?.services?.pageInfo?.hasNextPage}
					onClick={handleNextPage}
				>
					Next
				</Button>
			</Stack>
		</Stack>
	)
}

type ServiceRowProps = { service: any }

const ServiceRow = ({ service }: ServiceRowProps) => {
	return (
		<Box key={service.id}>
			<Box borderBottom="dividerWeak" display="flex" flexDirection="row">
				<Text size="small" weight="medium">
					{service.name}
				</Text>

				<Text size="small" weight="medium">
					{service.githubRepoPath}
				</Text>

				<Text size="small" weight="medium">
					{service.status}
				</Text>
			</Box>
		</Box>
	)
}
