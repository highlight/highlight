import LoadingBox from '@components/LoadingBox'
import { useGetServicesLazyQuery } from '@graph/hooks'
import { Box, Combobox, Stack, Text, useComboboxState } from '@highlight-run/ui'
import { useParams } from '@util/react-router/useParams'
import { debounce } from 'lodash'
import React, { useMemo, useRef, useState } from 'react'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'

import * as styles from './ServicesTable.css'

export const ServicesTable = () => {
	const { project_id } = useParams<{ project_id: string }>()
	const [loadServices, { error, data, loading }] = useGetServicesLazyQuery()
	const [query, setQuery] = useState<string>('')

	React.useEffect(() => {
		loadServices({
			variables: { project_id: project_id!, query: query! },
		})
	}, [loadServices, project_id, query])

	const state = useComboboxState()
	const virtuoso = useRef<VirtuosoHandle>(null)

	const handleChange = useMemo(
		() => debounce((e) => setQuery(e.target.value), 300),
		[],
	)

	return (
		<Stack direction="column" gap="4" align="center" paddingRight="4">
			<Combobox
				state={state}
				name="search"
				placeholder="Search..."
				className={styles.combobox}
				onChange={handleChange}
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
