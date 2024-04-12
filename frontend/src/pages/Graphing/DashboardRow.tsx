import {
	Badge,
	Box,
	IconSolidChartBar,
	IconSolidDotsHorizontal,
	IconSolidTrash,
	Menu,
	Stack,
	Table,
	Text,
} from '@highlight-run/ui/components'
import { message } from 'antd'
import moment from 'moment'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDeleteVisualizationMutation } from '@/graph/generated/hooks'
import {
	GetVisualizationsQuery,
	namedOperations,
} from '@/graph/generated/operations'

export const DashboardRow = ({
	idx,
	row,
}: {
	idx: number
	row: GetVisualizationsQuery['visualizations']['results'][number]
}) => {
	const [hover, setHover] = useState(false)

	const [deleteViz, deleteContext] = useDeleteVisualizationMutation({
		variables: {
			id: row.id,
		},
		refetchQueries: [namedOperations.Query.GetVisualizations],
	})

	return (
		<Table.Row
			width="full"
			key={idx}
			onMouseEnter={() => {
				setHover(true)
			}}
			onMouseLeave={() => {
				setHover(false)
			}}
		>
			<Link to={`${row.id}`}>
				<Stack direction="row" alignItems="center" px="12" py="8">
					<Stack width="full" gap="2">
						<Box display="flex" gap="6" alignItems="center">
							<Badge
								color="weak"
								iconStart={<IconSolidChartBar />}
							/>
							<Text weight="medium" size="small" color="strong">
								{row.name}
							</Text>
						</Box>
						<Box>
							<Text color="weak" display="inline-block">
								Updated by&nbsp;
							</Text>
							<Text
								color="secondaryContentText"
								display="inline-block"
							>
								{row.updatedByAdmin?.name ?? 'Highlight'}
								&nbsp;
							</Text>
							<Text color="weak" display="inline-block">
								{moment(row.updatedAt).fromNow()}
							</Text>
						</Box>
					</Stack>
					{hover && (
						<Menu>
							<Menu.Button
								size="medium"
								emphasis="low"
								kind="secondary"
								iconLeft={<IconSolidDotsHorizontal />}
								onClick={(e: any) => {}}
							/>
							<Menu.List>
								<Menu.Item
									disabled={deleteContext.loading}
									onClick={(e) => {
										e.preventDefault()
										deleteViz()
											.then(() =>
												message.success(
													'Dashboard deleted',
												),
											)
											.catch(() =>
												message.error(
													'Failed to delete dashboard',
												),
											)
									}}
								>
									<Box
										display="flex"
										alignItems="center"
										gap="4"
									>
										<IconSolidTrash />
										Delete dashboard
									</Box>
								</Menu.Item>
							</Menu.List>
						</Menu>
					)}
				</Stack>
			</Link>
		</Table.Row>
	)
}
