import {
	Badge,
	Box,
	BoxProps,
	IconSolidMenuAlt_2,
	Stack,
	Table,
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

const SessionColumnRenderer: React.FC<ColumnRendererProps> = ({
	getValue,
	first,
}) => {
	const { set } = useRelatedResource()
	let value = getValue()
	if (typeof value === 'object') {
		value = JSON.stringify(value)
	}
	const onClick = () => {
		set({
			type: 'session',
			secureId: value,
		})

		analytics.track('session-column_click')
	}

	return (
		<ColumnWrapper first={first} onClick={onClick}>
			{value ? (
				<Text lines="1" title={value}>
					{value}
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

export const SessionColumnRenderers = {
	datetime: DateTimeColumnRenderer,
	duration: DurationRenderer,
	session: SessionColumnRenderer,
	string: StringColumnRenderer,
}
