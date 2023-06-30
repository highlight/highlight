import { Box, Stack, Text } from '@highlight-run/ui'
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from '@tanstack/react-table'

import { ErrorObjectEdge } from '@/graph/generated/schemas'
import { AppVersionCell } from '@/pages/ErrorsV2/ErrorInstances/AppVersionCell'
import { SessionEmailCell } from '@/pages/ErrorsV2/ErrorInstances/SessionEmailCell'
import { TimestampCell } from '@/pages/ErrorsV2/ErrorInstances/TimestampCell'

type Props = {
	edges: ErrorObjectEdge[]
}

export const ErrorInstancesTable = ({ edges }: Props) => {
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
		columnHelper.accessor('node.session.appVersion', {
			cell: ({ getValue }) => (
				<Box display="flex">
					<AppVersionCell version={getValue()} />
				</Box>
			),
		}),
		columnHelper.accessor('node.session.userProperties', {
			cell: ({ getValue }) => (
				<Box display="flex">
					<SessionEmailCell userProperties={getValue()} />
				</Box>
			),
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
					<Stack
						key={row.id}
						direction="row"
						mb="8"
						px="8"
						py="2"
						alignItems="center"
					>
						{row.getVisibleCells().map((cell) => {
							return (
								<Box key={cell.id}>
									{flexRender(
										cell.column.columnDef.cell,
										cell.getContext(),
									)}
								</Box>
							)
						})}
					</Stack>
				)
			})}
		</>
	)
}
