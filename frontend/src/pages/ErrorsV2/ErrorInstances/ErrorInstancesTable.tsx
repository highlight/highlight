import { Box, Stack, Text } from '@highlight-run/ui'
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from '@tanstack/react-table'
import React from 'react'
import { useNavigate } from 'react-router-dom'

import { Link } from '@/components/Link'
import { ErrorObjectEdge } from '@/graph/generated/schemas'
import { useProjectId } from '@/hooks/useProjectId'
import { AppVersionCell } from '@/pages/ErrorsV2/ErrorInstances/AppVersionCell'
import { SessionEmailCell } from '@/pages/ErrorsV2/ErrorInstances/SessionEmailCell'
import { TimestampCell } from '@/pages/ErrorsV2/ErrorInstances/TimestampCell'

type Props = {
	edges: ErrorObjectEdge[]
}

export const ErrorInstancesTable = ({ edges }: Props) => {
	const navigate = useNavigate()
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
					<TimestampCell timestamp={getValue()} />
				</Box>
			),
		}),
		columnHelper.accessor('node.session', {
			cell: ({ getValue }) => {
				const session = getValue()

				return (
					<Box display="flex">
						{session?.appVersion ? (
							<AppVersionCell version={session.appVersion} />
						) : null}
					</Box>
				)
			},
		}),
		columnHelper.accessor('node.session', {
			cell: ({ getValue }) => {
				const session = getValue()

				return (
					<Box display="flex">
						{session ? (
							<SessionEmailCell
								userProperties={session.userProperties}
							/>
						) : null}
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
