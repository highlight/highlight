import { ApolloError } from '@apollo/client'
import moment from 'moment'

import LoadingBox from '@components/LoadingBox'
import {
	Box,
	Callout,
	Stack,
	Table,
	Tag,
	Text,
} from '@highlight-run/ui/components'
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	Row,
	useReactTable,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import React, { Key, useMemo, useRef } from 'react'
import { LinkButton } from '@/components/LinkButton'
import { Button } from '@components/Button'
import { Link } from '@components/Link'

type Props = {
	alertingStates?: any[]
	alert: any
	loading: boolean
	error: ApolloError | undefined
	refetch: () => void
}

export const AlertTable = (props: Props) => {
	return (
		<Box>
			<Box py="12">
				<Text weight="bold" color="strong">
					Alert history
				</Text>
			</Box>
			<AlertTableInner {...props} />
		</Box>
	)
}

const AlertTableInner = ({
	alertingStates = [],
	alert,
	loading,
	error,
	refetch,
}: Props) => {
	const bodyRef = useRef<HTMLDivElement>(null)

	const columnHelper = createColumnHelper<any>()

	const columnData = useMemo(() => {
		const gridColumns = ['200px', '1fr', '100px']
		const columnHeaders = [
			{
				id: 'timestamp',
				component: 'Time',
			},
			{
				id: 'groupBy',
				component: alert.group_by_key || 'Group by',
			},
			{
				id: 'link',
				component: '',
			},
		]

		const columns = [
			columnHelper.accessor('timestamp', {
				cell: ({ getValue }) => {
					const date = getValue()

					return (
						<Table.Cell>
							<Text>{moment(date).format('LT')}</Text>
						</Table.Cell>
					)
				},
			}),
			columnHelper.accessor('groupByKey', {
				cell: ({ getValue }) => {
					return (
						<Table.Cell>
							<Tag shape="basic" size="small" kind="secondary">
								{getValue() as string}
							</Tag>
						</Table.Cell>
					)
				},
			}),
			columnHelper.accessor('link', {
				cell: () => {
					return (
						<Table.Cell>
							<LinkButton
								trackingId={`alertsView${alert.product_type}`}
								size="xSmall"
								kind="secondary"
								emphasis="medium"
								// TODO(spenny): build link
								to="/errors"
							>
								View {alert.product_type}
							</LinkButton>
						</Table.Cell>
					)
				},
			}),
		]

		return {
			gridColumns,
			columnHeaders,
			columns,
		}
	}, [alert.group_by_key, alert.product_type, columnHelper])

	const table = useReactTable({
		data: alertingStates,
		columns: columnData.columns,
		getCoreRowModel: getCoreRowModel(),
	})

	const { rows } = table.getRowModel()

	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		estimateSize: () => 29,
		getScrollElement: () => bodyRef.current,
		overscan: 50,
	})

	const virtualRows = rowVirtualizer.getVirtualItems()

	const tableBody = () => {
		if (loading) {
			return <LoadingBox />
		}

		if (error) {
			return (
				<Box m="auto" style={{ maxWidth: 300 }}>
					<Callout title="Failed to load alerts" kind="error">
						<Box mb="6">
							<Text color="moderate">
								There was an error loading your alerts. Reach
								out to us if this might be a bug.
							</Text>
						</Box>
						<Stack direction="row">
							<Button
								kind="secondary"
								trackingId="alerts-error-reload"
								onClick={() => refetch()}
							>
								Reload alerts
							</Button>
							<Box
								display="flex"
								alignItems="center"
								justifyContent="center"
							>
								<Link
									to="https://highlight.io/community"
									target="_blank"
								>
									Help
								</Link>
							</Box>
						</Stack>
					</Callout>
				</Box>
			)
		}

		return (
			<>
				{virtualRows.map((virtualRow) => {
					const row = rows[virtualRow.index]

					return (
						<AlertTableRow
							key={virtualRow.key}
							row={row}
							rowVirtualizer={rowVirtualizer}
							virtualRowKey={virtualRow.key}
							gridColumns={columnData.gridColumns}
						/>
					)
				})}
			</>
		)
	}

	return (
		<Table noBorder>
			<Table.Head>
				<Table.Row gridColumns={columnData.gridColumns}>
					{columnData.columnHeaders.map((header) => (
						<Table.Header key={header.id}>
							<Box
								display="flex"
								alignItems="center"
								justifyContent="space-between"
							>
								<Stack direction="row" gap="6" align="center">
									<Text lines="1">{header.component}</Text>
								</Stack>
							</Box>
						</Table.Header>
					))}
				</Table.Row>
			</Table.Head>
			<Table.Body ref={bodyRef} overflowY="auto" hiddenScroll>
				{tableBody()}
			</Table.Body>
		</Table>
	)
}

type AlertTableRowProps = {
	row: Row<any>
	rowVirtualizer: any
	virtualRowKey: Key
	gridColumns: string[]
}

const AlertTableRow = React.memo<AlertTableRowProps>(
	({ row, rowVirtualizer, virtualRowKey, gridColumns }) => {
		return (
			<Table.Row
				gridColumns={gridColumns}
				key={virtualRowKey}
				data-index={virtualRowKey}
				forwardRef={rowVirtualizer.measureElement}
			>
				{row.getVisibleCells().map((cell: any) => {
					return (
						<React.Fragment key={cell.column.id}>
							{flexRender(
								cell.column.columnDef.cell,
								cell.getContext(),
							)}
						</React.Fragment>
					)
				})}
			</Table.Row>
		)
	},
	(prevProps, nextProps) => {
		return prevProps.virtualRowKey === nextProps.virtualRowKey
	},
)
