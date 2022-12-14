import JsonViewer from '@components/JsonViewer/JsonViewer'
import TextHighlighter from '@components/TextHighlighter/TextHighlighter'
import Tooltip from '@components/Tooltip/Tooltip'
import { useGetMessagesQuery } from '@graph/hooks'
import { ConsoleMessage } from '@highlight-run/client'
import { indexedDBFetch } from '@util/db'
import { useParams } from '@util/react-router/useParams'
import { MillisToMinutesAndSeconds } from '@util/time'
import { message as AntDesignMessage } from 'antd'
import classNames from 'classnames'
import { H } from 'highlight.run'
import _ from 'lodash'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Linkify from 'react-linkify'
import Skeleton from 'react-loading-skeleton'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'

import GoToButton from '../../../../../components/Button/GoToButton'
import Input from '../../../../../components/Input/Input'
import { ReplayerState, useReplayerContext } from '../../../ReplayerContext'
import devStyles from '../DevToolsWindow.module.scss'
import { Option } from '../Option/Option'
import styles from './ConsolePage.module.scss'

interface ParsedMessage extends ConsoleMessage {
	selected?: boolean
	id: number
}

export const ConsolePage = React.memo(({ time }: { time: number }) => {
	const [currentMessage, setCurrentMessage] = useState(-1)
	const [filterSearchTerm, setFilterSearchTerm] = useState('')
	const { pause, sessionMetadata, state, session } = useReplayerContext()
	const [parsedMessages, setParsedMessages] = useState<
		undefined | Array<ParsedMessage>
	>([])
	const [consoleType, setConsoleType] = useState<string>('All')
	const [isInteractingWithMessages, setIsInteractingWithMessages] =
		useState(false)
	const { session_secure_id } = useParams<{ session_secure_id: string }>()
	const [loading, setLoading] = useState(true)
	const skipQuery = session === undefined || !!session?.messages_url
	const { data, loading: queryLoading } = useGetMessagesQuery({
		variables: {
			session_secure_id,
		},
		fetchPolicy: 'no-cache',
		skip: skipQuery, // Skip if there is a URL to fetch messages
	})

	useEffect(() => {
		if (!skipQuery) {
			setLoading(queryLoading)
		}
	}, [queryLoading, skipQuery])

	// If sessionSecureId is set and equals the current session's (ensures effect is run once)
	// and resources url is defined, fetch using resources url
	useEffect(() => {
		if (
			session_secure_id === session?.secure_id &&
			!!session?.messages_url
		) {
			setLoading(true)
			indexedDBFetch(session.messages_url)
				.then((response) => response.json())
				.then((data) => {
					setParsedMessages(
						(data as any[] | undefined)?.map(
							(m: ConsoleMessage, i) => {
								return {
									...m,
									id: i,
								}
							},
						) ?? [],
					)
				})
				.catch((e) => {
					setParsedMessages([])
					H.consumeError(e, 'Error direct downloading resources')
				})
				.finally(() => setLoading(false))
		}
	}, [session?.messages_url, session?.secure_id, session_secure_id])

	useEffect(() => {
		setParsedMessages(
			data?.messages?.map((m: ConsoleMessage, i) => {
				return {
					...m,
					id: i,
				}
			}) ?? [],
		)
	}, [data?.messages])

	const options = useMemo(() => {
		const base = parsedMessages?.map((o) => o.type) ?? []
		const uniqueSet = new Set(base)
		return ['All', ...Array.from(uniqueSet)]
	}, [parsedMessages])

	// Logic for scrolling to current entry.
	useEffect(() => {
		if (parsedMessages?.length) {
			let msgIndex = 0
			let msgDiff: number = Math.abs(time - parsedMessages[0].time)
			for (let i = 0; i < parsedMessages.length; i++) {
				const currentDiff: number = Math.abs(
					time - parsedMessages[i].time,
				)
				if (currentDiff < msgDiff) {
					msgIndex = i
					msgDiff = currentDiff
				}
			}
			if (currentMessage !== msgIndex) {
				setCurrentMessage(msgIndex)
			}
		}
	}, [currentMessage, time, parsedMessages])

	const messagesToRender = useMemo(() => {
		const currentMessages = parsedMessages?.filter((m) => {
			// if the console type is 'all', let all messages through. otherwise, filter.
			if (consoleType === 'All') {
				return true
			} else if (m.type === consoleType) {
				return true
			}
			return false
		})

		if (!currentMessages) {
			return []
		}

		if (filterSearchTerm !== '') {
			return currentMessages.filter((message) => {
				if (!message.value) {
					return false
				}

				switch (typeof message.value) {
					case 'string':
						return message.value
							.toLocaleLowerCase()
							.includes(filterSearchTerm.toLocaleLowerCase())
					case 'object':
						return message.value.some((line: string | null) => {
							return line
								?.toString()
								.toLocaleLowerCase()
								.includes(filterSearchTerm.toLocaleLowerCase())
						})
					default:
						return false
				}
			})
		}

		return currentMessages.filter((message) => message?.value?.length)
	}, [consoleType, filterSearchTerm, parsedMessages])

	const virtuoso = useRef<VirtuosoHandle>(null)
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const scrollFunction = useCallback(
		_.debounce((index: number, state) => {
			if (virtuoso.current && state === ReplayerState.Playing) {
				virtuoso.current.scrollToIndex({
					index,
					align: 'center',
					behavior: 'smooth',
				})
			}
		}, 1000 / 60),
		[],
	)

	useEffect(() => {
		if (!isInteractingWithMessages) {
			scrollFunction(currentMessage, state)
		}
	}, [scrollFunction, currentMessage, isInteractingWithMessages, state])

	return (
		<div className={styles.consolePageWrapper}>
			<div className={devStyles.topBar}>
				<div className={devStyles.optionsWrapper}>
					{options.map((o: string, i: number) => {
						return (
							<Option
								key={i}
								onSelect={() => setConsoleType(o)}
								selected={o === consoleType}
								optionValue={o}
							/>
						)
					})}
					<div className={styles.filterContainer}>
						<Input
							allowClear
							placeholder="Filter"
							value={filterSearchTerm}
							onChange={(event) => {
								setFilterSearchTerm(event.target.value)
							}}
							size="small"
							disabled={
								loading ||
								(messagesToRender.length === 0 &&
									filterSearchTerm.length === 0)
							}
						/>
					</div>
				</div>
			</div>
			<div className={styles.consoleStreamWrapper} id="logStreamWrapper">
				{loading ? (
					<div className={devStyles.skeletonWrapper}>
						<Skeleton
							count={2}
							style={{ height: 25, marginBottom: 11 }}
						/>
					</div>
				) : messagesToRender?.length ? (
					<Virtuoso
						onMouseEnter={() => {
							setIsInteractingWithMessages(true)
						}}
						onMouseLeave={() => {
							setIsInteractingWithMessages(false)
						}}
						ref={virtuoso}
						overscan={1024}
						increaseViewportBy={1024}
						components={{
							ScrollSeekPlaceholder: () => (
								<div
									style={{
										height: 36,
									}}
								/>
							),
						}}
						scrollSeekConfiguration={{
							enter: (v) => v > 512,
							exit: (v) => v < 128,
						}}
						data={messagesToRender}
						itemContent={(_index, message: ParsedMessage) => (
							<div key={message.id.toString()}>
								<div
									className={classNames(
										styles.consoleMessage,
										{
											[styles.consoleMessageWarn]:
												message.type === 'warn',
											[styles.consoleMessageAssert]:
												message.type === 'assert',
										},
									)}
								>
									<Tooltip title="This is the last logged console message. This is based on the current session time.">
										<div
											className={
												styles.currentIndicatorWrapper
											}
											style={{
												visibility:
													message.id ===
													currentMessage
														? 'visible'
														: 'hidden',
											}}
										>
											<div
												className={
													styles.currentIndicator
												}
											/>
										</div>
									</Tooltip>
									<div className={styles.messageText}>
										{message.value && (
											<ConsoleRender
												m={message.value}
												searchTerm={filterSearchTerm}
											/>
										)}
									</div>
									<GoToButton
										className={styles.goToButton}
										onClick={() => {
											pause(
												message.time -
													(sessionMetadata.startTime ??
														0),
											)
											AntDesignMessage.success(
												`Changed player time to when console message was created at ${MillisToMinutesAndSeconds(
													message.time -
														(sessionMetadata.startTime ??
															0),
												)}.`,
											)
										}}
									/>
								</div>
							</div>
						)}
					/>
				) : messagesToRender.length === 0 && filterSearchTerm !== '' ? (
					<div className={devStyles.emptySection}>
						No messages matching '{filterSearchTerm}'
					</div>
				) : (
					<div className={devStyles.emptySection}>
						There are no console logs for this session.
					</div>
				)}
			</div>
		</div>
	)
})

const ConsoleRender = React.memo(
	({ m, searchTerm }: { m: Array<any> | string; searchTerm: string }) => {
		const input: Array<any> = typeof m === 'string' ? [m] : m
		const result: Array<string | object> = processMessageStrings(input)

		// if the message is large, do not linkify as this may freeze the UI
		return (
			<div>
				{result.map((r, idx) =>
					typeof r === 'object' ? (
						<JsonViewer
							name="Object"
							collapsed
							src={r}
							key={`console-msg-${idx}`}
						/>
					) : r.length > 1024 ? (
						<div className={styles.messageText}>
							<p>{r}</p>
						</div>
					) : searchTerm === '' ? (
						<Linkify>{r}</Linkify>
					) : (
						<div className={styles.messageText}>
							<TextHighlighter
								searchWords={[searchTerm]}
								autoEscape={true}
								textToHighlight={r}
							/>
						</div>
					),
				)}
			</div>
		)
	},
	(prevProps, nextProps) =>
		_.isEqual(prevProps.m, nextProps.m) &&
		prevProps.searchTerm === nextProps.searchTerm,
)

const processMessageStrings = (
	message: Array<string | object>,
): Array<string | object> => {
	const res: Array<string | object> = []

	message.forEach((_m) => {
		let m = _m
		if (typeof m === 'string') {
			// Remove escaped quotes at the start and the end of the message.
			if (m.length > 0 && m[0] === '"' && m[m.length - 1] === '"') {
				m = `${m.slice(1, m.length - 1)} `
			}

			// Replace escaped new lines with an actual new line.
			m = m.replaceAll('\\n', '\n')

			// Replace the escaped quotes in object keys.
			m = m.replaceAll('\\"', '"')
			res.push(m)
		} else {
			res.push(m)
		}
	})

	return res
}
