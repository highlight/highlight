import { Button } from '@components/Button'
import { LinkButton } from '@components/LinkButton'
import { LogEdge, LogLevel, Maybe, ReservedLogKey } from '@graph/schemas'
import {
	Box,
	IconSolidChevronDoubleDown,
	IconSolidChevronDoubleUp,
	IconSolidClipboard,
	IconSolidClipboardCopy,
	IconSolidFilter,
	IconSolidLightningBolt,
	IconSolidLink,
	IconSolidPlayCircle,
	Stack,
	Text,
	Tooltip,
} from '@highlight-run/ui/components'
import { useProjectId } from '@hooks/useProjectId'
import {
	IconCollapsed,
	IconExpanded,
} from '@pages/LogsPage/LogsTable/LogsTable'
import { LogEdgeWithError } from '@pages/LogsPage/useGetLogs'
import { PlayerSearchParameters } from '@pages/Player/PlayerHook/utils'
import { Row } from '@tanstack/react-table'
import { message as antdMessage } from 'antd'
import React, { Fragment, useEffect, useState } from 'react'
import { createSearchParams, generatePath } from 'react-router-dom'
import { useQueryParam } from 'use-query-params'

import { QueryParam } from '@/components/Search/SearchForm/SearchForm'
import {
	DEFAULT_OPERATOR,
	quoteQueryValue,
	SearchParam,
	stringifySearchQuery,
} from '@/components/Search/SearchForm/utils'
import TextHighlighter from '@/components/TextHighlighter/TextHighlighter'
import { findMatchingLogAttributes } from '@/pages/LogsPage/utils'

import * as styles from './LogDetails.css'
import * as logsTableStyles from './LogsTable.css'

type Props = {
	row: Row<LogEdgeWithError>
	queryTerms: SearchParam[]
	matchedAttributes: ReturnType<typeof findMatchingLogAttributes>
}

export const getLogURL = (projectId: string, row: Row<LogEdge>) => {
	const currentUrl = new URL(window.location.href)
	const path = generatePath('/:project_id/logs/:log_cursor', {
		project_id: projectId,
		log_cursor: row.original.cursor,
	})
	return currentUrl.origin + path
}

const getSessionLink = (projectId: string, log: LogEdgeWithError): string => {
	const params = createSearchParams({
		[PlayerSearchParameters.log]: log.cursor,
	})
	return `/${projectId}/sessions/${log.node.secureSessionID}?${params}`
}

const getErrorLink = (projectId: string, log: LogEdgeWithError): string => {
	const params = createSearchParams({
		[PlayerSearchParameters.log]: log.cursor,
	})
	return `/errors/${log.error_object?.error_group_secure_id}/instances/${log.error_object?.id}?${params}`
}

export const LogDetails: React.FC<Props> = ({
	matchedAttributes,
	row,
	queryTerms,
}) => {
	const { projectId } = useProjectId()
	const [allExpanded, setAllExpanded] = useState(false)
	const {
		traceID,
		spanID,
		secureSessionID,
		logAttributes,
		message,
		level,
		source,
		serviceName,
		serviceVersion,
	} = row.original.node
	const expanded = row.getIsExpanded()
	const expandable = Object.values(logAttributes).some(
		(v) => typeof v === 'object',
	)
	const reservedLogAttributes: {
		level: LogLevel
		message: string
	} & {
		[key in ReservedLogKey]: Maybe<string> | undefined
	} = {
		level,
		message,
		trace_id: traceID,
		span_id: spanID,
		secure_session_id: secureSessionID,
		source,
		service_name: serviceName,
		service_version: serviceVersion,
	}

	if (!expanded) {
		if (allExpanded) {
			setAllExpanded(false)
		}

		return null
	}

	return (
		<Stack py="6" paddingBottom="0" gap="1">
			{Object.entries(logAttributes).map(([key, value], index) => {
				const isObject = typeof value === 'object'

				return (
					<Box key={index}>
						{isObject ? (
							<LogDetailsObject
								allExpanded={allExpanded}
								attribute={value as object}
								label={key}
								matchedAttributes={matchedAttributes}
								queryTerms={queryTerms}
								queryBaseKeys={[key]}
							/>
						) : (
							<LogValue
								label={key}
								value={String(value)}
								queryKey={key}
								queryTerms={queryTerms}
							/>
						)}
					</Box>
				)
			})}

			{Object.entries(reservedLogAttributes).map(
				([key, value]) =>
					value && (
						<Box key={key}>
							<LogValue
								label={key}
								value={value}
								queryKey={key}
								queryTerms={queryTerms}
								queryMatch={matchedAttributes[key]?.match}
							/>
						</Box>
					),
			)}

			<Box display="flex" alignItems="center" flexDirection="row" mt="8">
				<Box
					display="flex"
					alignItems="center"
					flexDirection="row"
					gap="4"
				>
					{expandable && (
						<Button
							kind="secondary"
							emphasis="low"
							onClick={(e) => {
								e.stopPropagation()
								setAllExpanded(!allExpanded)
							}}
							trackingId="logs-row_toggle-expand-all"
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
						</Button>
					)}

					<Button
						kind="secondary"
						emphasis="low"
						onClick={(e) => {
							e.stopPropagation()

							const json = { ...logAttributes }
							Object.entries(reservedLogAttributes).forEach(
								([key, value]) => {
									if (value) {
										json[key] = value
									}
								},
							)

							navigator.clipboard.writeText(JSON.stringify(json))
							antdMessage.success('Copied logs!')
						}}
						trackingId="logs-row_copy-json"
					>
						<Box
							display="flex"
							alignItems="center"
							flexDirection="row"
							gap="4"
						>
							<IconSolidClipboard />
							Copy JSON
						</Box>
					</Button>

					<Button
						kind="secondary"
						emphasis="low"
						onClick={(e) => {
							const url = getLogURL(projectId, row)
							e.stopPropagation()
							navigator.clipboard.writeText(url)
							antdMessage.success('Copied link!')
						}}
						trackingId="logs-row_copy-link"
					>
						<Box
							display="flex"
							alignItems="center"
							flexDirection="row"
							gap="4"
						>
							<IconSolidLink />
							Copy link
						</Box>
					</Button>
				</Box>

				<Box
					display="flex"
					alignItems="center"
					flexDirection="row"
					gap="4"
					borderLeft="secondary"
					ml="4"
					pl="4"
				>
					{row.original.error_object && (
						<LinkButton
							kind="secondary"
							emphasis="low"
							to={getErrorLink(projectId, row.original)}
							trackingId="logs-related_error_link"
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
						</LinkButton>
					)}

					{secureSessionID && (
						<LinkButton
							kind="secondary"
							emphasis="low"
							to={getSessionLink(projectId, row.original)}
							trackingId="logs-related_session_link"
						>
							<Box
								display="flex"
								alignItems="center"
								flexDirection="row"
								gap="4"
							>
								<IconSolidPlayCircle />
								Related Session
							</Box>
						</LinkButton>
					)}
				</Box>
			</Box>
		</Stack>
	)
}

const LogDetailsObject: React.FC<{
	allExpanded: boolean
	attribute: string | object | number
	label: string
	queryBaseKeys: string[]
	queryTerms: SearchParam[]
	matchedAttributes: ReturnType<typeof findMatchingLogAttributes>
}> = ({
	allExpanded,
	attribute,
	label,
	matchedAttributes,
	queryBaseKeys,
	queryTerms,
}) => {
	const [open, setOpen] = useState(false)

	if (typeof attribute === 'string') {
		try {
			attribute = JSON.parse(attribute)
		} catch {}
	}

	const queryKey = queryBaseKeys.join('.') || label
	const queryMatch = matchedAttributes[queryKey]

	useEffect(() => {
		setOpen(allExpanded)
	}, [allExpanded])

	return typeof attribute === 'object' ? (
		<Box
			cssClass={styles.line}
			onClick={(e) => {
				e.stopPropagation()
				setOpen(!open)
			}}
		>
			<LogAttributeLine>
				{open ? <IconExpanded /> : <IconCollapsed />}
				<Box py="6">
					<Text color="weak" family="monospace">
						{label}
					</Text>
				</Box>
			</LogAttributeLine>

			{open &&
				Object.entries(attribute).map(([key, value], index) => (
					<LogDetailsObject
						key={index}
						allExpanded={allExpanded}
						attribute={value}
						label={key}
						matchedAttributes={matchedAttributes}
						queryTerms={queryTerms}
						queryBaseKeys={[...queryBaseKeys, key]}
					/>
				))}
		</Box>
	) : (
		<Box cssClass={styles.line}>
			<LogValue
				label={label}
				value={String(attribute)}
				queryKey={queryKey}
				queryTerms={queryTerms}
				queryMatch={queryMatch?.match}
			/>
		</Box>
	)
}

export const LogValue: React.FC<{
	label: string
	value: string
	queryTerms: SearchParam[]
	queryKey: string
	queryMatch?: string
}> = ({ label, queryKey, queryTerms, value, queryMatch }) => {
	const [_, setQuery] = useQueryParam('query', QueryParam)

	// replace wildcards for highlighting.
	const matchPattern = queryMatch?.replaceAll('*', '')

	return (
		<LogAttributeLine>
			<Box
				flexShrink={0}
				py="6"
				onClick={(e: any) => e.stopPropagation()}
			>
				<Text family="monospace">"{label}":</Text>
			</Box>
			<Box
				display="flex"
				flexDirection="row"
				alignItems="center"
				gap="8"
				onClick={(e: any) => e.stopPropagation()}
			>
				<Box borderRadius="4" p="6">
					<Text family="monospace" color="caution" break="word">
						{matchPattern ? (
							<TextHighlighter
								highlightClassName={
									logsTableStyles.textHighlight
								}
								searchWords={[matchPattern]}
								textToHighlight={value}
							/>
						) : (
							<>{value ? value : '""'}</>
						)}
					</Text>
				</Box>
				<Box cssClass={styles.attributeActions}>
					<Box>
						<Tooltip
							trigger={
								<IconSolidFilter
									className={styles.attributeAction}
									size="12"
									onClick={() => {
										if (!queryTerms) {
											return
										}

										const index = queryTerms.findIndex(
											(term) => term.key === queryKey,
										)

										index !== -1
											? (queryTerms[index].value = value)
											: queryTerms.push({
													key: queryKey,
													value: quoteQueryValue(
														value,
													),
													operator: DEFAULT_OPERATOR,
													offsetStart: 0, // not actually used
											  })

										setQuery(
											stringifySearchQuery(queryTerms),
										)
									}}
								/>
							}
							delayed
						>
							<Box p="4">
								<Text userSelect="none" color="n11">
									Apply as filter
								</Text>
							</Box>
						</Tooltip>
					</Box>
					<Box>
						<Tooltip
							trigger={
								<IconSolidClipboardCopy
									className={styles.attributeAction}
									size="12"
									onClick={() => {
										navigator.clipboard.writeText(
											quoteQueryValue(value),
										)
										antdMessage.success(
											'Value copied to your clipboard',
										)
									}}
								/>
							}
							delayed
						>
							<Box p="4">
								<Text userSelect="none" color="n11">
									Copy to your clipboard
								</Text>
							</Box>
						</Tooltip>
					</Box>
				</Box>
			</Box>
		</LogAttributeLine>
	)
}

const LogAttributeLine: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<Box
			cssClass={styles.logAttributeLine}
			display="flex"
			alignItems="flex-start"
			flexDirection="row"
			gap="4"
			flexShrink={0}
		>
			{children}
		</Box>
	)
}
