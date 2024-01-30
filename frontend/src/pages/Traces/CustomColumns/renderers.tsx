import {
	Badge,
	Box,
	IconSolidMenuAlt_2,
	IconSolidPlayCircle,
	Stack,
	Table,
	Tag,
	Text,
} from '@highlight-run/ui/components'
import { useLocation, useNavigate } from 'react-router-dom'

import { Trace } from '@/graph/generated/schemas'
import { getTraceDurationString } from '@/pages/Traces/utils'

type ColumnWrapperProps = {
	children: React.ReactNode
	first: boolean
	row: any
	onClick?: () => void
}

const ColumnWrapper: React.FC<ColumnWrapperProps> = ({
	children,
	first,
	row,
	onClick,
}) => {
	const navigate = useNavigate()
	const location = useLocation()

	if (!first) {
		return (
			<Table.Cell onClick={onClick}>
				<span>{children}</span>
			</Table.Cell>
		)
	}

	const viewTrace = (trace: Partial<Trace>) => {
		navigate(
			`/${trace.projectID}/traces/${trace.traceID}/${trace.spanID}${location.search}`,
		)
	}

	return (
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
					{children}
				</Stack>
				<Table.Discoverable>
					<Badge variant="outlineGray" label="Open" size="medium" />
				</Table.Discoverable>
			</Box>
		</Table.Cell>
	)
}

type ColumnRendererProps = {
	row: any
	getValue: () => any
	first: boolean
}

const StringColumnRenderer: React.FC<ColumnRendererProps> = ({
	row,
	getValue,
	first,
}) => {
	const value = getValue()
	const color = first ? 'strong' : undefined

	return (
		<ColumnWrapper first={first} row={row}>
			{value ? (
				<Text lines="1" color={color} title={value}>
					{value}
				</Text>
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
	const navigate = useNavigate()
	const secureSessionID = getValue()
	const trace = row.original.node
	const onClick = secureSessionID
		? () => {
				navigate(`/${trace.projectID}/sessions/${secureSessionID}`)
		  }
		: undefined

	return (
		<ColumnWrapper first={first} row={row} onClick={onClick}>
			{secureSessionID ? (
				<Tag
					kind="secondary"
					shape="basic"
					iconLeft={<IconSolidPlayCircle />}
				>
					{secureSessionID}
				</Tag>
			) : (
				<Text color="secondaryContentOnDisabled">empty</Text>
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
		</ColumnWrapper>
	)
}

const DurationRenderer: React.FC<ColumnRendererProps> = ({
	row,
	getValue,
	first,
}) => {
	// currently receiving in ms
	const duration = getTraceDurationString(getValue())
	return (
		<ColumnWrapper first={first} row={row}>
			<Text lines="1" title={duration}>
				{duration}
			</Text>
		</ColumnWrapper>
	)
}

export const ColumnRenderers = {
	datetime: DateTimeColumnRenderer,
	duration: DurationRenderer,
	session: SessionColumnRenderer,
	string: StringColumnRenderer,
}
