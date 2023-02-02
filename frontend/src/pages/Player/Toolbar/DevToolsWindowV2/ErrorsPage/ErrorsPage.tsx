import JsonViewer from '@components/JsonViewer/JsonViewer'
import LoadingBox from '@components/LoadingBox'
import TextHighlighter from '@components/TextHighlighter/TextHighlighter'
import { ErrorObject } from '@graph/schemas'
import { Box, Tag, Text } from '@highlight-run/ui'
import {
	RightPanelView,
	usePlayerUIContext,
} from '@pages/Player/context/PlayerUIContext'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { EmptyDevToolsCallout } from '@pages/Player/Toolbar/DevToolsWindowV2/EmptyDevToolsCallout/EmptyDevToolsCallout'
import {
	findLastActiveEventIndex,
	Tab,
} from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import { getErrorBody } from '@util/errors/errorUtils'
import { parseOptionalJSON } from '@util/string'
import React, { useLayoutEffect, useMemo, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'
import { styledScrollbar } from 'style/common.css'

import { ReplayerState, useReplayerContext } from '../../../ReplayerContext'
import * as styles from './style.css'

interface ErrorsPageHistoryState {
	errorCardIndex: number
}

const ErrorsPage = ({
	autoScroll,
	filter,
	time,
}: {
	autoScroll: boolean
	filter: string
	time: number
}) => {
	const virtuoso = useRef<VirtuosoHandle>(null)
	const history = useHistory<ErrorsPageHistoryState>()
	const { errors, state, session, sessionMetadata } = useReplayerContext()

	const { setActiveError, setRightPanelView } = usePlayerUIContext()
	const { setShowRightPanel } = usePlayerConfiguration()

	const loading = state === ReplayerState.Loading

	/** Only errors recorded after this feature was released will have the timestamp. */

	const hasTimestamp = !loading && errors?.every((error) => !!error.timestamp)
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
		if (virtuoso.current && autoScroll) {
			if (history.location.state?.errorCardIndex !== undefined) {
				virtuoso.current.scrollToIndex(
					history.location.state.errorCardIndex,
				)
			} else {
				virtuoso.current.scrollToIndex(lastActiveErrorIndex)
			}
		}
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
		<Box className={styles.errorsContainer}>
			{loading ? (
				<LoadingBox />
			) : !session || !errorsToRender.length ? (
				<EmptyDevToolsCallout kind={Tab.Errors} filter={filter} />
			) : (
				<Virtuoso
					ref={virtuoso}
					overscan={500}
					data={errorsToRender}
					className={styledScrollbar}
					itemContent={(index, error) => (
						<ErrorRow
							key={error.error_group_secure_id}
							error={error}
							setSelectedError={() => {
								setShowRightPanel(true)
								setActiveError(error)
								setRightPanelView(RightPanelView.ERROR)
							}}
							searchQuery={filter}
							current={index === lastActiveErrorIndex}
						/>
					)}
				/>
			)}
		</Box>
	)
}

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
					<Text color="n11">
						{error.structured_stack_trace[0] &&
							`Line ${error.structured_stack_trace[0].lineNumber}:${error.structured_stack_trace[0].columnNumber}`}
					</Text>
				</Box>
				<Box display="flex" align="center" justifyContent="flex-end">
					<Tag kind="secondary" lines="1">
						{error.type}
					</Tag>
				</Box>
			</Box>
		)
	},
)

export default ErrorsPage
