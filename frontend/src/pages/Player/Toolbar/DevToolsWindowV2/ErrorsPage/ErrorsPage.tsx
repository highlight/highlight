import LoadingBox from '@components/LoadingBox'
import TextHighlighter from '@components/TextHighlighter/TextHighlighter'
import { ErrorObject } from '@graph/schemas'
import {
	Box,
	IconSolidArrowCircleRight,
	Tag,
	Text,
} from '@highlight-run/ui/components'
import { themeVars } from '@highlight-run/ui/theme'
import {
	RightPanelView,
	usePlayerUIContext,
} from '@pages/Player/context/PlayerUIContext'
import { THROTTLED_UPDATE_MS } from '@pages/Player/PlayerHook/PlayerState'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { EmptyDevToolsCallout } from '@pages/Player/Toolbar/DevToolsWindowV2/EmptyDevToolsCallout/EmptyDevToolsCallout'
import {
	findLastActiveEventIndex,
	Tab,
} from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import { getErrorBody } from '@util/errors/errorUtils'
import { parseOptionalJSON } from '@util/string'
import _ from 'lodash'
import React, {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
} from 'react'
import { useLocation } from 'react-router-dom'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'

import { styledVerticalScrollbar } from '@/style/common.css'
import analytics from '@/util/analytics'

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

	const { activeError, setActiveError, setRightPanelView } =
		usePlayerUIContext()
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

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const scrollFunction = useCallback(
		_.debounce((index: number) => {
			requestAnimationFrame(() => {
				if (virtuoso.current) {
					virtuoso.current.scrollToIndex({
						index,
						align: 'center',
					})
				}
			})
		}, THROTTLED_UPDATE_MS),
		[],
	)

	useLayoutEffect(() => {
		if (autoScroll) {
			if (location.state?.errorCardIndex !== undefined) {
				scrollFunction(location.state.errorCardIndex)
			} else {
				scrollFunction(lastActiveErrorIndex)
			}
		}
	}, [
		autoScroll,
		location.state?.errorCardIndex,
		lastActiveErrorIndex,
		scrollFunction,
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

	const selectedError = useMemo(() => {
		if (!activeError) return

		return errors.find((error) => error.id === activeError.id)
	}, [activeError, errors])

	useEffect(() => {
		analytics.track('session_view-errors')
	}, [])

	return (
		<Box cssClass={styles.errorsContainer}>
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
							onClickHandler={() => {
								setActiveError(error)
								setShowRightPanel(true)
								setRightPanelView(RightPanelView.Error)
							}}
							setActiveError={setActiveError}
							setTime={setTime}
							startTime={sessionMetadata.startTime}
							searchQuery={filter}
							selectedError={selectedError?.id === error.id}
							current={index === lastActiveErrorIndex}
							past={index <= lastActiveErrorIndex}
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
	onClickHandler: () => void
	selectedError: boolean
	setActiveError: React.Dispatch<
		React.SetStateAction<ErrorObject | undefined>
	>
	setTime: (time: number) => void
	startTime: number
	searchQuery: string
	current?: boolean
	past?: boolean
}

const ErrorRow = React.memo(
	({
		error,
		onClickHandler,
		selectedError,
		setActiveError,
		setTime,
		startTime,
		searchQuery,
		current,
		past,
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
			<Box key={error.id} mx="4">
				<Box
					cssClass={styles.errorRowVariants({
						current,
						selected: selectedError,
					})}
					onClick={onClickHandler}
					style={{
						opacity: past ? 1 : 0.4,
					}}
				>
					<Box>
						<TextHighlighter
							searchWords={[searchQuery]}
							textToHighlight={
								typeof body === 'object'
									? JSON.stringify(body)
									: body
							}
							className={styles.cellContent}
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
								className={styles.cellContent}
							/>
						)}
					</Box>
					<Box
						display="flex"
						align="center"
						justifyContent="flex-end"
					>
						<Text color="weak">
							{error.structured_stack_trace[0] &&
								`Line ${error.structured_stack_trace[0].lineNumber}:` +
									`${error.structured_stack_trace[0].columnNumber}`}
						</Text>
					</Box>
					<Box
						display="flex"
						align="center"
						justifyContent="flex-end"
					>
						<Tag kind="secondary" lines="1">
							{error.type}
						</Tag>
					</Box>
					<Box
						display="flex"
						align="center"
						justifyContent="flex-end"
					>
						<Tag
							shape="basic"
							emphasis="low"
							kind="secondary"
							size="medium"
							onClick={(event) => {
								setTime(timestamp)
								event.stopPropagation() /* Prevents opening of right panel by parent row's onClick handler */
								setActiveError(error)
							}}
						>
							<IconSolidArrowCircleRight />
						</Tag>
					</Box>
				</Box>
				{current && (
					<Box
						borderRadius="2"
						style={{
							backgroundColor:
								themeVars.interactive.fill.primary.enabled,
							height: 2,
						}}
					/>
				)}
			</Box>
		)
	},
)

export default ErrorsPage
