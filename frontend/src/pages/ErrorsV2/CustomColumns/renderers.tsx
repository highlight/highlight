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
	paddingProps?: PaddingProps
	onClick?: () => void
}

const ColumnWrapper: React.FC<ColumnWrapperProps> = ({
	children,
	first,
	paddingProps,
	onClick,
}) => {
	if (!first) {
		return (
			<Table.Cell onClick={onClick} {...paddingProps}>
				<span>{children}</span>
			</Table.Cell>
		)
	}

	return (
		<Table.Cell onClick={onClick} {...paddingProps}>
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
	getValue,
	first,
}) => {
	let value = getValue()
	if (typeof value === 'object') {
		value = JSON.stringify(value)
	}
	const color = first ? 'strong' : undefined

	return (
		<ColumnWrapper first={first}>
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

const ErrorObjectColumnRenderer: React.FC<ColumnRendererProps> = ({
	getValue,
	first,
}) => {
	const value = getValue()

	const color = first ? 'strong' : undefined

	const { set } = useRelatedResource()
	const onClick = () => {
		set({
			type: 'error',
			secureId: value.secureId,
			instanceId: value.id,
		})

		analytics.track('session-column_click')
	}

	return (
		<ColumnWrapper first={first} onClick={onClick}>
			{value.event ? (
				<Text lines="1" color={color} title={value.event}>
					{value.event}
				</Text>
			) : (
				<EmptyState />
			)}
		</ColumnWrapper>
	)
}

const DateTimeColumnRenderer: React.FC<ColumnRendererProps> = ({
	getValue,
	first,
}) => {
	const date = getValue()

	return (
		<ColumnWrapper first={first}>
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
	getValue,
	first,
}) => {
	const duration = getTraceDurationString(getValue() * 1e6)
	return (
		<ColumnWrapper first={first}>
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

const SessionColumnRenderer: React.FC<ColumnRendererProps> = ({
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

				analytics.track('session-column_click')
			}
		: undefined
	const paddingProps = secureSessionID
		? { pt: '4' as const, pb: '0' as const }
		: undefined

	return (
		<ColumnWrapper
			first={first}
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

export const ErrorObjectColumnRenderers = {
	datetime: DateTimeColumnRenderer,
	duration: DurationRenderer,
	session: SessionColumnRenderer,
	error_object: ErrorObjectColumnRenderer,
	string: StringColumnRenderer,
}
