import { StatelessCollapsible } from '@components/Collapsible/Collapsible'
import CollapsibleStyles from '@components/Collapsible/Collapsible.module.scss'
import InfoTooltip from '@components/InfoTooltip/InfoTooltip'
import Tooltip from '@components/Tooltip/Tooltip'
import {
	ErrorGroup,
	ErrorObject,
	Maybe,
	SourceMappingError,
	SourceMappingErrorCode,
} from '@graph/schemas'
import ErrorSourcePreview from '@pages/Error/components/ErrorSourcePreview/ErrorSourcePreview'
import JsonOrTextCard from '@pages/Error/components/JsonOrTextCard/JsonOrTextCard'
import { useParams } from '@util/react-router/useParams'
import React from 'react'
import Skeleton from 'react-loading-skeleton'

import Alert from '../../../../components/Alert/Alert'
import ButtonLink from '../../../../components/Button/ButtonLink/ButtonLink'
import ErrorPageStyles from '../../ErrorPage.module.scss'
import styles from './StackTraceSection.module.scss'

interface Props {
	errorGroup:
		| Maybe<
				Pick<
					ErrorGroup,
					| 'stack_trace'
					| 'mapped_stack_trace'
					| 'structured_stack_trace'
					| 'type'
				>
		  >
		| undefined
	loading: boolean
	compact?: boolean
	errorObject?: ErrorObject
}

const StackTraceSection = ({
	errorGroup,
	loading,
	compact = false,
	errorObject,
}: Props) => {
	const { project_id } = useParams<{ project_id: string }>()

	const structuredStackTrace =
		errorGroup?.structured_stack_trace ??
		errorObject?.structured_stack_trace

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
		errorGroup?.type !== 'Backend' &&
		(!errorGroup?.mapped_stack_trace || everyFrameHasError)

	return (
		<div className={styles.stackTraceCard}>
			{showStackFrameNotUseful && !loading && (
				<Alert
					trackingId="PrivacySourceMapEducation"
					className={styles.alert}
					message="These stack frames don't look that useful 😢"
					type="info"
					description={
						<>
							Are there sourcemaps tied to your javascript code?
							If yes, you can upload them to Highlight in CI/CD to
							get enhanced stack traces.
							{/* <div>
								{errorGroup?.structured_stack_trace.map(
									(value) =>
										JSON.stringify(value?.errorObject),
								)}
							</div> */}
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
					}
				/>
			)}
			{loading ? (
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
						sourceMappingErrorMetadata={
							e?.sourceMappingErrorMetadata ?? undefined
						}
						index={i}
						compact={compact}
					/>
				))
			) : (
				<div className={styles.stackTraceCard}>
					<JsonOrTextCard
						jsonOrText={errorGroup?.stack_trace || ''}
					/>
				</div>
			)}
		</div>
	)
}

export default StackTraceSection

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
	sourceMappingErrorMetadata?: SourceMappingError
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
	sourceMappingErrorMetadata,
	index,
	compact,
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
						{sourceMappingErrorMetadata && (
							<InfoTooltip
								size={'large'}
								title={getStackSectionError(
									sourceMappingErrorMetadata,
								)}
							/>
						)}
					</span>
				</div>
			)}
		</div>
	)

	const compactStackTraceTitle = (
		<>
			{truncateFileName(fileName || '', 2)}
			<span className={styles.fillerText}>
				{functionName ? ' | ' : ''}
			</span>
			{functionName}
			<span className={styles.fillerText}>{lineNumber ? ' | ' : ''}</span>
			{lineNumber}
		</>
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

	function getStackSectionError(e: SourceMappingError) {
		const originalFileError =
			'There was an issue accessing the original file for this error'
		const sourcemapFileError =
			'There was an issue accessing the sourcemap file for this error'
		const fileSizeLimitError =
			'We couldn’t fetch these files due to size limits'
		if (
			e.errorCode == SourceMappingErrorCode.MinifiedFileMissingInS3AndUrl
		) {
			return (
				<div className={styles.stackTraceErrorMessage}>
					<p>
						{originalFileError}. <br />
						We couldn’t find the minified file in Highlight storage
						at path <u>{e.actualMinifiedFetchedPath}</u> or at URL{' '}
						<u>{e.stackTraceFileURL}</u>
						{getFormatedStackSectionError(e)}
					</p>
				</div>
			)
		} else if (
			e.errorCode == SourceMappingErrorCode.FileNameMissingFromSourcePath
		) {
			return (
				<div className={styles.stackTraceErrorMessage}>
					<p>
						{originalFileError}. <br />
						We couldn’t find a filename associated with this stack
						frame
						{getFormatedStackSectionError(e)}
					</p>
				</div>
			)
		} else if (
			e.errorCode == SourceMappingErrorCode.ErrorParsingStackTraceFileUrl
		) {
			return (
				<div className={styles.stackTraceErrorMessage}>
					<p>
						{originalFileError}. <br />
						We couldn’t parse the stack trace file name{' '}
						<u>{e.stackTraceFileURL}</u>
						{getFormatedStackSectionError(e)}
					</p>
				</div>
			)
		} else if (
			e.errorCode == SourceMappingErrorCode.MissingSourceMapFileInS3
		) {
			return (
				<div className={styles.stackTraceErrorMessage}>
					<p>
						{sourcemapFileError}. <br />
						We couldn’t find sourcemap file using the 'file://'
						syntax in cloud storage at path <u>{e.sourceMapURL}</u>
						{getFormatedStackSectionError(e)}
					</p>
				</div>
			)
		} else if (
			e.errorCode == SourceMappingErrorCode.SourcemapFileMissingInS3AndUrl
		) {
			return (
				<div className={styles.stackTraceErrorMessage}>
					<p>
						{sourcemapFileError}. <br />
						We couldn’t find the sourcemap file in Highlight storage
						at path <u>{e.actualSourcemapFetchedPath}</u> or at URL{' '}
						<u>{e.sourceMapURL}</u>
						{getFormatedStackSectionError(e)}
					</p>
				</div>
			)
		} else if (e.errorCode == SourceMappingErrorCode.InvalidSourceMapUrl) {
			return (
				<div className={styles.stackTraceErrorMessage}>
					<p>
						{sourcemapFileError}. <br />
						We couldn’t parse the sourcemap filename X{' '}
						<u>{e.actualSourcemapFetchedPath}</u>
						{getFormatedStackSectionError(e)}
					</p>
				</div>
			)
		} else if (e.errorCode == SourceMappingErrorCode.MinifiedFileLarger) {
			return (
				<div className={styles.stackTraceErrorMessage}>
					<p>
						{fileSizeLimitError}. <br />
						Minified file <u>{e.actualMinifiedFetchedPath}</u>{' '}
						larger than our max supported size 128MB
						{getFormatedStackSectionError(e)}
					</p>
				</div>
			)
		} else if (e.errorCode == SourceMappingErrorCode.SourceMapFileLarger) {
			return (
				<div className={styles.stackTraceErrorMessage}>
					<p>
						{fileSizeLimitError}. <br />
						Sourcemap file <u>
							{e.actualSourcemapFetchedPath}
						</u>{' '}
						larger than our max supported size 128MB
						{getFormatedStackSectionError(e)}
					</p>
				</div>
			)
		} else if (
			e.errorCode == SourceMappingErrorCode.SourcemapLibraryCouldntParse
		) {
			return (
				<div className={styles.stackTraceErrorMessage}>
					<p>
						There was an error parsing the source map file{' '}
						<u>{e.sourceMapURL}</u>{' '}
						{getFormatedStackSectionError(e)}
					</p>
				</div>
			)
		} else if (
			e.errorCode ==
			SourceMappingErrorCode.SourcemapLibraryCouldntRetrieveSource
		) {
			return (
				<div className={styles.stackTraceErrorMessage}>
					<p>
						Sourcemap library didn’t find a valid mapping to the
						original source with line <u>{e.mappedLineNumber}</u>{' '}
						and col <u>{e.mappedColumnNumber}</u>
						{getFormatedStackSectionError(e)}
					</p>
				</div>
			)
		}
	}

	function getFormatedStackSectionError(e: SourceMappingError) {
		return (
			<p>
				{e.stackTraceFileURL && (
					<li>
						<u>Stack Trace File URL:</u> {e.stackTraceFileURL}
					</li>
				)}
				{e.actualMinifiedFetchedPath && (
					<li>
						<u>Minified Path:</u> {e.actualMinifiedFetchedPath}
					</li>
				)}
				{e.minifiedFetchStrategy && (
					<li>
						<u>Minified Fetch Strategy:</u>{' '}
						{e.minifiedFetchStrategy}
					</li>
				)}
				{e.minifiedFileSize && (
					<li>
						<u>Minified File Size:</u> {e.minifiedFileSize}
					</li>
				)}
				{e.minifiedLineNumber && (
					<li>
						<u>Minified Line Number:</u> {e.minifiedLineNumber}
					</li>
				)}
				{e.minifiedColumnNumber && (
					<li>
						<u>Minified Column Number:</u> {e.minifiedColumnNumber}
					</li>
				)}
				{e.sourceMapURL && (
					<li>
						<u>Sourcemap URL:</u> {e.sourceMapURL}
					</li>
				)}
				{e.sourcemapFetchStrategy && (
					<li>
						<u>Sourcemap Fetch Strategy:</u>{' '}
						{e.sourcemapFetchStrategy}
					</li>
				)}
				{e.sourcemapFileSize && (
					<li>
						<u>Sourcemap File Size:</u> {e.sourcemapFileSize}
					</li>
				)}
				{e.actualSourcemapFetchedPath && (
					<li>
						<u>Sourcemap Fetched Path:</u>{' '}
						{e.actualSourcemapFetchedPath}
					</li>
				)}
				{e.mappedLineNumber && (
					<li>
						<u>Mapped Line Number:</u> {e.mappedLineNumber}
					</li>
				)}
				{e.mappedColumnNumber && (
					<li>
						<u>Mapped Column Number:</u> {e.mappedColumnNumber}
					</li>
				)}
			</p>
		)
	}

	return (
		<div className={CollapsibleStyles.section}>
			<div className={styles.collapsibleWrapper}>
				{
					<StatelessCollapsible
						title={
							compact ? compactStackTraceTitle : stackTraceTitle
						}
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
