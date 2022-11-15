import ButtonLink from '@components/Button/ButtonLink/ButtonLink'
import { StatelessCollapsible } from '@components/Collapsible/Collapsible'
import CollapsibleStyles from '@components/Collapsible/Collapsible.module.scss'
import InfoTooltip from '@components/InfoTooltip/InfoTooltip'
import Tooltip from '@components/Tooltip/Tooltip'
import { GetErrorObjectQuery } from '@graph/operations'
import { Callout } from '@highlight-run/ui'
import ErrorSourcePreview from '@pages/Error/components/ErrorSourcePreview/ErrorSourcePreview'
import JsonOrTextCard from '@pages/Error/components/JsonOrTextCard/JsonOrTextCard'
import { useParams } from '@util/react-router/useParams'
import React from 'react'
import Skeleton from 'react-loading-skeleton'

import ErrorPageStyles from '../../Error/ErrorPage.module.scss'
import styles from './ErrorStackTrace.module.scss'

interface Props {
	errorObject?: GetErrorObjectQuery['error_object']
}

const ErrorStackTrace = ({ errorObject }: Props) => {
	const { project_id } = useParams<{ project_id: string }>()

	const structuredStackTrace = errorObject?.structured_stack_trace

	/**
	 * The length of the longest line number in all the stack frames.
	 * We use this to figure out the minimal amount of spacing needed to show all the line numbers.
	 */
	const longestLineNumberCharacterLength =
		structuredStackTrace?.reduce((longestLineNumber, currentStackTrace) => {
			if (
				currentStackTrace?.lineNumber &&
				currentStackTrace?.lineNumber?.toString().length >
					longestLineNumber
			) {
				return currentStackTrace?.lineNumber?.toString().length
			}

			return longestLineNumber
		}, 0) ?? 0

	const everyFrameHasError = structuredStackTrace?.every(
		(frame) =>
			!!frame?.error &&
			!frame.error.includes('file does not contain source map url'),
	)

	const showStackFrameNotUseful =
		errorObject?.type !== 'Backend' &&
		(!errorObject?.structured_stack_trace || everyFrameHasError)

	return (
		<div className={styles.stackTraceCard}>
			{showStackFrameNotUseful && (
				<Callout
					title="These stack frames don't look that useful 😢"
					kind="info"
				>
					<>
						Are there sourcemaps tied to your javascript code? If
						yes, you can upload them to Highlight in CI/CD to get
						enhanced stack traces.
						<div className={styles.sourcemapActions}>
							<ButtonLink
								anchor
								trackingId="stackFrameLearnMoreAboutPrivateSourcemaps"
								href="https://docs.highlight.run/sourcemaps"
							>
								Learn More
							</ButtonLink>
							<ButtonLink
								trackingId="stackFrameSourcemapSettings"
								to={`/${project_id}/settings/errors`}
								type="default"
							>
								Sourcemap Settings
							</ButtonLink>
						</div>
					</>
				</Callout>
			)}
			{/* TODO: Loading? */}
			{false ? (
				Array(5)
					.fill(0)
					.map((_, index) => (
						<Skeleton key={index} className={styles.skeleton} />
					))
			) : structuredStackTrace?.length ? (
				structuredStackTrace?.map((e, i) => (
					<StackSection
						key={i}
						fileName={e?.fileName ?? ''}
						functionName={e?.functionName ?? ''}
						lineNumber={e?.lineNumber ?? 0}
						columnNumber={e?.columnNumber ?? 0}
						longestLineNumberCharacterLength={
							longestLineNumberCharacterLength
						}
						lineContent={e?.lineContent ?? undefined}
						linesBefore={e?.linesBefore ?? undefined}
						linesAfter={e?.linesAfter ?? undefined}
						error={e?.error ?? undefined}
						index={i}
						compact={false}
					/>
				))
			) : (
				<div className={styles.stackTraceCard}>
					<JsonOrTextCard
						jsonOrText={errorObject?.stack_trace || ''}
					/>
				</div>
			)}
		</div>
	)
}

export default ErrorStackTrace

type StackSectionProps = {
	fileName?: string
	functionName?: string
	lineNumber?: number
	columnNumber?: number
	longestLineNumberCharacterLength?: number
	lineContent?: string
	linesBefore?: string
	linesAfter?: string
	error?: string
	index: number
	compact: boolean
}

const getErrorMessage = (error: string | undefined): string | undefined => {
	if (!error) {
		return undefined
	}

	const s = error.split('over ').pop() || ''
	const size = s.split('mb:')[0] || '?'
	if (error.includes('minified source file over')) {
		return `Could not load the original source - the source file for this stack frame is over ${size}MB. This can happen for files which have been combined but have not been minified.`
	}

	if (error.includes('source map file over')) {
		return `Could not load the original source - the source map file for this stack frame is over ${size}MB.`
	}

	if (error.includes('error parsing source map file')) {
		return 'Could not load the original source - the source map is not publicly available or the source map file is malformed.'
	}

	return undefined
}

const StackSection: React.FC<React.PropsWithChildren<StackSectionProps>> = ({
	fileName,
	functionName,
	lineNumber,
	columnNumber,
	longestLineNumberCharacterLength = 5,
	lineContent,
	linesBefore,
	linesAfter,
	error,
	index,
}) => {
	const trigger = (
		<div className={ErrorPageStyles.triggerWrapper}>
			<hr />
			{!!lineContent ? (
				<ErrorSourcePreview
					fileName={fileName}
					lineNumber={lineNumber}
					columnNumber={columnNumber}
					functionName={functionName}
					lineContent={lineContent}
					linesBefore={linesBefore}
					linesAfter={linesAfter}
				/>
			) : (
				<div className={styles.editor}>
					<span
						className={styles.lineNumber}
						style={
							{
								'--longest-character-length':
									longestLineNumberCharacterLength,
							} as React.CSSProperties
						}
					>
						{lineNumber}
					</span>
					<Tooltip mouseEnterDelay={0.1} title={functionName}>
						<span className={styles.functionName}>
							{functionName}
						</span>
					</Tooltip>
					<span className={styles.tooltip}>
						<InfoTooltip
							size="large"
							title={getErrorMessage(error)}
						/>
					</span>
				</div>
			)}
		</div>
	)

	const stackTraceTitle = (
		<>
			{truncateFileName(fileName || '')}
			<span className={styles.fillerText}>
				{functionName ? ' in ' : ''}
			</span>
			{functionName}
			<span className={styles.fillerText}>
				{lineNumber ? ' at line ' : ''}
			</span>
			{lineNumber}
		</>
	)

	return (
		<div className={CollapsibleStyles.section}>
			<div className={styles.collapsibleWrapper}>
				{
					<StatelessCollapsible
						title={stackTraceTitle}
						key={index}
						defaultOpen={index === 0}
						contentClassName={styles.contentWrapper}
						stacked={true}
					>
						<div className={ErrorPageStyles.collapsible}>
							{trigger}
						</div>
					</StatelessCollapsible>
				}
			</div>
		</div>
	)
}

const truncateFileName = (fileName: string, number_of_levels_to_go_up = 5) => {
	const tokens = fileName.split('/')

	return `${'../'.repeat(
		Math.max(tokens.length - number_of_levels_to_go_up, 0),
	)}${tokens.splice(tokens.length - number_of_levels_to_go_up).join('/')}`
}
