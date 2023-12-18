import {
	Badge,
	Box,
	IconSolidAcademicCap,
	IconSolidMenuAlt_2,
	IconSolidPlayCircle,
	Stack,
	Table,
	Tag,
	Text,
} from '@highlight-run/ui/components'
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import React, { Key, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { AdditionalFeedResults } from '@/components/FeedResults/FeedResults'
import { LinkButton } from '@/components/LinkButton'
import LoadingBox from '@/components/LoadingBox'
import { Trace, TraceEdge } from '@/graph/generated/schemas'
import { useProjectId } from '@/hooks/useProjectId'
import { useParams } from '@/util/react-router/useParams'

type Props = {
	loading: boolean
	numMoreTraces?: number
	traceEdges: TraceEdge[]
	handleAdditionalTracesDateChange?: () => void
	resetMoreTraces?: () => void
	fetchMoreWhenScrolled: (target: HTMLDivElement) => void
	loadingAfter: boolean
}

const LOADING_AFTER_HEIGHT = 28
const GRID_COLUMNS = ['2fr', '1fr', '2fr', '1fr', '2fr', '1.2fr']

export const TracesList: React.FC<Props> = ({
	loading,
	numMoreTraces,
	traceEdges,
	handleAdditionalTracesDateChange,
	resetMoreTraces,
	fetchMoreWhenScrolled,
	loadingAfter,
}) => {
	const { projectId } = useProjectId()
	const { span_id } = useParams<{ span_id?: string }>()
	const navigate = useNavigate()
	const location = useLocation()

	const viewTrace = (trace: Partial<Trace>) => {
		navigate(
			`/${projectId}/traces/${trace.traceID}/${trace.spanID}${location.search}`,
		)
	}

	const bodyRef = useRef<HTMLDivElement>(null)
	const enableFetchMoreTraces =
		!!numMoreTraces &&
		!!resetMoreTraces &&
		!!handleAdditionalTracesDateChange

	const columnHelper = createColumnHelper<TraceEdge>()

	const columns = [
		columnHelper.accessor('node.spanName', {
			cell: ({ row, getValue }) => (
				<Table.Cell onClick={() => viewTrace(row.original.node)}>
					<Box
						display="flex"
						alignItems="center"
						justifyContent="space-between"
						width="full"
					>
						<Stack direction="row" align="center">
							<Badge
								variant="outlineGray"
								shape="basic"
								size="medium"
								iconStart={<IconSolidMenuAlt_2 size="12" />}
							/>
							<Text lines="1" color="strong">
								{getValue()}
							</Text>
						</Stack>
						<Table.Discoverable>
							<Badge
								variant="outlineGray"
								label="Open"
								size="medium"
							/>
						</Table.Discoverable>
					</Box>
				</Table.Cell>
			),
		}),
		columnHelper.accessor('node.serviceName', {
			cell: ({ getValue }) => {
				const serviceName = getValue()
				return (
					<Table.Cell>
						<Text lines="1" title={serviceName}>
							{serviceName}
						</Text>
					</Table.Cell>
				)
			},
		}),
		columnHelper.accessor('node.traceID', {
			cell: ({ getValue }) => <Table.Cell>{getValue()}</Table.Cell>,
		}),
		columnHelper.accessor('node.parentSpanID', {
			cell: ({ getValue }) => {
				const parentSpanID = getValue()
				return (
					<Table.Cell>
						{parentSpanID ? (
							<Text lines="1">{parentSpanID}</Text>
						) : (
							<Text color="secondaryContentOnDisabled">
								empty
							</Text>
						)}
					</Table.Cell>
				)
			},
		}),
		columnHelper.accessor('node.secureSessionID', {
			cell: ({ getValue }) => {
				const secureSessionID = getValue()
				return (
					<Table.Cell
						onClick={
							secureSessionID
								? () => {
										navigate(
											`/${projectId}/sessions/${getValue()}`,
										)
								  }
								: undefined
						}
					>
						{secureSessionID ? (
							<Tag
								kind="secondary"
								shape="basic"
								iconLeft={<IconSolidPlayCircle />}
							>
								{secureSessionID}
							</Tag>
						) : (
							<Text color="secondaryContentOnDisabled">
								empty
							</Text>
						)}
					</Table.Cell>
				)
			},
		}),
		columnHelper.accessor('node.timestamp', {
			cell: ({ getValue }) => (
				<Table.Cell>
					<Text lines="1">
						{new Date(getValue()).toLocaleDateString('en-US', {
							month: 'short',
							day: 'numeric',
							year: 'numeric',
							hour: 'numeric',
							minute: 'numeric',
							second: 'numeric',
						})}
					</Text>
				</Table.Cell>
			),
		}),
	]

	const table = useReactTable({
		data: traceEdges,
		columns,
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
							to="https://www.highlight.io/docs/getting-started/tracing/overview"
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
				<Table.Row gridColumns={GRID_COLUMNS}>
					<Table.Header>Span</Table.Header>
					<Table.Header>Service</Table.Header>
					<Table.Header>Trace ID</Table.Header>
					<Table.Header>Parent Span ID</Table.Header>
					<Table.Header>Secure Session ID</Table.Header>
					<Table.Header>Timestamp</Table.Header>
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
					// Subtract height of search filters + table header + charts
					height:
						numMoreTraces && numMoreTraces > 0
							? `calc(100% - 191px)`
							: `calc(100% - 163px)`,
				}}
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
}

const TracesTableRow = React.memo<TracesTableRowProps>(
	({ row, rowVirtualizer, virtualRowKey, isSelected }) => {
		return (
			<Table.Row
				data-index={virtualRowKey}
				gridColumns={GRID_COLUMNS}
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
			prevProps.isSelected === nextProps.isSelected
		)
	},
)
