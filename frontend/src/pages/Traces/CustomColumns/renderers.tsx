import {
	Badge,
	Box,
	BoxProps,
	IconSolidMenuAlt_2,
	IconSolidPlayCircle,
	Stack,
	Table,
	Tag,
	Text,
} from '@highlight-run/ui/components'
import React from 'react'

import { useRelatedResource } from '@/components/RelatedResources/hooks'
import { Trace } from '@/graph/generated/schemas'
import { ColumnRendererProps } from '@/pages/LogsPage/LogsTable/CustomColumns/renderers'
import { getTraceDurationString } from '@/pages/Traces/utils'
import analytics from '@/util/analytics'

type PaddingProps = {
	pt: BoxProps['p']
	pb: BoxProps['p']
}

type ColumnWrapperProps = {
	children: React.ReactNode
	first: boolean
	row: any
	paddingProps?: PaddingProps
	onClick?: () => void
}

const ColumnWrapper: React.FC<ColumnWrapperProps> = ({
	children,
	first,
	paddingProps,
	row,
	onClick,
}) => {
	const { set } = useRelatedResource()

	if (!first) {
		return (
			<Table.Cell onClick={onClick} {...paddingProps}>
				<span>{children}</span>
			</Table.Cell>
		)
	}

	const viewTrace = (trace: Trace) => {
		set({
			type: 'trace',
			id: trace.traceID,
			timestamp: trace.timestamp,
			spanID: trace.spanID,
		})

		analytics.track('traces_trace-row_click')
	}

	return (
		<Table.Cell
			onClick={() => viewTrace(row.original.node)}
			{...paddingProps}
		>
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
					<span>{children}</span>
				</Stack>
				<Table.Discoverable>
					<Badge variant="outlineGray" label="Open" size="medium" />
				</Table.Discoverable>
			</Box>
		</Table.Cell>
	)
}

const EmptyState: React.FC = () => (
	<Text color="secondaryContentOnDisabled">empty</Text>
)

const StringColumnRenderer: React.FC<ColumnRendererProps> = ({
	row,
	getValue,
	first,
}) => {
	let value = getValue()
	if (typeof value === 'object') {
		value = JSON.stringify(value)
	}
	const color = first ? 'strong' : undefined

	return (
		<ColumnWrapper first={first} row={row}>
			{value ? (
				<Text lines="1" color={color} title={value}>
					{value}
				</Text>
			) : (
				<EmptyState />
			)}
		</ColumnWrapper>
	)
}

const BooleanColumnRenderer: React.FC<ColumnRendererProps> = ({
	row,
	getValue,
	first,
}) => {
	const value = getValue()

	return (
		<ColumnWrapper first={first} row={row}>
			{value != null ? (
				<Text lines="1">{value.toString()}</Text>
			) : (
				<Text color="secondaryContentOnDisabled">empty</Text>
			)}
		</ColumnWrapper>
	)
}

const SessionColumnRenderer: React.FC<ColumnRendererProps> = ({
	row,
	getValue,
	first,
}) => {
	const { set } = useRelatedResource()
	const secureSessionID = getValue()
	const onClick = secureSessionID
		? () => {
				set({
					type: 'session',
					secureId: secureSessionID,
				})

				analytics.track('traces_session-column_click')
			}
		: undefined
	const paddingProps = secureSessionID
		? { pt: '4' as const, pb: '0' as const }
		: undefined

	return (
		<ColumnWrapper
			first={first}
			row={row}
			onClick={onClick}
			paddingProps={paddingProps}
		>
			{secureSessionID ? (
				<Tag
					kind="secondary"
					shape="basic"
					iconLeft={<IconSolidPlayCircle />}
				>
					<Text lines="1">{secureSessionID}</Text>
				</Tag>
			) : (
				<EmptyState />
			)}
		</ColumnWrapper>
	)
}

const DateTimeColumnRenderer: React.FC<ColumnRendererProps> = ({
	row,
	getValue,
	first,
}) => {
	const date = getValue()

	return (
		<ColumnWrapper first={first} row={row}>
			{date ? (
				<Text lines="1">
					{new Date(date).toLocaleDateString('en-US', {
						month: 'short',
						day: 'numeric',
						year: 'numeric',
						hour: 'numeric',
						minute: 'numeric',
						second: 'numeric',
					})}
				</Text>
			) : (
				<EmptyState />
			)}
		</ColumnWrapper>
	)
}

const DurationRenderer: React.FC<ColumnRendererProps> = ({
	row,
	getValue,
	first,
}) => {
	const duration = getTraceDurationString(getValue())
	return (
		<ColumnWrapper first={first} row={row}>
			{duration ? (
				<Text lines="1" title={duration}>
					{duration}
				</Text>
			) : (
				<EmptyState />
			)}
		</ColumnWrapper>
	)
}

export const TraceColumnRenderers = {
	boolean: BooleanColumnRenderer,
	datetime: DateTimeColumnRenderer,
	duration: DurationRenderer,
	session: SessionColumnRenderer,
	string: StringColumnRenderer,
	metric_name: StringColumnRenderer,
	metric_value: StringColumnRenderer,
}
