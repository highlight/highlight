import InfoTooltip from '@components/InfoTooltip/InfoTooltip'
import Tooltip from '@components/Tooltip/Tooltip'
import {
	ErrorInstance,
	Maybe,
	SourceMappingError,
	SourceMappingErrorCode,
} from '@graph/schemas'
import {
	Box,
	Callout,
	IconCaretDown,
	IconExclamationTriangle,
	LinkButton,
	Stack,
	Tag,
	Text,
} from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import ErrorSourcePreview from '@pages/ErrorsV2/ErrorSourcePreview/ErrorSourcePreview'
import { UnstructuredStackTrace } from '@pages/ErrorsV2/UnstructuredStackTrace/UnstructuredStackTrace'
import React from 'react'
import ReactCollapsible from 'react-collapsible'
import { useHistory } from 'react-router-dom'

import * as styles from './ErrorStackTrace.css'

interface Props {
	errorObject?: ErrorInstance['error_object']
}

const ErrorStackTrace = ({ errorObject }: Props) => {
	const history = useHistory()
	const { projectId } = useProjectId()
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
		<Stack gap="12">
			{showStackFrameNotUseful && (
				<Callout
					title="These stack frames don't look that useful 😢"
					kind="warning"
				>
					<Text>
						Are there sourcemaps tied to your javascript code? If
						yes, you can upload them to Highlight in CI/CD to get
						enhanced stack traces.
					</Text>

					<Stack direction="row" gap="8">
						<LinkButton
							kind="secondary"
							href="https://docs.highlight.run/sourcemaps"
						>
							Learn More
						</LinkButton>
						<LinkButton
							kind="secondary"
							emphasis="low"
							href="/${projectId}/settings/errors"
						>
							Sourcemap Settings
						</LinkButton>
					</Stack>
				</Callout>
			)}

			<Box width="full">
				{structuredStackTrace?.length ? (
					structuredStackTrace?.map((e, i) => (
						// TODO: Pass down sourceMappingErrorMetadata and render the error
						// details.
						// https://localhost:3000/1/errors/jjhjUDt4ytt67Gnq0Ra3AT2ZM17c?page=1
						<StackSection
							key={i}
							fileName={e?.fileName ?? ''}
							functionName={e?.functionName ?? ''}
							lineNumber={e?.lineNumber ?? 0}
							columnNumber={e?.columnNumber ?? 0}
							longestLineNumberCharacterLength={
								longestLineNumberCharacterLength
							}
							lineContent={e?.lineContent}
							linesBefore={e?.linesBefore}
							linesAfter={e?.linesAfter}
							error={e?.error}
							isFirst={i === 0}
							isLast={i >= structuredStackTrace.length - 1}
							sourceMappingErrorMetadata={
								e?.sourceMappingErrorMetadata
							}
							compact={false}
						/>
					))
				) : (
					<UnstructuredStackTrace
						stackTrace={errorObject?.stack_trace || ''}
					/>
				)}
			</Box>
		</Stack>
	)
}

export default ErrorStackTrace

export type StackSectionProps = {
	fileName?: string
	functionName?: string
	lineNumber?: number
	columnNumber?: number
	longestLineNumberCharacterLength?: number
	lineContent?: Maybe<string>
	linesBefore?: Maybe<string>
	linesAfter?: Maybe<string>
	sourceMappingErrorMetadata?: Maybe<SourceMappingError>
	error?: Maybe<string>
	compact: boolean
	isFirst: boolean
	isLast: boolean
}

const getErrorMessage = (
	error?: Maybe<string> | undefined,
): string | undefined => {
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
	sourceMappingErrorMetadata,
	error,
	isFirst,
	isLast,
}) => {
	const [expanded, setExpanded] = React.useState(isFirst)

	const trigger = (
		<Box p="12">
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
				<Text family="monospace" as="div">
					<Box
						as="span"
						cssClass={styles.lineNumber}
						mr="24"
						style={
							{
								'--longest-character-length':
									longestLineNumberCharacterLength,
							} as React.CSSProperties
						}
					>
						{lineNumber}
					</Box>
					<Tooltip mouseEnterDelay={0.1} title={functionName}>
						<span>{functionName}</span>
					</Tooltip>
					<span>
						<InfoTooltip
							size="large"
							title={getErrorMessage(error)}
						/>
					</span>
				</Text>
			)}
		</Box>
	)

	const stackTraceTitle = (
		<Box
			background="neutral50"
			p="12"
			bt={isFirst ? 'neutral' : undefined}
			br="neutral"
			bb="neutral"
			bl="neutral"
			btr={isFirst ? '6' : undefined}
			display="flex"
			justifyContent="space-between"
			alignItems="center"
		>
			<Box display="flex" gap="4">
				<Text>{truncateFileName(fileName || '')}</Text>
				<Text color="neutral500" as="span">
					{functionName ? ' in ' : ''}
				</Text>
				<Text>{functionName}</Text>
				<Text color="neutral500" as="span">
					{lineNumber ? ' at line ' : ''}
				</Text>
				<Text>{lineNumber}</Text>
			</Box>

			<Box display="flex" gap="4" alignItems="center">
				<SourcemapError metadata={sourceMappingErrorMetadata} />
				<span className={styles.iconCaret({ open: expanded })}>
					<IconCaretDown />
				</span>
			</Box>
		</Box>
	)

	return (
		<Box>
			<StackTraceSectionCollapsible
				title={stackTraceTitle}
				expanded={expanded}
				setExpanded={setExpanded}
				isLast={isLast}
			>
				{trigger}
			</StackTraceSectionCollapsible>
		</Box>
	)
}

const StackTraceSectionCollapsible: React.FC<
	React.PropsWithChildren<{
		expanded: boolean
		setExpanded: (expanded: boolean) => void
		isLast: boolean
		title: string | React.ReactElement
	}>
> = ({ children, expanded, setExpanded, isLast, title }) => {
	return (
		<ReactCollapsible
			trigger={title}
			open={expanded}
			handleTriggerClick={() => setExpanded(!expanded)}
			transitionTime={150}
			contentInnerClassName={styles.collapsibleContent({
				rounded: isLast,
			})}
		>
			{children}
		</ReactCollapsible>
	)
}

const SourcemapError: React.FC<{ metadata?: Maybe<SourceMappingError> }> = ({
	metadata,
}) => {
	const [open, setOpen] = React.useState(false)

	if (!metadata) {
		return null
	}

	return (
		<Box position="relative">
			<Tag
				kind="grey"
				shape="basic"
				iconLeft={<IconExclamationTriangle />}
				onClick={(e) => {
					e.stopPropagation()
					setOpen(!open)
				}}
			>
				Stacktrace Issue
			</Tag>

			{open && (
				<Box
					backgroundColor="white"
					borderRadius="6"
					border="neutral"
					padding="12"
					position="absolute"
					style={{ top: 'calc(100% + 5px)', right: 0, zIndex: 1 }}
				>
					<StackSectionError error={metadata} />
				</Box>
			)}
		</Box>
	)
}

const truncateFileName = (fileName: string, numberOfLevelsToGoUp = 3) => {
	const tokens = fileName.split('/')

	return `${'../'.repeat(
		Math.max(tokens.length - numberOfLevelsToGoUp, 0),
	)}${tokens.splice(tokens.length - numberOfLevelsToGoUp).join('/')}`
}

const StackSectionError: React.FC<{ error: SourceMappingError }> = ({
	error,
}) => {
	const originalFileError =
		'There was an issue accessing the original file for this error'
	const sourcemapFileError =
		'There was an issue accessing the sourcemap file for this error'
	const fileSizeLimitError =
		"We couldn't fetch these files due to size limits"
	if (
		error.errorCode == SourceMappingErrorCode.MinifiedFileMissingInS3AndUrl
	) {
		return (
			<div>
				{originalFileError}. <br />
				We couldn't find the minified file in Highlight storage at path{' '}
				<u>{error.actualMinifiedFetchedPath}</u> or at URL{' '}
				<u>{error.stackTraceFileURL}</u>
				{getFormatedStackSectionError(error)}
			</div>
		)
	} else if (
		error.errorCode == SourceMappingErrorCode.FileNameMissingFromSourcePath
	) {
		return (
			<div>
				{originalFileError}. <br />
				We couldn't find a filename associated with this stack frame
				{getFormatedStackSectionError(error)}
			</div>
		)
	} else if (
		error.errorCode == SourceMappingErrorCode.ErrorParsingStackTraceFileUrl
	) {
		return (
			<div>
				{originalFileError}. <br />
				We couldn't parse the stack trace file name{' '}
				<u>{error.stackTraceFileURL}</u>
				{getFormatedStackSectionError(error)}
			</div>
		)
	} else if (
		error.errorCode == SourceMappingErrorCode.MissingSourceMapFileInS3
	) {
		return (
			<div>
				{sourcemapFileError}. <br />
				We couldn't find sourcemap file using the 'file://' syntax in
				cloud storage at path <u>{error.sourceMapURL}</u>
				{getFormatedStackSectionError(error)}
			</div>
		)
	} else if (
		error.errorCode == SourceMappingErrorCode.SourcemapFileMissingInS3AndUrl
	) {
		return (
			<div>
				{sourcemapFileError}. <br />
				We couldn't find the sourcemap file in Highlight storage at path{' '}
				<u>{error.actualSourcemapFetchedPath}</u> or at URL{' '}
				<u>{error.sourceMapURL}</u>
				{getFormatedStackSectionError(error)}
			</div>
		)
	} else if (error.errorCode == SourceMappingErrorCode.InvalidSourceMapUrl) {
		return (
			<div>
				{sourcemapFileError}. <br />
				We couldn't parse the sourcemap filename X{' '}
				<u>{error.actualSourcemapFetchedPath}</u>
				{getFormatedStackSectionError(error)}
			</div>
		)
	} else if (error.errorCode == SourceMappingErrorCode.MinifiedFileLarger) {
		return (
			<div>
				{fileSizeLimitError}. <br />
				Minified file <u>{error.actualMinifiedFetchedPath}</u> larger
				than our max supported size 128MB
				{getFormatedStackSectionError(error)}
			</div>
		)
	} else if (error.errorCode == SourceMappingErrorCode.SourceMapFileLarger) {
		return (
			<div>
				{fileSizeLimitError}. <br />
				Sourcemap file <u>{error.actualSourcemapFetchedPath}</u> larger
				than our max supported size 128MB
				{getFormatedStackSectionError(error)}
			</div>
		)
	} else if (
		error.errorCode == SourceMappingErrorCode.SourcemapLibraryCouldntParse
	) {
		return (
			<div>
				There was an error parsing the source map file{' '}
				<u>{error.sourceMapURL}</u>{' '}
				{getFormatedStackSectionError(error)}
			</div>
		)
	}
	// } else if (
	// 	error.errorCode ==
	// 	SourceMappingErrorCode.SourcemapLibraryCouldntRetrieveSource
	// )
	else {
		return (
			<div>
				Sourcemap library didn't find a valid mapping to the original
				source with line <u>{error.mappedLineNumber}</u> and col{' '}
				<u>{error.mappedColumnNumber}</u>
				{getFormatedStackSectionError(error)}
			</div>
		)
	}
}

function getFormatedStackSectionError(error: SourceMappingError) {
	return (
		<div>
			{error.stackTraceFileURL && (
				<div>
					<u>Stack Trace File URL:</u> {error.stackTraceFileURL}
				</div>
			)}
			{error.actualMinifiedFetchedPath && (
				<div>
					<u>Minified Path:</u> {error.actualMinifiedFetchedPath}
				</div>
			)}
			{error.minifiedFetchStrategy && (
				<div>
					<u>Minified Fetch Strategy:</u>{' '}
					{error.minifiedFetchStrategy}
				</div>
			)}
			{error.minifiedFileSize && (
				<div>
					<u>Minified File Size:</u> {error.minifiedFileSize}
				</div>
			)}
			{error.minifiedLineNumber && (
				<div>
					<u>Minified Line Number:</u> {error.minifiedLineNumber}
				</div>
			)}
			{error.minifiedColumnNumber && (
				<div>
					<u>Minified Column Number:</u> {error.minifiedColumnNumber}
				</div>
			)}
			{error.sourceMapURL && (
				<div>
					<u>Sourcemap URL:</u> {error.sourceMapURL}
				</div>
			)}
			{error.sourcemapFetchStrategy && (
				<div>
					<u>Sourcemap Fetch Strategy:</u>{' '}
					{error.sourcemapFetchStrategy}
				</div>
			)}
			{error.sourcemapFileSize && (
				<div>
					<u>Sourcemap File Size:</u> {error.sourcemapFileSize}
				</div>
			)}
			{error.actualSourcemapFetchedPath && (
				<div>
					<u>Sourcemap Fetched Path:</u>{' '}
					{error.actualSourcemapFetchedPath}
				</div>
			)}
			{error.mappedLineNumber && (
				<div>
					<u>Mapped Line Number:</u> {error.mappedLineNumber}
				</div>
			)}
			{error.mappedColumnNumber && (
				<div>
					<u>Mapped Column Number:</u> {error.mappedColumnNumber}
				</div>
			)}
		</div>
	)
}
