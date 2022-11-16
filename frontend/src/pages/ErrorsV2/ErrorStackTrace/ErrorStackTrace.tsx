import InfoTooltip from '@components/InfoTooltip/InfoTooltip'
import Tooltip from '@components/Tooltip/Tooltip'
import { GetErrorObjectQuery } from '@graph/operations'
import {
	Box,
	Button,
	Callout,
	IconCaretDown,
	Stack,
	Text,
} from '@highlight-run/ui'
import ErrorSourcePreview from '@pages/ErrorsV2/ErrorSourcePreview/ErrorSourcePreview'
import JsonOrTextCard from '@pages/ErrorsV2/JsonOrTextCard/JsonOrTextCard'
import React from 'react'
import ReactCollapsible from 'react-collapsible'

import * as styles from './ErrorStackTrace.css'

interface Props {
	errorObject?: GetErrorObjectQuery['error_object']
}

const ErrorStackTrace = ({ errorObject }: Props) => {
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
					kind="info"
				>
					<Text>
						Are there sourcemaps tied to your javascript code? If
						yes, you can upload them to Highlight in CI/CD to get
						enhanced stack traces.
					</Text>

					<Box>
						<Button kind="primary">Learn More</Button>
						<Button kind="secondary">Sourcemap Settings</Button>
					</Box>
				</Callout>
			)}

			{structuredStackTrace?.length ? (
				<Box>
					{structuredStackTrace?.map((e, i) => (
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
							isFirst={i === 0}
							isLast={i >= structuredStackTrace.length - 1}
							compact={false}
						/>
					))}
				</Box>
			) : (
				<JsonOrTextCard jsonOrText={errorObject?.stack_trace || ''} />
			)}
		</Stack>
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
	compact: boolean
	isFirst: boolean
	isLast: boolean
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
			background="neutral100"
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

			<span className={styles.iconCaret({ open: expanded })}>
				<IconCaretDown />
			</span>
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

const truncateFileName = (fileName: string, number_of_levels_to_go_up = 3) => {
	const tokens = fileName.split('/')

	return `${'../'.repeat(
		Math.max(tokens.length - number_of_levels_to_go_up, 0),
	)}${tokens.splice(tokens.length - number_of_levels_to_go_up).join('/')}`
}
