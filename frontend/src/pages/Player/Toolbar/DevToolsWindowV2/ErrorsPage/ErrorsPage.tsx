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
// import { playerTimeToSessionAbsoluteTime } from '@util/session/utils'
import { parseOptionalJSON } from '@util/string'
// import { MillisToMinutesAndSeconds } from '@util/time'
import React, { useLayoutEffect, useMemo, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'
import { styledVerticalScrollbar } from 'style/common.css'

import { ReplayerState, useReplayerContext } from '../../../ReplayerContext'
import * as styles from './style.css'

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
	const location = useLocation()
	const { errors, state, session, sessionMetadata, isPlayerReady, setTime } =
		useReplayerContext()

	const { setActiveError, setRightPanelView } = usePlayerUIContext()
	const { setShowRightPanel, showPlayerAbsoluteTime } =
		usePlayerConfiguration()

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
			if (location.state?.errorCardIndex !== undefined) {
				virtuoso.current.scrollToIndex(location.state.errorCardIndex)
			} else {
				virtuoso.current.scrollToIndex(lastActiveErrorIndex)
			}
		}
	}, [autoScroll, location.state?.errorCardIndex, lastActiveErrorIndex])

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
			{loading || !isPlayerReady ? (
				<LoadingBox />
			) : !session || !errorsToRender.length ? (
				<EmptyDevToolsCallout kind={Tab.Errors} filter={filter} />
			) : (
				<Virtuoso
					ref={virtuoso}
					overscan={500}
					data={errorsToRender}
					className={styledVerticalScrollbar}
					itemContent={(index, error) => (
						<ErrorRow
							key={error.error_group_secure_id}
							error={error}
							setSelectedError={() => {
								setShowRightPanel(true)
								setActiveError(error)
								setRightPanelView(RightPanelView.Error)
							}}
							setTime={setTime}
							startTime={sessionMetadata.startTime}
							showPlayerAbsoluteTime={showPlayerAbsoluteTime}
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
	setTime: (time: number) => void
	startTime: number
	showPlayerAbsoluteTime: boolean
	searchQuery: string
	current?: boolean
}

const ErrorRow = React.memo(
	({
		error,
		setSelectedError,
		setTime,
		startTime,
		showPlayerAbsoluteTime,
		searchQuery,
		current,
	}: Props) => {
		const body = useMemo(
			() => parseOptionalJSON(getErrorBody(error.event)),
			[error.event],
		)
		const context = useMemo(() => {
			const data = parseOptionalJSON(error.payload || '')
			return data === 'null' ? '' : data
		}, [error.payload])

		const timestamp = useMemo(() => {
			return new Date(error.timestamp).getTime() - startTime
		}, [error.timestamp, startTime])

		return (
			<Box
				key={error.id}
				className={styles.errorRowVariants({
					current,
				})}
				onClick={setSelectedError}
			>
				<Box>
					<TextHighlighter
						searchWords={[searchQuery]}
						textToHighlight={
							typeof body === 'object'
								? JSON.stringify(body)
								: body
						}
						className={styles.singleLine}
					/>
				</Box>
				<Box>
					{context && (
						<TextHighlighter
							searchWords={[searchQuery]}
							textToHighlight={
								typeof context === 'object'
									? JSON.stringify(context)
									: context
							}
							className={styles.singleLine}
						/>
					)}
				</Box>
				{/* @Julian - can this timestamp tag be arranged nicely into the row? */}
				{/* Once ready, 'uncomment' imports for playerTimeToSessionAbsoluteTime & MillisToMinutesAndSeconds */}
				{/* <Box>
					<Tag
						shape="basic"
						kind="secondary"
						size="medium"
						style={{
							marginRight: 'auto',
							flexShrink: 0,
						}}
						onClick={() => {
							setTime(timestamp)
						}}
					>
						{showPlayerAbsoluteTime
							? playerTimeToSessionAbsoluteTime({
									sessionStartTime: startTime,
									relativeTime: timestamp,
							  })
							: MillisToMinutesAndSeconds(timestamp)}
					</Tag>
				</Box> */}
				<Box display="flex" align="center" justifyContent="flex-end">
					<Text color="n11">
						{error.structured_stack_trace[0] &&
							`Line ${error.structured_stack_trace[0].lineNumber}:` +
								`${error.structured_stack_trace[0].columnNumber}`}
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
