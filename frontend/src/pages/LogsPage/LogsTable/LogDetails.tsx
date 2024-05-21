import { Button } from '@components/Button'
import { toast } from '@components/Toaster'
import { LogEdge, LogLevel, Maybe, ReservedLogKey } from '@graph/schemas'
import {
	Box,
	IconSolidChevronDoubleDown,
	IconSolidChevronDoubleUp,
	IconSolidClipboard,
	IconSolidLightningBolt,
	IconSolidLink,
	IconSolidLocationMarker,
	IconSolidPlayCircle,
	IconSolidSparkles,
	Stack,
} from '@highlight-run/ui/components'
import { useProjectId } from '@hooks/useProjectId'
import { LogEdgeWithResources } from '@pages/LogsPage/useGetLogs'
import { Row } from '@tanstack/react-table'
import React, { useState } from 'react'
import { generatePath, useNavigate } from 'react-router-dom'

import {
	JsonViewerObject,
	JsonViewerValue,
} from '@/components/JsonViewer/JsonViewerObject'
import { findMatchingAttributes } from '@/components/JsonViewer/utils'
import { useRelatedResource } from '@/components/RelatedResources/hooks'
import { SearchExpression } from '@/components/Search/Parser/listener'
import { useSearchContext } from '@/components/Search/SearchContext'

type Props = {
	row: Row<LogEdgeWithResources>
	queryParts: SearchExpression[]
	matchedAttributes: ReturnType<typeof findMatchingAttributes>
}

export const getLogURL = (projectId: string, row: Row<LogEdge>) => {
	const currentUrl = new URL(window.location.href)
	const path = generatePath('/:project_id/logs/:log_cursor', {
		project_id: projectId,
		log_cursor: row.original.cursor,
	})
	return { origin: currentUrl.origin, path }
}

export const LogDetails: React.FC<Props> = ({
	matchedAttributes,
	row,
	queryParts,
}) => {
	const { disabled, onSubmit } = useSearchContext()
	const setQuery = disabled ? undefined : onSubmit
	const { set } = useRelatedResource()
	const { projectId } = useProjectId()
	const navigate = useNavigate()
	const [allExpanded, setAllExpanded] = useState(false)
	const {
		environment,
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
		[key in ReservedLogKey]?: Maybe<string> | undefined
	} = {
		environment,
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
		<Stack py="0" gap="1">
			{Object.entries(logAttributes).map(([key, value], index) => {
				const isObject = typeof value === 'object'

				return (
					<Box key={index}>
						{isObject ? (
							<JsonViewerObject
								allExpanded={allExpanded}
								attribute={value as object}
								label={key}
								matchedAttributes={matchedAttributes}
								queryParts={queryParts}
								queryBaseKeys={[key]}
								setQuery={setQuery}
							/>
						) : (
							<JsonViewerValue
								label={key}
								value={String(value)}
								queryKey={key}
								queryParts={queryParts}
								queryMatch={matchedAttributes[key]?.match}
								setQuery={setQuery}
							/>
						)}
					</Box>
				)
			})}

			{Object.entries(reservedLogAttributes).map(
				([key, value], index) =>
					value && (
						<Box key={index}>
							<JsonViewerValue
								label={key}
								value={value}
								queryKey={key}
								queryParts={queryParts}
								queryMatch={matchedAttributes[key]?.match}
								setQuery={setQuery}
							/>
						</Box>
					),
			)}

			<Box display="flex" alignItems="center" flexDirection="row">
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
							trackingId="logs_toggle-expand-all_click"
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
							toast.success('Copied logs!')
						}}
						trackingId="logs_copy-json_click"
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
							navigator.clipboard.writeText(url.origin + url.path)
							toast.success('Copied link!')
						}}
						trackingId="logs_copy-link_click"
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
					<Button
						kind="secondary"
						emphasis="low"
						onClick={(e) => {
							e.stopPropagation()
							const url = getLogURL(projectId, row)
							navigate(url.path)
						}}
						trackingId="logs_view-in-context_click"
					>
						<Box
							display="flex"
							alignItems="center"
							flexDirection="row"
							gap="4"
						>
							<IconSolidLocationMarker />
							View in Context
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
						<Button
							kind="secondary"
							emphasis="low"
							onClick={() => {
								const { error_object } = row.original

								if (error_object) {
									set({
										type: 'error',
										secureId:
											error_object.error_group_secure_id,
										instanceId: error_object.id,
									})
								}
							}}
							trackingId="logs_related-error_click"
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
						</Button>
					)}

					{secureSessionID && (
						<Button
							kind="secondary"
							emphasis="low"
							onClick={() => {
								set({
									type: 'session',
									secureId: secureSessionID,
									log: row.original.cursor,
								})
							}}
							trackingId="logs_related-session_click"
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
						</Button>
					)}
					{row.original.traceExist && (
						<Button
							kind="secondary"
							emphasis="low"
							trackingId="logs_related-trace_click"
							onClick={() => {
								if (!traceID) {
									return
								}

								set({ type: 'trace', id: traceID })
							}}
						>
							<Box
								display="flex"
								alignItems="center"
								flexDirection="row"
								gap="4"
							>
								<IconSolidSparkles />
								Related Trace
							</Box>
						</Button>
					)}
				</Box>
			</Box>
		</Stack>
	)
}
