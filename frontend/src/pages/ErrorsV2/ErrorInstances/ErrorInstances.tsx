import { Box, Callout, Card, Stack, Text } from '@highlight-run/ui'
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from '@tanstack/react-table'
import { useMemo } from 'react'

import LoadingBox from '@/components/LoadingBox'
import { useGetErrorObjectsQuery } from '@/graph/generated/hooks'
import { GetErrorGroupQuery } from '@/graph/generated/operations'
import { ErrorObjectEdge } from '@/graph/generated/schemas'
import { ErrorInstanceTimestamp } from '@/pages/ErrorsV2/ErrorInstances/ErrorInstanceTimestamp'
import { NoErrorInstancesFound } from '@/pages/ErrorsV2/ErrorInstances/NoErrorInstancesFound'

type Props = {
	errorGroup: GetErrorGroupQuery['error_group']
}

export const ErrorInstances = ({ errorGroup }: Props) => {
	const { data, loading, error } = useGetErrorObjectsQuery({
		variables: {
			errorGroupSecureID: errorGroup?.secure_id ?? '',
		},
		skip: !errorGroup?.secure_id,
	})

	const tableData: ErrorObjectEdge[] =
		data?.error_objects?.edges.map((edge) => edge) || []

	const columns = useMemo<ColumnDef<ErrorObjectEdge>[]>(
		() => [
			{
				accessorFn: (row) => row.node.event,
				id: 'event',
				cell: ({ getValue }) => <Text>{getValue() as string}</Text>,
			},
			{
				accessorFn: (row) => row.node.createdAt,
				id: 'created_at',
				cell: ({ getValue }) => (
					<ErrorInstanceTimestamp timestamp={getValue() as string} />
				),
			},
			{
				accessorFn: (row) => row.node.session.appVersion,
				id: 'app_version',
				cell: ({ getValue }) => <Box>{getValue() as string}</Box>,
			},
			{
				accessorFn: (row) => row.node.session.userProperties,
				id: 'user_properties',
				cell: ({ getValue }) => <Box>{getValue() as string}</Box>,
			},
		],
		[],
	)

	const table = useReactTable({
		columns,
		data: tableData,
		getCoreRowModel: getCoreRowModel(),
	})

	if (loading) {
		return (
			<Card>
				<LoadingBox height={156} />
			</Card>
		)
	}
	if (error)
		return (
			<Box m="auto" style={{ maxWidth: 300 }}>
				<Callout title="Failed to load error instances" kind="error">
					<Box mb="6">
						<Text color="moderate">
							There was an error loading error instances. Reach
							out to us if this might be a bug.
						</Text>
					</Box>
				</Callout>
			</Box>
		)

	if (tableData.length === 0) {
		return <NoErrorInstancesFound />
	}

	return (
		<Box>
			{table.getRowModel().rows.map((row) => {
				return (
					<Stack key={row.id} direction="row" mb="8">
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
		</Box>
	)
}
