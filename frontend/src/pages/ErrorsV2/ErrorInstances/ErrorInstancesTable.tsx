import { Badge, Box, Stack, Tag, Text } from '@highlight-run/ui'
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from '@tanstack/react-table'
import moment from 'moment'
import React from 'react'

import { Link } from '@/components/Link'
import { ErrorObjectEdge } from '@/graph/generated/schemas'
import { useProjectId } from '@/hooks/useProjectId'
import { getUserProperties } from '@/pages/Sessions/SessionsFeedV3/MinimalSessionCard/utils/utils'

const toYearMonthDay = (timestamp: string) => {
	const date = new Date(timestamp)
	return moment(date).format('YYYY-MM-DD HH:mm:ss')
}

type Props = {
	edges: ErrorObjectEdge[]
}

export const ErrorInstancesTable = ({ edges }: Props) => {
	const { projectId } = useProjectId()
	const columnHelper = createColumnHelper<ErrorObjectEdge>()

	const columns = [
		columnHelper.accessor('node.event', {
			cell: ({ getValue }) => (
				<Box display="flex" flexGrow={1}>
					<Text>{getValue()}</Text>
				</Box>
			),
		}),
		columnHelper.accessor('node.createdAt', {
			cell: ({ getValue }) => (
				<Box display="flex">
					<Tag shape="basic" kind="secondary">
						{toYearMonthDay(getValue())}
					</Tag>
				</Box>
			),
		}),
		columnHelper.accessor('node.session', {
			cell: ({ getValue }) => {
				const session = getValue()
				if (!session?.appVersion) {
					return null
				}

				return (
					<Box display="flex">
						<Badge
							size="medium"
							color="weak"
							label={session.appVersion}
						></Badge>
					</Box>
				)
			},
		}),
		columnHelper.accessor('node.session', {
			cell: ({ getValue }) => {
				const session = getValue()
				if (!session) {
					return null
				}

				const parsedUserProperties = getUserProperties(
					session.userProperties,
				)

				return (
					<Box display="flex">
						<Text>{parsedUserProperties.email}</Text>
					</Box>
				)
			},
		}),
	]

	const table = useReactTable({
		columns,
		data: edges,
		getCoreRowModel: getCoreRowModel(),
	})

	return (
		<>
			{table.getRowModel().rows.map((row) => {
				return (
					<Link
						to={`/${projectId}/errors/${row.original.node.errorGroupSecureID}/instances/${row.original.cursor}`}
						key={row.id}
					>
						<Stack
							key={row.id}
							direction="row"
							mb="8"
							px="8"
							py="2"
							alignItems="center"
							cursor="pointer"
						>
							{row.getVisibleCells().map((cell) => {
								return (
									<React.Fragment key={cell.id}>
										{flexRender(
											cell.column.columnDef.cell,
											cell.getContext(),
										)}
									</React.Fragment>
								)
							})}
						</Stack>
					</Link>
				)
			})}
		</>
	)
}
