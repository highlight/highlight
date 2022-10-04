import JsonViewer from '@components/JsonViewer/JsonViewer'
import Tag from '@components/Tag/Tag'
import { DetailedPanel } from '@pages/Player/context/PlayerUIContext'
import { getErrorBody } from '@util/errors/errorUtils'
import { parseOptionalJSON } from '@util/string'
import { message } from 'antd'
import classNames from 'classnames'
import React, { useMemo } from 'react'

import GoToButton from '../../../../../../../components/Button/GoToButton'
import TextHighlighter from '../../../../../../../components/TextHighlighter/TextHighlighter'
import { ErrorObject } from '../../../../../../../graph/generated/schemas'
import { MillisToMinutesAndSeconds } from '../../../../../../../util/time'
import { ReplayerContextInterface } from '../../../../../ReplayerContext'
import styles from './ErrorCard.module.scss'

export enum ErrorCardState {
	Unknown,
	Active,
	Inactive,
}
interface Props {
	error: ErrorObject
	state: ErrorCardState
	setSelectedError: () => void
	searchQuery: string
	detailedPanel?: DetailedPanel
	replayerContext: Pick<
		ReplayerContextInterface,
		'sessionMetadata' | 'setTime'
	>
}

const ErrorCard = React.memo(
	({
		error,
		setSelectedError,
		searchQuery,
		state,
		detailedPanel,
		replayerContext: { sessionMetadata, setTime },
	}: Props) => {
		const body = useMemo(
			() => parseOptionalJSON(getErrorBody(error.event)),
			[error.event],
		)
		const context = useMemo(() => {
			const data = parseOptionalJSON(error.payload || '')
			return data === 'null' ? '' : data
		}, [error.payload])
		return (
			<button
				key={error.id}
				className={classNames(styles.errorCard, {
					[styles.active]: detailedPanel?.id === error.id,
				})}
				onClick={setSelectedError}
			>
				<div
					className={styles.currentIndicatorWrapper}
					style={{
						visibility:
							state === ErrorCardState.Active
								? 'visible'
								: 'hidden',
					}}
				>
					<div className={styles.currentIndicator} />
				</div>
				<div className={styles.content}>
					<div className={styles.header}>
						<Tag
							infoTooltipText="This is where the error was thrown."
							backgroundColor="var(--color-orange-300)"
						>
							{error.type}
						</Tag>
						<p>
							<TextHighlighter
								searchWords={[searchQuery]}
								textToHighlight={error.source || ''}
							/>
							{error.structured_stack_trace[0] &&
								` at line ${error.structured_stack_trace[0].lineNumber}:${error.structured_stack_trace[0].columnNumber}`}
						</p>
						{error.timestamp && (
							<GoToButton
								className={styles.goToButton}
								onClick={(e) => {
									e.stopPropagation()

									const dateTimeErrorCreated = new Date(
										error.timestamp || 0,
									)
									const startTime = sessionMetadata.startTime
									if (startTime) {
										const dateTimeSessionStart = new Date(
											startTime,
										)
										const deltaMilliseconds =
											dateTimeErrorCreated.getTime() -
											dateTimeSessionStart.getTime()
										setTime(deltaMilliseconds)

										message.success(
											`Changed player time to when error was thrown at ${MillisToMinutesAndSeconds(
												deltaMilliseconds,
											)}.`,
										)
									}
								}}
								label="Goto"
							/>
						)}
					</div>
					<div className={styles.details}>
						<div
							onClick={(e) => {
								e.stopPropagation()
							}}
							style={{ flexBasis: context ? '245px' : 'auto' }}
						>
							<p>Body</p>
							{typeof body === 'object' ? (
								<JsonViewer src={body} collapsed={1} />
							) : (
								<TextHighlighter
									searchWords={[searchQuery]}
									textToHighlight={body}
								/>
							)}
						</div>
						{context && (
							<div
								onClick={(e) => {
									e.stopPropagation()
								}}
							>
								<p>Context</p>
								{typeof context === 'object' ? (
									<JsonViewer src={context} collapsed={1} />
								) : (
									<TextHighlighter
										searchWords={[searchQuery]}
										textToHighlight={context}
									/>
								)}
							</div>
						)}
					</div>
				</div>
			</button>
		)
	},
)

export default ErrorCard
