import LoadingBox from '@components/LoadingBox'
import TextHighlighter from '@components/TextHighlighter/TextHighlighter'
import Tooltip from '@components/Tooltip/Tooltip'
import { Box, Combobox, Stack, Text, useComboboxState } from '@highlight-run/ui'
import { useParams } from '@util/react-router/useParams'
import React, { useRef, useState } from 'react'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'

import {
	// useEditServicesMutation,
	useGetServicesQuery,
} from '@/graph/generated/hooks'
import { styledVerticalScrollbar } from '@/style/common.css'

import * as styles from './ServicesTable.css'

export const ServicesTable = () => {
	const { project_id } = useParams<{ project_id: string }>()
	const { data, loading, error } = useGetServicesQuery({
		variables: { project_id: project_id! },
		skip: !project_id,
	})
	const [query, setQuery] = useState<string>('')
	const state = useComboboxState()
	const virtuoso = useRef<VirtuosoHandle>(null)

	return (
		<Stack direction="column" gap="4" align="center" paddingRight="4">
			<Combobox
				state={state}
				name="search"
				placeholder="Search..."
				className={styles.combobox}
				onBlur={() => {
					setQuery(state.value)
				}}
			/>
			<Box className={styles.container}>
				<Box className={styles.header}>
					<Text color="n11">Service</Text>
					<Text color="n11">Github repo</Text>
					<Text color="n11">Status</Text>
				</Box>
				{loading && <LoadingBox height={640} />}
				{error && error.message}
				{data && (
					<Box className={styles.resultsContainer}>
						<Virtuoso
							ref={virtuoso}
							data={data.services}
							className={styledVerticalScrollbar}
							itemContent={(_, service) => {
								return (
									<ServiceRow
										key={service.id}
										service={service}
										searchTerm={query}
									/>
								)
							}}
						/>
					</Box>
				)}
			</Box>
		</Stack>
	)
}

type ServiceRowProps = {
	service: any
	searchTerm: string
}

const ServiceRow = ({ service, searchTerm }: ServiceRowProps) => {
	console.log('SERVICE', service)
	return (
		<Box key={service.id}>
			<Box borderBottom="dividerWeak">
				<Tooltip title={service.name}>
					<TextHighlighter
						className={styles.nameSection}
						searchWords={[searchTerm]}
						autoEscape={true}
						textToHighlight={service.name}
					/>
				</Tooltip>

				<Text size="small" weight="medium" lines="1">
					{service.githubRepoPath}
				</Text>

				<Text size="small" weight="medium" lines="1">
					{service.status}
				</Text>

				<Text size="small" weight="medium" lines="1">
					Spencer
				</Text>
			</Box>
		</Box>
	)
}
