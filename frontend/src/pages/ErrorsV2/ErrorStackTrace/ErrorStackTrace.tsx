import { Button } from '@components/Button'
import InfoTooltip from '@components/InfoTooltip/InfoTooltip'
import { LinkButton } from '@components/LinkButton'
import { Maybe, SourceMappingError } from '@graph/schemas'
import {
	Badge,
	Box,
	ButtonIcon,
	Callout,
	IconSolidCheveronDown,
	IconSolidCheveronUp,
	IconSolidClipboardCopy,
	IconSolidExclamation,
	IconSolidExternalLink,
	IconSolidGithub,
	Popover,
	Stack,
	Text,
	Tooltip,
} from '@highlight-run/ui/components'
import { useProjectId } from '@hooks/useProjectId'
import ErrorSourcePreview from '@pages/ErrorsV2/ErrorSourcePreview/ErrorSourcePreview'
import { SourcemapErrorDetails } from '@pages/ErrorsV2/SourcemapErrorDetails/SourcemapErrorDetails'
import { UnstructuredStackTrace } from '@pages/ErrorsV2/UnstructuredStackTrace/UnstructuredStackTrace'
import analytics from '@util/analytics'
import { copyToClipboard } from '@util/string'
import clsx from 'clsx'
import React from 'react'
import ReactCollapsible from 'react-collapsible'

import { ErrorObjectFragment } from '@/graph/generated/operations'

import * as styles from './ErrorStackTrace.css'

const MAX_GIT_SHA_LENGTH = 7

interface Props {
	errorObject?: ErrorObjectFragment
}

const ErrorStackTrace = ({ errorObject }: Props) => {
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
						<Button
							kind="secondary"
							emphasis="high"
							onClick={() => {
								window.open(
									'https://docs.highlight.run/sourcemaps',
									'_blank',
								)
							}}
							trackingId="stacktraceErrorLearnMore"
						>
							Learn More
						</Button>
						<LinkButton
							kind="secondary"
							emphasis="low"
							to={`/${projectId}/settings/errors`}
							trackingId="sourcemap-settings-link-click-stacktrace-not-useful"
						>
							Sourcemap Settings
						</LinkButton>
					</Stack>
				</Callout>
			)}

			<Box width="full">
				{structuredStackTrace?.length ? (
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
							enhancementSource={e?.enhancementSource}
							enhancementVersion={e?.enhancementVersion}
							externalLink={e?.externalLink}
							lineContent={e?.lineContent}
							linesBefore={e?.linesBefore}
							linesAfter={e?.linesAfter}
							error={e?.error}
							isFirst={i === 0}
							isLast={i >= structuredStackTrace.length - 1}
							sourceMappingErrorMetadata={
								e?.sourceMappingErrorMetadata
							}
							errorObjectId={errorObject?.id ?? ''}
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
	enhancementSource?: Maybe<string>
	externalLink?: Maybe<string>
	enhancementVersion?: Maybe<string>
	lineContent?: Maybe<string>
	linesBefore?: Maybe<string>
	linesAfter?: Maybe<string>
	sourceMappingErrorMetadata?: Maybe<SourceMappingError>
	error?: Maybe<string>
	errorObjectId: string
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
	enhancementSource,
	enhancementVersion,
	externalLink,
	lineContent,
	linesBefore,
	linesAfter,
	sourceMappingErrorMetadata,
	error,
	errorObjectId,
	isFirst,
	isLast,
}) => {
	const [expanded, setExpanded] = React.useState(isFirst)

	const handleExpandedChange = (value: boolean) => {
		setExpanded(value)

		const trackingProperties = {
			expanded: value,
			errorObjectId,
			enhancementSource: enhancementSource ?? 'none',
		}
		analytics.track('error-stack-trace-clicked', trackingProperties)
	}

	const trigger = (
		<Box py="4" backgroundColor="n2">
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
				<Text family="monospace" as="div" display="flex">
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
					<Tooltip trigger={<span>{functionName}</span>}>
						{functionName}
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

	const versionString =
		(enhancementVersion?.length || 0) > MAX_GIT_SHA_LENGTH
			? enhancementVersion?.slice(0, MAX_GIT_SHA_LENGTH)
			: enhancementVersion!

	const stackTraceTitle = (
		<Box
			background="n1"
			cursor="pointer"
			py="8"
			px="12"
			bt={isFirst ? 'secondary' : undefined}
			br="secondary"
			bb="secondary"
			bl="secondary"
			btr={isFirst ? '6' : undefined}
			bbr={isLast && !expanded ? '6' : undefined}
			display="flex"
			justifyContent="space-between"
			alignItems="center"
			style={{ height: '36px' }}
		>
			<Box display="flex" gap="4" alignItems="center">
				{fileName && (
					<Tooltip
						trigger={
							<Text
								cssClass={clsx(styles.name, styles.file)}
								as="span"
							>
								{truncateFileName(fileName)}
							</Text>
						}
					>
						<Box display="flex">
							<ButtonIcon
								kind="secondary"
								size="xSmall"
								shape="square"
								emphasis="low"
								icon={<IconSolidClipboardCopy size={12} />}
								onClick={(e) => {
									e.stopPropagation()
									copyToClipboard(fileName)
								}}
							/>
							<Text cssClass={styles.fileName} wrap="breakWord">
								{fileName}
							</Text>
						</Box>
					</Tooltip>
				)}

				{externalLink && (
					<LinkButton
						kind="secondary"
						emphasis="low"
						to={externalLink}
						target="_blank"
						trackingId="stacktrace-external-link-click"
						size="xSmall"
					>
						<IconSolidExternalLink size={16} />
					</LinkButton>
				)}
				{!!functionName && (
					<>
						<Text cssClass={styles.name} color="n11" as="span">
							{' in '}
						</Text>
						<Text cssClass={styles.name} as="span">
							{functionName}
						</Text>
					</>
				)}
				{!!lineNumber && (
					<>
						<Text cssClass={styles.name} color="n11" as="span">
							{' at line '}
						</Text>
						<Text cssClass={styles.name} as="span">
							{lineNumber}
						</Text>
					</>
				)}
			</Box>

			<Box display="flex" gap="4" alignItems="center">
				{enhancementSource == 'github' && (
					<Tooltip
						trigger={
							<Badge
								iconStart={<IconSolidGithub size={16} />}
								label={versionString}
							/>
						}
					>
						This stacktrace was enhanced using GitHub
						{enhancementVersion &&
							` with commit version, ${versionString}`}
						.
					</Tooltip>
				)}
				<SourcemapError
					errorObjectId={errorObjectId}
					metadata={sourceMappingErrorMetadata}
				/>

				<ButtonIcon
					icon={
						expanded ? (
							<IconSolidCheveronUp size={12} />
						) : (
							<IconSolidCheveronDown size={12} />
						)
					}
					kind="secondary"
					size="minimal"
					emphasis="low"
				/>
			</Box>
		</Box>
	)

	return (
		<Box>
			<StackTraceSectionCollapsible
				title={stackTraceTitle}
				expanded={expanded}
				setExpanded={handleExpandedChange}
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

const SourcemapError: React.FC<{
	errorObjectId: string
	metadata?: Maybe<SourceMappingError>
}> = ({ errorObjectId, metadata }) => {
	const popoverStore = Popover.useStore({ placement: 'bottom-start' })

	// Ensures the popover is closed when the error instance changes.
	React.useEffect(() => {
		popoverStore.setOpen(false)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [errorObjectId])

	if (!metadata) {
		return null
	}

	return (
		// onClick is to prevent clicks from bubbling up and toggling the collapse.
		<Box
			cursor="default"
			onClick={(e) => e.stopPropagation()}
			display="flex"
		>
			<Popover store={popoverStore}>
				<Popover.TagTrigger
					kind="secondary"
					shape="basic"
					iconLeft={<IconSolidExclamation size={12} />}
					size="medium"
				>
					Stacktrace Issue
				</Popover.TagTrigger>
				<Popover.Content>
					<SourcemapErrorDetails error={metadata} />
				</Popover.Content>
			</Popover>
		</Box>
	)
}

const truncateFileName = (fileName: string, numberOfLevelsToGoUp = 5) => {
	const tokens = fileName.split('/')

	// add one for the starting "/"
	const useRelativePath = tokens.length > 1 + numberOfLevelsToGoUp
	if (!useRelativePath) {
		return fileName
	}

	return `.../${tokens
		.splice(tokens.length - numberOfLevelsToGoUp)
		.join('/')}`
}
