import { ApolloError } from '@apollo/client'
import { Link } from '@components/Link'
import LoadingBox from '@components/LoadingBox'
import {
	Box,
	Callout,
	IconSolidCheveronDown,
	IconSolidCheveronRight,
	Stack,
	Table,
	Text,
} from '@highlight-run/ui/components'
import { HIGHLIGHT_STANDARD_COLUMNS } from '@pages/LogsPage/LogsTable/CustomColumns/columns'
import { FullScreenContainer } from '@pages/LogsPage/LogsTable/FullScreenContainer'
import {
	ColumnDef,
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	Row,
	useReactTable,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import React, { Key, useEffect, useMemo, useRef } from 'react'

import {
	ColumnHeader,
	CustomColumnHeader,
} from '@/components/CustomColumnHeader'
import { CustomColumn } from '@/components/CustomColumnPopover'
import { NoResourcesFound } from '@/components/RelatedResources/NoResourcesFound'
import { SearchExpression } from '@/components/Search/Parser/listener'
import { ColumnRenderMap } from '@/pages/LogsPage/LogsTable/CustomColumns/renderers'

import * as styles from './ResourceTable.css'

type Props<T, TCol extends string> = {
	loading: boolean
	error: ApolloError | undefined
	resourceType: 'traces' | 'sessions' | 'errors'
} & TableInnerProps<T, TCol>

export const ResourceTable = <T, TCol extends string>(
	props: Props<T, TCol>,
) => {
	if (props.loading) {
		return (
			<FullScreenContainer>
				<LoadingBox />
			</FullScreenContainer>
		)
	}

	if (props.error) {
		return (
			<FullScreenContainer>
				<Box m="auto" style={{ maxWidth: 300 }}>
					<Callout title="Failed to load logs" kind="error">
						<Box mb="6">
							<Text color="moderate">
								There was an error loading your logs. Reach out
								to us if this might be a bug.
							</Text>
						</Box>
						<Stack direction="row">
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
			</FullScreenContainer>
		)
	}

	if (props.resources.length === 0) {
		return (
			<FullScreenContainer>
				<NoResourcesFound resourceType={props.resourceType} />
			</FullScreenContainer>
		)
	}

	return <TableInner {...props} />
}

type TableInnerProps<T, TCol extends string> = {
	loadingAfter: boolean
	resources: T[]
	query: string
	queryParts: SearchExpression[]
	fetchMoreWhenScrolled: (target: HTMLDivElement) => void
	bodyHeight: string
	selectedColumns: CustomColumn<T, TCol>[]
	columnRenderers: ColumnRenderMap
}

const LOADING_AFTER_HEIGHT = 28

const TableInner = <T, TCol extends string>({
	resources,
	loadingAfter,
	query,
	queryParts,
	bodyHeight,
	fetchMoreWhenScrolled,
	selectedColumns,
	columnRenderers,
}: TableInnerProps<T, TCol>) => {
	const bodyRef = useRef<HTMLDivElement>(null)

	const columnHelper = createColumnHelper<T>()

	const columnData = useMemo(() => {
		const gridColumns: string[] = []
		const columnHeaders: ColumnHeader[] = []
		const columns: ColumnDef<T, any>[] = []

		selectedColumns.forEach((column, index) => {
			const first = index === 0

			gridColumns.push(column.size)
			columnHeaders.push({
				id: column.id,
				component: column.label,
			})

			const accessor = columnHelper.accessor(column.accessor, {
				cell: ({ row, getValue }) => {
					const ColumnRenderer =
						columnRenderers[column.type as string] ??
						columnRenderers['string']

					return (
						<ColumnRenderer
							first={first}
							key={column.id}
							row={row}
							getValue={getValue}
							queryParts={queryParts}
						/>
					)
				},
				id: column.id,
			})

			columns.push(accessor)
		})

		return {
			gridColumns,
			columnHeaders,
			columns,
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [queryParts, selectedColumns])

	const table = useReactTable({
		data: resources,
		columns: columnData.columns,
		state: {},
		getCoreRowModel: getCoreRowModel(),
	})

	const { rows } = table.getRowModel()

	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		estimateSize: () => 29,
		getScrollElement: () => bodyRef.current,
		overscan: 50,
	})

	const totalSize = rowVirtualizer.getTotalSize()
	const virtualRows = rowVirtualizer.getVirtualItems()
	const paddingTop = virtualRows.length > 0 ? virtualRows[0]?.start || 0 : 0
	let paddingBottom =
		virtualRows.length > 0
			? totalSize - (virtualRows[virtualRows.length - 1]?.end || 0)
			: 0

	if (!loadingAfter) {
		paddingBottom += LOADING_AFTER_HEIGHT
	}

	useEffect(() => {
		// Collapse all rows when search changes
		table.toggleAllRowsExpanded(false)
	}, [query, table])

	useEffect(() => {
		setTimeout(() => {
			if (!loadingAfter && bodyRef?.current) {
				fetchMoreWhenScrolled(bodyRef.current)
			}
		}, 0)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loadingAfter])

	const handleFetchMoreWhenScrolled = (
		e: React.UIEvent<HTMLDivElement, UIEvent>,
	) => {
		setTimeout(() => {
			fetchMoreWhenScrolled(e.target as HTMLDivElement)
		}, 0)
	}

	return (
		<Table height="full" noBorder>
			<Table.Head>
				<Table.Row gridColumns={columnData.gridColumns}>
					{columnData.columnHeaders.map((header) => (
						<CustomColumnHeader
							key={header.id}
							header={header}
							selectedColumns={selectedColumns}
							standardColumns={HIGHLIGHT_STANDARD_COLUMNS}
							trackingIdPrefix="LogsTableColumn"
							setSelectedColumns={() => {}}
						/>
					))}
				</Table.Row>
			</Table.Head>
			<Table.Body
				ref={bodyRef}
				overflowY="auto"
				style={{ height: bodyHeight }}
				onScroll={handleFetchMoreWhenScrolled}
				hiddenScroll
			>
				{paddingTop > 0 && <Box style={{ height: paddingTop }} />}
				{virtualRows.map((virtualRow) => {
					const row = rows[virtualRow.index]

					return (
						<TableRow
							key={virtualRow.key}
							row={row}
							rowVirtualizer={rowVirtualizer}
							expanded={row.getIsExpanded()}
							virtualRowKey={virtualRow.key}
							queryParts={queryParts}
							gridColumns={columnData.gridColumns}
						/>
					)
				})}
				{paddingBottom > 0 && <Box style={{ height: paddingBottom }} />}

				{loadingAfter && (
					<Box
						style={{
							height: `${LOADING_AFTER_HEIGHT}px`,
						}}
					>
						<LoadingBox />
					</Box>
				)}
			</Table.Body>
		</Table>
	)
}

export const IconExpanded: React.FC = () => (
	<IconSolidCheveronDown color="#6F6E77" size="12" />
)

export const IconCollapsed: React.FC = () => (
	<IconSolidCheveronRight color="#6F6E77" size="12" />
)

type TableRowProps<T> = {
	row: Row<T>
	rowVirtualizer: any
	expanded: boolean
	virtualRowKey: Key
	queryParts: SearchExpression[]
	gridColumns: string[]
}

const TableRow = <T,>({
	row,
	rowVirtualizer,
	expanded,
	virtualRowKey,
	gridColumns,
}: TableRowProps<T>) => {
	return (
		<div
			key={virtualRowKey}
			data-index={virtualRowKey}
			ref={rowVirtualizer.measureElement}
		>
			<Table.Row
				gridColumns={gridColumns}
				onClick={row.getToggleExpandedHandler()}
				selected={expanded}
				className={styles.dataRow}
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
		</div>
	)
}
