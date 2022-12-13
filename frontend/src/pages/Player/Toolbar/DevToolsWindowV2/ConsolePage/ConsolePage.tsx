import { useGetMessagesQuery } from '@graph/hooks'
import { ConsoleMessage } from '@highlight-run/client'
import { playerMetaData } from '@highlight-run/rrweb/typings/types'
import { Box, Text } from '@highlight-run/ui'
import devStyles from '@pages/Player/Toolbar/DevToolsWindow/DevToolsWindow.module.scss'
import { EmptyDevToolsCallout } from '@pages/Player/Toolbar/DevToolsWindowV2/EmptyDevToolsCallout/EmptyDevToolsCallout'
import { LogLevel, Tab } from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import { indexedDBFetch } from '@util/db'
import { useParams } from '@util/react-router/useParams'
import clsx from 'clsx'
import { H } from 'highlight.run'
import _ from 'lodash'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'

import { useReplayerContext } from '../../../ReplayerContext'
import * as styles from './style.css'

interface ParsedMessage extends ConsoleMessage {
	selected?: boolean
	id: number
}

export const ConsolePage = React.memo(
	({
		autoScroll,
		filter,
		logLevel,
		time,
	}: {
		autoScroll: boolean
		filter: string
		logLevel: LogLevel
		time: number
	}) => {
		const [currentMessage, setCurrentMessage] = useState(-1)
		const { session, setTime, sessionMetadata } = useReplayerContext()
		const [parsedMessages, setParsedMessages] = useState<
			undefined | Array<ParsedMessage>
		>([])
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

		// Logic for scrolling to current entry.
		useEffect(() => {
			if (parsedMessages?.length) {
				let msgIndex = 0
				let msgDiff: number = Number.MAX_VALUE
				for (let i = 0; i < parsedMessages.length; i++) {
					const currentDiff: number =
						time - (parsedMessages[i].time - parsedMessages[0].time)
					if (currentDiff < 0) break
					if (currentDiff < msgDiff) {
						msgIndex = i
						msgDiff = currentDiff
					}
				}
				setCurrentMessage(msgIndex)
			}
		}, [time, parsedMessages])

		const messagesToRender = useMemo(() => {
			const currentMessages = parsedMessages?.filter((m) => {
				// if the console type is 'all', let all messages through. otherwise, filter.
				if (logLevel === LogLevel.All) {
					return true
				} else if (m.type === logLevel.toLowerCase()) {
					return true
				}
				return false
			})

			if (!currentMessages) {
				return []
			}

			if (filter !== '') {
				return currentMessages.filter((message) => {
					if (!message.value) {
						return false
					}

					switch (typeof message.value) {
						case 'string':
							return message.value
								.toLocaleLowerCase()
								.includes(filter.toLocaleLowerCase())
						case 'object':
							return message.value.some((line: string | null) => {
								return line
									?.toString()
									.toLocaleLowerCase()
									.includes(filter.toLocaleLowerCase())
							})
						default:
							return false
					}
				})
			}

			return currentMessages.filter((message) => message?.value?.length)
		}, [logLevel, filter, parsedMessages])

		const virtuoso = useRef<VirtuosoHandle>(null)
		// eslint-disable-next-line react-hooks/exhaustive-deps
		const scrollFunction = useCallback(
			_.debounce((index: number) => {
				if (virtuoso.current) {
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
			if (autoScroll) {
				scrollFunction(currentMessage)
			}
		}, [autoScroll, scrollFunction, currentMessage])

		return (
			<Box className={styles.consoleBox}>
				{loading ? (
					<div className={devStyles.skeletonWrapper}>
						<Skeleton
							count={2}
							style={{ height: 25, marginBottom: 11 }}
						/>
					</div>
				) : messagesToRender?.length ? (
					<Virtuoso
						ref={virtuoso}
						overscan={1024}
						increaseViewportBy={1024}
						data={messagesToRender}
						itemContent={(_index, message: ParsedMessage) => (
							<MessageRow
								key={message.id.toString()}
								message={message}
								current={message.id === currentMessage}
								setTime={(time: number) => {
									setTime(time)
									setCurrentMessage(_index)
								}}
								sessionMetadata={sessionMetadata}
							/>
						)}
					/>
				) : (
					<EmptyDevToolsCallout kind={Tab.Console} filter={filter} />
				)}
			</Box>
		)
	},
)

const MessageRow = React.memo(function ({
	message,
	setTime,
	current,
	sessionMetadata,
}: {
	message: ParsedMessage
	setTime: (time: number) => void
	current?: boolean
	sessionMetadata: playerMetaData
}) {
	return (
		<Box
			className={clsx(
				styles.consoleRow,
				styles.messageRowVariants({
					current,
				}),
			)}
			onClick={() => {
				setTime(message.time - sessionMetadata.startTime)
			}}
		>
			<div
				className={clsx(
					styles.consoleBar,
					styles.variants({
						type: message.type as any,
					}),
				)}
			>
				&nbsp;
			</div>
			<Box display="flex" alignItems="center">
				<Text
					family="monospace"
					weight="bold"
					cssClass={styles.consoleText}
				>
					{message.value}
				</Text>
			</Box>
		</Box>
	)
})
