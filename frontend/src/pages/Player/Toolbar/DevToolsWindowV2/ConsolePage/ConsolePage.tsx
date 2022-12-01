import { useGetMessagesQuery } from '@graph/hooks'
import { ConsoleMessage } from '@highlight-run/client'
import { Box, Stack } from '@highlight-run/ui'
import { indexedDBFetch } from '@util/db'
import { useParams } from '@util/react-router/useParams'
import clsx from 'clsx'
import { H } from 'highlight.run'
import _ from 'lodash'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { VirtuosoHandle } from 'react-virtuoso'

import { ReplayerState, useReplayerContext } from '../../../ReplayerContext'
import { LogLevel } from '../DevToolsWindowV2'
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
	}: {
		autoScroll: boolean
		filter: string
		logLevel: LogLevel
	}) => {
		const [currentMessage, setCurrentMessage] = useState(-1)
		const { time, state, session } = useReplayerContext()
		const [parsedMessages, setParsedMessages] = useState<
			undefined | Array<ParsedMessage>
		>([])
		const { session_secure_id } = useParams<{ session_secure_id: string }>()
		const skipQuery = session === undefined || !!session?.messages_url
		const { data } = useGetMessagesQuery({
			variables: {
				session_secure_id,
			},
			fetchPolicy: 'no-cache',
			skip: skipQuery, // Skip if there is a URL to fetch messages
		})

		// If sessionSecureId is set and equals the current session's (ensures effect is run once)
		// and resources url is defined, fetch using resources url
		useEffect(() => {
			if (
				session_secure_id === session?.secure_id &&
				!!session?.messages_url
			) {
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
			if (autoScroll) {
				scrollFunction(currentMessage, state)
			}
		}, [autoScroll, scrollFunction, currentMessage, state])

		return (
			<Box className={styles.consoleBox}>
				<Stack gap={'12'}>
					{messagesToRender.map((m) => (
						<MessageRow key={m.id} message={m} />
					))}
				</Stack>
			</Box>
		)
	},
)

const MessageRow = function ({ message }: { message: ParsedMessage }) {
	return (
		<Box className={clsx(styles.consoleRow)}>
			<div
				className={clsx(
					styles.consoleBar,
					styles.variants({
						type: message.type,
					}),
				)}
			>
				&nbsp;
			</div>
			<div>{message.value}</div>
		</Box>
	)
}
