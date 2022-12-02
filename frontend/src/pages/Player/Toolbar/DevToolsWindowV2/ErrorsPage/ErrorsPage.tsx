import { ErrorObject } from '@graph/schemas'
import { Box, Stack, Tag } from '@highlight-run/ui'
import { findLastActiveEventIndex } from '@pages/Player/Toolbar/DevToolsWindow/ErrorsPage/utils/utils'
import { getErrorBody } from '@util/errors/errorUtils'
import { parseOptionalJSON } from '@util/string'
import React, { useLayoutEffect, useMemo, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import { VirtuosoHandle } from 'react-virtuoso'

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
		const history = useHistory<ErrorsPageHistoryState>()
		const { errors, state, sessionMetadata } = useReplayerContext()

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
			if (virtuoso.current && autoScroll) {
				if (
					history.location.state?.errorCardIndex !== undefined &&
					state === ReplayerState.Playing
				) {
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
			state,
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
				<Stack gap={'0'}>
					{errorsToRender.map((e) => (
						<ErrorRow key={e.error_group_secure_id} error={e} />
					))}
				</Stack>
			</Box>
		)
	},
)

const ErrorRow: React.FC<
	React.PropsWithChildren & {
		error: ErrorObject
	}
> = ({ error }) => {
	const body = useMemo(
		() => parseOptionalJSON(getErrorBody(error.event)),
		[error.event],
	)
	const context = useMemo(() => {
		const data = parseOptionalJSON(error.payload || '')
		return data === 'null' ? '' : data
	}, [error.payload])
	return (
		<Box className={styles.errorRow}>
			<span>{body}</span>
			<span>{context}</span>
			<Tag kind={'grey'}>{error.type}</Tag>
		</Box>
	)
}

export default ErrorsPage
