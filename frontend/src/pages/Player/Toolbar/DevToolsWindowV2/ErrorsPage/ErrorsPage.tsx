import JsonViewer from '@components/JsonViewer/JsonViewer'
import TextHighlighter from '@components/TextHighlighter/TextHighlighter'
import { ErrorObject } from '@graph/schemas'
import { Box, Tag, Text } from '@highlight-run/ui'
import { useResourceOrErrorDetailPanel } from '@pages/Player/Toolbar/DevToolsWindow/ResourceOrErrorDetailPanel/ResourceOrErrorDetailPanel'
import { EmptyDevToolsCallout } from '@pages/Player/Toolbar/DevToolsWindowV2/EmptyDevToolsCallout/EmptyDevToolsCallout'
import {
	findLastActiveEventIndex,
	Tab,
} from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import { getErrorBody } from '@util/errors/errorUtils'
import { parseOptionalJSON } from '@util/string'
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { useHistory } from 'react-router-dom'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'

import { ReplayerState, useReplayerContext } from '../../../ReplayerContext'
import * as styles from './style.css'

interface ErrorsPageHistoryState {
	errorCardIndex: number
}

const ErrorsPage = React.memo(
	({
		autoScroll,
		filter,
		time,
	}: {
		autoScroll: boolean
		filter: string
		time: number
	}) => {
		const virtuoso = useRef<VirtuosoHandle>(null)
		const [isInteractingWithErrors, setIsInteractingWithErrors] =
			useState(false)
		const history = useHistory<ErrorsPageHistoryState>()
		const { errors, state, session, sessionMetadata, setTime } =
			useReplayerContext()
		const { setErrorPanel } = useResourceOrErrorDetailPanel()

		const loading = state === ReplayerState.Loading

		/** Only errors recorded after this feature was released will have the timestamp. */

		const hasTimestamp =
			!loading && errors?.every((error) => !!error.timestamp)
		const lastActiveErrorIndex = useMemo(() => {
			if (hasTimestamp) {
				return findLastActiveEventIndex(
					time,
					sessionMetadata.startTime,
					errors,
				)
			}
			return -1
		}, [errors, hasTimestamp, sessionMetadata.startTime, time])

		useLayoutEffect(() => {
			if (virtuoso.current && autoScroll && !isInteractingWithErrors) {
				if (history.location.state?.errorCardIndex !== undefined) {
					virtuoso.current.scrollToIndex(
						history.location.state.errorCardIndex,
					)
				} else {
					virtuoso.current.scrollToIndex(lastActiveErrorIndex)
				}
			}
			// want this to trigger on autoscroll change, not isInteractingWithMessages
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [
			autoScroll,
			history.location.state?.errorCardIndex,
			lastActiveErrorIndex,
		])

		const errorsToRender = useMemo(() => {
			if (!filter.length) {
				return errors
			}

			return errors.filter((error) => {
				const normalizedfilter = filter.toLocaleLowerCase()

				return error.event.some(
					(line) =>
						line?.toLocaleLowerCase().includes(normalizedfilter) ||
						error.source
							?.toLocaleLowerCase()
							.includes(normalizedfilter),
				)
			})
		}, [errors, filter])

		return (
			<Box className={styles.errorsBox}>
				{loading ? (
					<Skeleton
						count={2}
						style={{ height: 25, marginBottom: 11 }}
					/>
				) : !session || !errorsToRender.length ? (
					<EmptyDevToolsCallout kind={Tab.Errors} filter={filter} />
				) : (
					<Virtuoso
						onMouseEnter={() => {
							setIsInteractingWithErrors(true)
						}}
						onMouseLeave={() => {
							setIsInteractingWithErrors(false)
						}}
						ref={virtuoso}
						overscan={500}
						data={errorsToRender}
						itemContent={(index, error) => (
							<ErrorRow
								key={error.error_group_secure_id}
								error={error}
								setSelectedError={() => {
									setErrorPanel(error)
									setTime(
										new Date(error.timestamp).getTime() -
											sessionMetadata.startTime,
									)
								}}
								searchQuery={filter}
								current={index === lastActiveErrorIndex}
							/>
						)}
					/>
				)}
			</Box>
		)
	},
)

export enum ErrorCardState {
	Unknown,
	Active,
	Inactive,
}
interface Props {
	error: ErrorObject
	setSelectedError: () => void
	searchQuery: string
	current?: boolean
}

const ErrorRow = React.memo(
	({ error, setSelectedError, searchQuery, current }: Props) => {
		const body = useMemo(
			() => parseOptionalJSON(getErrorBody(error.event)),
			[error.event],
		)
		const context = useMemo(() => {
			const data = parseOptionalJSON(error.payload || '')
			return data === 'null' ? '' : data
		}, [error.payload])
		return (
			<Box
				key={error.id}
				className={styles.errorRowVariants({
					current,
				})}
				onClick={setSelectedError}
			>
				<Box className={styles.errorBody}>
					{typeof body === 'object' ? (
						<JsonViewer src={body} collapsed={1} />
					) : (
						<TextHighlighter
							searchWords={[searchQuery]}
							textToHighlight={body}
						/>
					)}
				</Box>
				<Box className={styles.errorBody}>
					{context &&
						(typeof context === 'object' ? (
							<JsonViewer src={context} collapsed={1} />
						) : (
							<TextHighlighter
								searchWords={[searchQuery]}
								textToHighlight={context}
							/>
						))}
				</Box>
				<Box display="flex" align="center" justifyContent="flex-end">
					<Text color="neutralN11">
						{error.structured_stack_trace[0] &&
							`Line ${error.structured_stack_trace[0].lineNumber}:${error.structured_stack_trace[0].columnNumber}`}
					</Text>
				</Box>
				<Box display="flex" align="center" justifyContent="flex-end">
					<Tag kind="grey">
						<Text color="neutralN11">{error.type}</Text>
					</Tag>
				</Box>
			</Box>
		)
	},
)

export default ErrorsPage
