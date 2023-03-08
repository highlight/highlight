import { LogEdge, LogLevel } from '@graph/schemas'
import {
	Box,
	ButtonLink,
	IconSolidChevronDoubleDown,
	IconSolidChevronDoubleUp,
	IconSolidClipboard,
	IconSolidLightningBolt,
	Stack,
	Tag,
	Text,
} from '@highlight-run/ui'
import {
	IconCollapsed,
	IconExpanded,
} from '@pages/LogsPage/LogsTable/LogsTable'
import { Row } from '@tanstack/react-table'
import { message as antdMessage } from 'antd'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

import * as styles from './LogDetails.css'

type Props = {
	row: Row<LogEdge>
}

export const LogDetails = ({ row }: Props) => {
	const navigate = useNavigate()
	const [allExpanded, setAllExpanded] = useState(false)
	const { traceID, spanID, secureSessionID, logAttributes, message, level } =
		row.original.node
	const expanded = row.getIsExpanded()
	const expandable = Object.values(logAttributes).some(
		(v) => typeof v === 'object',
	)

	if (!expanded) {
		if (allExpanded) {
			setAllExpanded(false)
		}

		return null
	}

	return (
		<Stack py="6" paddingBottom="0" gap="1">
			{Object.keys(logAttributes).map((key, index) => {
				const value = logAttributes[key as keyof typeof logAttributes]
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

			<Box>
				<LogValue label="level" value={level} />
			</Box>

			<Box>
				<LogValue label="message" value={message} />
			</Box>

			{traceID && (
				<Box>
					<LogValue label="trace_id" value={traceID} />
				</Box>
			)}
			{spanID && (
				<Box>
					<LogValue label="span_id" value={spanID} />
				</Box>
			)}
			{secureSessionID && (
				<Box>
					<LogValue
						label="secure_session_id"
						value={secureSessionID}
					/>
				</Box>
			)}

			<Box
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				flexDirection="row"
				gap="16"
				mt="8"
			>
				<Box
					display="flex"
					alignItems="center"
					flexDirection="row"
					gap="16"
				>
					{expandable && (
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
										<IconSolidChevronDoubleUp /> Collapse
										all
									</>
								) : (
									<>
										<IconSolidChevronDoubleDown />
										Expand all
									</>
								)}
							</Box>
						</ButtonLink>
					)}

					<ButtonLink
						kind="secondary"
						onClick={(e) => {
							e.stopPropagation()
							navigator.clipboard.writeText(
								JSON.stringify(row.original),
							)
							antdMessage.success('Copied logs!')
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

				<Box
					display="flex"
					alignItems="center"
					flexDirection="row"
					gap="16"
				>
					{row.original.node.level === LogLevel.Error && (
						<Tag
							shape="basic"
							kind="secondary"
							emphasis="medium"
							onClick={(e) => {
								e.stopPropagation()
								navigate(
									`/errors/logs/${row.original.cursor}`,
									{ replace: true },
								)
							}}
						>
							<Box
								display="flex"
								alignItems="center"
								flexDirection="row"
								gap="4"
							>
								<IconSolidLightningBolt />
								Related Error
							</Box>
						</Tag>
					)}
				</Box>
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
			const parsedJson = JSON.parse(attribute)
			stringIsJson = typeof parsedJson === 'object'
		} catch {}
	}

	const isObject = typeof attribute === 'object' || stringIsJson

	useEffect(() => {
		setOpen(allExpanded)
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
				{open ? <IconExpanded /> : <IconCollapsed />}
				<Box>
					<Text color="weak" family="monospace" weight="bold">
						{label}
					</Text>
				</Box>
			</LogAttributeLine>

			{open &&
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
		<Box flexShrink={0}>
			<Text family="monospace" weight="bold">
				"{label}":
			</Text>
		</Box>
		<Text family="monospace" weight="bold" color="caution" break="word">
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
			py="6"
			flexShrink={0}
		>
			{children}
		</Box>
	)
}
