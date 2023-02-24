import { LogLine } from '@graph/schemas'
import {
	Box,
	ButtonLink,
	IconSolidCheveronDown,
	IconSolidCheveronRight,
	IconSolidChevronDoubleDown,
	IconSolidChevronDoubleUp,
	IconSolidClipboard,
	Stack,
	Text,
} from '@highlight-run/ui'
import { Row } from '@tanstack/react-table'
import { message } from 'antd'
import React, { useEffect, useState } from 'react'

import * as styles from './LogDetails.css'

type Props = {
	row: Row<LogLine>
}

export const LogDetails = ({ row }: Props) => {
	const [allExpanded, setAllExpanded] = useState(false)
	const expanded = row.getIsExpanded()

	if (!expanded) {
		return null
	}

	return (
		<Stack p="6" paddingBottom="0" gap="1" paddingLeft="16">
			{Object.keys(row.original.logAttributes).map((key, index) => {
				const value =
					row.original.logAttributes[
						key as keyof typeof row.original.logAttributes
					]
				const isObject = typeof value === 'object'

				return (
					<Box key={index}>
						{isObject ? (
							<LogDetailsObject
								allExpanded={allExpanded}
								attribute={value}
								label={key}
							/>
						) : (
							<LogValue label={key} value={value} />
						)}
					</Box>
				)
			})}

			<Box
				display="flex"
				alignItems="center"
				flexDirection="row"
				gap="16"
				my="10"
			>
				<ButtonLink
					kind="secondary"
					onClick={(e) => {
						e.stopPropagation()
						setAllExpanded(!allExpanded)
					}}
				>
					<Box
						alignItems="center"
						display="flex"
						flexDirection="row"
						gap="4"
					>
						{allExpanded ? (
							<>
								<IconSolidChevronDoubleUp />{' '}
								<Text color="weak">Collapse all</Text>
							</>
						) : (
							<>
								<IconSolidChevronDoubleDown />
								<Text color="weak">Expand all</Text>
							</>
						)}
					</Box>
				</ButtonLink>

				<ButtonLink
					kind="secondary"
					onClick={(e) => {
						e.stopPropagation()
						navigator.clipboard.writeText(
							JSON.stringify(row.original),
						)
						message.success('Copied logs!')
					}}
				>
					<Box
						display="flex"
						alignItems="center"
						flexDirection="row"
						gap="4"
					>
						<IconSolidClipboard />
						Copy
					</Box>
				</ButtonLink>
			</Box>
		</Stack>
	)
}

const LogDetailsObject: React.FC<{
	allExpanded: boolean
	attribute: string | object
	label: string
}> = ({ allExpanded, attribute, label }) => {
	const [open, setOpen] = useState(false)

	let stringIsJson = false
	if (typeof attribute === 'string') {
		try {
			JSON.parse(attribute)
			stringIsJson = true
		} catch {}
	}

	const isObject = typeof attribute === 'object' || stringIsJson

	useEffect(() => {
		if (open && !allExpanded) {
			setOpen(false)
		}
		// Only want to fire when allExpanded changes
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [allExpanded])

	return isObject ? (
		<Box
			cssClass={styles.line}
			onClick={(e) => {
				e.stopPropagation()
				setOpen(!open)
			}}
		>
			<LogAttributeLine>
				{open ? <IconSolidCheveronDown /> : <IconSolidCheveronRight />}
				<Box>
					<Text color="weak" family="monospace" weight="bold">
						{label}
					</Text>
				</Box>
			</LogAttributeLine>

			{(open || allExpanded) &&
				Object.keys(attribute).map((key, index) => (
					<LogDetailsObject
						key={index}
						allExpanded={allExpanded}
						attribute={attribute[key as keyof typeof attribute]}
						label={key}
					/>
				))}
		</Box>
	) : (
		<Box cssClass={styles.line}>
			<LogValue label={label} value={attribute} />
		</Box>
	)
}

const LogValue: React.FC<{ label: string; value: string }> = ({
	label,
	value,
}) => (
	<LogAttributeLine>
		<Text family="monospace" weight="bold">
			"{label}":
		</Text>
		<Text family="monospace" weight="bold" color="caution">
			{value}
		</Text>
	</LogAttributeLine>
)

const LogAttributeLine: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<Box
			display="flex"
			alignItems="center"
			flexDirection="row"
			gap="10"
			py="8"
			flexShrink={0}
		>
			{children}
		</Box>
	)
}
