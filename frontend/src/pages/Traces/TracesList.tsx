import {
	Badge,
	Box,
	IconSolidAcademicCap,
	Stack,
	Table,
	Text,
} from '@highlight-run/ui/components'
import useLocalStorage from '@rehooks/local-storage'
import {
	ColumnDef,
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { isEqual } from 'lodash'
import React, { Key, useMemo, useRef } from 'react'

import {
	ColumnHeader,
	CustomColumnHeader,
} from '@/components/CustomColumnHeader'
import { CustomColumnPopover } from '@/components/CustomColumnPopover'
import { AdditionalFeedResults } from '@/components/FeedResults/FeedResults'
import { LinkButton } from '@/components/LinkButton'
import LoadingBox from '@/components/LoadingBox'
import { DEFAULT_INPUT_HEIGHT } from '@/components/Search/SearchForm/SearchForm'
import { ProductType, TraceEdge } from '@/graph/generated/schemas'
import { useParams } from '@/util/react-router/useParams'

import {
	DEFAULT_TRACE_COLUMNS,
	HIGHLIGHT_STANDARD_COLUMNS,
} from './CustomColumns/columns'
import { ColumnRenderers } from './CustomColumns/renderers'

type Props = {
	loading: boolean
	numMoreTraces?: number
	traceEdges: TraceEdge[]
	handleAdditionalTracesDateChange?: () => void
	resetMoreTraces?: () => void
	fetchMoreWhenScrolled: (target: HTMLDivElement) => void
	loadingAfter: boolean
	textAreaRef: React.RefObject<HTMLTextAreaElement>
}

const LOADING_AFTER_HEIGHT = 28
const HEADERS_AND_CHARTS_HEIGHT = 120
const LOAD_BEFORE_HEIGHT = 28

export const TracesList: React.FC<Props> = ({
	loading,
	numMoreTraces,
	traceEdges,
	handleAdditionalTracesDateChange,
	resetMoreTraces,
	fetchMoreWhenScrolled,
	loadingAfter,
	textAreaRef,
}) => {
	const { span_id } = useParams<{ span_id?: string }>()

	const [selectedColumns, setSelectedColumns] = useLocalStorage(
		`highlight-traces-table-columns`,
		DEFAULT_TRACE_COLUMNS,
	)

	const bodyRef = useRef<HTMLDivElement>(null)
	const enableFetchMoreTraces =
		!!numMoreTraces &&
		!!resetMoreTraces &&
		!!handleAdditionalTracesDateChange

	const columnHelper = createColumnHelper<TraceEdge>()

	const columnData = useMemo(() => {
		const gridColumns: string[] = []
		const columnHeaders: ColumnHeader[] = []
		const columns: ColumnDef<TraceEdge, any>[] = []

		selectedColumns.forEach((column, index) => {
			const first = index === 0

			gridColumns.push(column.size)
			columnHeaders.push({
				id: column.id,
				component: column.label,
				showActions: true,
			})

			// @ts-ignore
			const accessor = columnHelper.accessor(`node.${column.accessKey}`, {
				cell: ({ row, getValue }) => {
					const ColumnRenderer =
						ColumnRenderers[column.type] || ColumnRenderers.string

					return (
						<ColumnRenderer
							key={column.id}
							row={row}
							getValue={getValue}
							first={first}
						/>
					)
				},
			})

			columns.push(accessor)
		})

		// add custom column
		gridColumns.push('25px')
		columnHeaders.push({
			id: 'edit-column-button',
			noPadding: true,
			component: (
				<CustomColumnPopover
					productType={ProductType.Traces}
					selectedColumns={selectedColumns}
					setSelectedColumns={setSelectedColumns}
					standardColumns={HIGHLIGHT_STANDARD_COLUMNS}
					attributePrefix="traceAttributes"
				/>
			),
		})

		return {
			gridColumns,
			columnHeaders,
			columns,
		}
	}, [columnHelper, selectedColumns, setSelectedColumns])

	const table = useReactTable({
		data: traceEdges,
		columns: columnData.columns,
		getCoreRowModel: getCoreRowModel(),
	})

	const { rows } = table.getRowModel()

	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		estimateSize: () => 38,
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

	const otherElementsHeight = useMemo(() => {
		let height = HEADERS_AND_CHARTS_HEIGHT
		if (textAreaRef.current) {
			height += textAreaRef.current.clientHeight
		} else {
			height += DEFAULT_INPUT_HEIGHT
		}

		if (numMoreTraces && numMoreTraces > 0) {
			height += LOAD_BEFORE_HEIGHT
		}

		return height
	}, [numMoreTraces, textAreaRef])

	const handleFetchMoreWhenScrolled = (
		e: React.UIEvent<HTMLDivElement, UIEvent>,
	) => {
		setTimeout(() => {
			fetchMoreWhenScrolled(e.target as HTMLDivElement)
		}, 0)
	}

	if (loading) {
		return <LoadingBox />
	}

	if (!traceEdges.length) {
		return (
			<Box px="12" py="8">
				<Box
					border="secondary"
					borderRadius="6"
					display="flex"
					flexDirection="row"
					gap="6"
					p="8"
					alignItems="center"
					width="full"
				>
					<Box alignSelf="flex-start">
						<Badge
							size="medium"
							shape="basic"
							variant="gray"
							iconStart={<IconSolidAcademicCap size="12" />}
						/>
					</Box>
					<Stack gap="12" flexGrow={1} style={{ padding: '5px 0' }}>
						<Text color="strong" weight="bold" size="small">
							Set up traces
						</Text>
						<Text color="moderate">
							No traces found. Have you finished setting up
							tracing in your app yet?
						</Text>
					</Stack>

					<Box alignSelf="center" display="flex">
						<LinkButton
							to="https://www.highlight.io/docs/getting-started/native-opentelemetry/tracing"
							kind="primary"
							size="small"
							trackingId="tracing-empty-state_learn-more-setup"
							target="_blank"
						>
							Learn more
						</LinkButton>
					</Box>
				</Box>
			</Box>
		)
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
							setSelectedColumns={setSelectedColumns!}
							standardColumns={HIGHLIGHT_STANDARD_COLUMNS}
							trackingIdPrefix="TracesTableColumn"
						/>
					))}
				</Table.Row>
				{enableFetchMoreTraces && (
					<Table.Row>
						<Box width="full">
							<AdditionalFeedResults
								more={numMoreTraces}
								type="traces"
								onClick={() => {
									resetMoreTraces()
									handleAdditionalTracesDateChange()
								}}
							/>
						</Box>
					</Table.Row>
				)}
			</Table.Head>
			<Table.Body
				ref={bodyRef}
				height="full"
				overflowY="auto"
				onScroll={handleFetchMoreWhenScrolled}
				style={{
					height: `calc(100% - ${otherElementsHeight}px)`,
				}}
				hiddenScroll
			>
				{paddingTop > 0 && <Box style={{ height: paddingTop }} />}
				{virtualRows.map((virtualRow) => {
					const row = rows[virtualRow.index]
					const isSelected = row.original.node.spanID === span_id

					return (
						<TracesTableRow
							key={virtualRow.key}
							row={row}
							rowVirtualizer={rowVirtualizer}
							virtualRowKey={virtualRow.key}
							isSelected={isSelected}
							gridColumns={columnData.gridColumns}
							selectedColumnsIds={selectedColumns.map(
								(c) => c.id,
							)}
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

type TracesTableRowProps = {
	row: any
	rowVirtualizer: any
	virtualRowKey: Key
	isSelected: boolean
	gridColumns: string[]
	selectedColumnsIds: string[]
}

const TracesTableRow = React.memo<TracesTableRowProps>(
	({ row, rowVirtualizer, virtualRowKey, isSelected, gridColumns }) => {
		return (
			<Table.Row
				data-index={virtualRowKey}
				gridColumns={gridColumns}
				forwardRef={rowVirtualizer.measureElement}
				selected={isSelected}
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
		return (
			prevProps.virtualRowKey === nextProps.virtualRowKey &&
			prevProps.isSelected === nextProps.isSelected &&
			isEqual(prevProps.gridColumns, nextProps.gridColumns) &&
			isEqual(prevProps.selectedColumnsIds, nextProps.selectedColumnsIds)
		)
	},
)
