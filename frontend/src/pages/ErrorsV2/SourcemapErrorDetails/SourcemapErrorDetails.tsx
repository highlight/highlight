import { LinkButton } from '@components/LinkButton'
import {
	Maybe,
	SourceMappingError,
	SourceMappingErrorCode,
} from '@graph/schemas'
import {
	Box,
	ButtonIcon,
	IconSolidCheveronDown,
	Stack,
	Tag,
	Text,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import { useProjectId } from '@hooks/useProjectId'
import SvgCopyIcon from '@icons/CopyIcon'
import { copyToClipboard } from '@util/string'
import React from 'react'

import * as styles from './styles.css'

type Props = React.PropsWithChildren & { error: SourceMappingError }

type MetadataKey = keyof SourceMappingError

const originalFileError =
	'There was an issue accessing the original file for this error'
const originalFileTitle = 'Original File Access Error'

const sourcemapFileError =
	'There was an issue accessing the sourcemap file for this error'
const sourcemapFileTitle = 'Sourcemap File Error'

const fileSizeLimitError = "We couldn't fetch these files due to size limits"
const fileSizeLimitTitle = 'File Size Limit Error'

const fileParseTitle = "Couldn't Parse File"

const missingMinifiedFileMetadata: MetadataKey[] = [
	'stackTraceFileURL',
	'minifiedFetchStrategy',
	'actualMinifiedFetchedPath',
	'minifiedLineNumber',
	'minifiedColumnNumber',
]

const missingSourcemapMetadata: MetadataKey[] = [
	'sourceMapURL',
	'sourcemapFetchStrategy',
	'actualSourcemapFetchedPath',
]

const fileSizeLimitMetadata: MetadataKey[] = [
	'sourcemapFileSize',
	'minifiedFileSize',
]

const sourcemapParseErrorMetadata: MetadataKey[] = [
	'mappedLineNumber',
	'mappedColumnNumber',
]

export const SourcemapErrorDetails: React.FC<Props> = ({ error }) => {
	if (!error) {
		return null
	}

	if (
		error.errorCode == SourceMappingErrorCode.MinifiedFileMissingInS3AndUrl
	) {
		return (
			<StackSectionError
				error={error}
				keys={missingMinifiedFileMetadata}
				title={originalFileTitle}
			>
				{originalFileError}. We couldn't find the minified file in
				Highlight storage at path{' '}
				<Code>{error.actualMinifiedFetchedPath}</Code> or at URL{' '}
				<Code>{error.stackTraceFileURL}</Code>
			</StackSectionError>
		)
	} else if (
		error.errorCode == SourceMappingErrorCode.FileNameMissingFromSourcePath
	) {
		return (
			<StackSectionError
				error={error}
				keys={missingMinifiedFileMetadata}
				title={originalFileTitle}
			>
				{originalFileError}. We couldn't find a filename associated with
				this stack frame
			</StackSectionError>
		)
	} else if (
		error.errorCode == SourceMappingErrorCode.ErrorParsingStackTraceFileUrl
	) {
		return (
			<StackSectionError
				error={error}
				keys={missingMinifiedFileMetadata}
				title={originalFileTitle}
			>
				{originalFileError}. We couldn't parse the stack trace file name
				at URL <Code>{error.stackTraceFileURL}</Code>
			</StackSectionError>
		)
	} else if (
		error.errorCode == SourceMappingErrorCode.MissingSourceMapFileInS3
	) {
		return (
			<StackSectionError
				error={error}
				keys={missingSourcemapMetadata}
				title={sourcemapFileTitle}
			>
				{sourcemapFileError}. We couldn't find sourcemap file using the
				'file://' syntax in cloud storage at path{' '}
				<Code>{error.sourceMapURL}</Code>
			</StackSectionError>
		)
	} else if (
		error.errorCode == SourceMappingErrorCode.SourcemapFileMissingInS3AndUrl
	) {
		return (
			<StackSectionError
				error={error}
				keys={missingSourcemapMetadata}
				title={sourcemapFileTitle}
			>
				{sourcemapFileError}. We couldn't find the sourcemap file in
				Highlight storage at path{' '}
				<Code>{error.actualSourcemapFetchedPath}</Code> or at URL{' '}
				<Code>{error.sourceMapURL}</Code>
			</StackSectionError>
		)
	} else if (error.errorCode == SourceMappingErrorCode.InvalidSourceMapUrl) {
		return (
			<StackSectionError
				error={error}
				keys={missingSourcemapMetadata}
				title={sourcemapFileTitle}
			>
				{sourcemapFileError}. We couldn't parse the sourcemap filename X{' '}
				<Code>{error.actualSourcemapFetchedPath}</Code>
			</StackSectionError>
		)
	} else if (error.errorCode == SourceMappingErrorCode.MinifiedFileLarger) {
		return (
			<StackSectionError
				error={error}
				keys={fileSizeLimitMetadata}
				title={fileSizeLimitTitle}
			>
				{fileSizeLimitError}. Minified file{' '}
				<Code>{error.actualMinifiedFetchedPath}</Code> larger than our
				max supported size 128MB
			</StackSectionError>
		)
	} else if (error.errorCode == SourceMappingErrorCode.SourceMapFileLarger) {
		return (
			<StackSectionError
				error={error}
				keys={fileSizeLimitMetadata}
				title={fileSizeLimitTitle}
			>
				{fileSizeLimitError}. Sourcemap file{' '}
				<Code>{error.actualSourcemapFetchedPath}</Code> larger than our
				max supported size 128MB
			</StackSectionError>
		)
	} else if (
		error.errorCode == SourceMappingErrorCode.SourcemapLibraryCouldntParse
	) {
		return (
			<StackSectionError
				error={error}
				keys={sourcemapParseErrorMetadata}
				title={fileParseTitle}
			>
				There was an error parsing the source map file{' '}
				<Code>{error.sourceMapURL}</Code>{' '}
			</StackSectionError>
		)
	} else if (
		error.errorCode ==
		SourceMappingErrorCode.SourcemapLibraryCouldntRetrieveSource
	) {
		return (
			<StackSectionError
				error={error}
				keys={sourcemapParseErrorMetadata}
				title={fileParseTitle}
			>
				Sourcemap library didn't find a valid mapping to the original
				source with line <Code>{error.mappedLineNumber}</Code> and col{' '}
				<Code>{error.mappedColumnNumber}</Code>
			</StackSectionError>
		)
	} else if (
		error.errorCode == SourceMappingErrorCode.ErrorConstructingSourceMapUrl
	) {
		return (
			<StackSectionError
				error={error}
				keys={sourcemapParseErrorMetadata}
				title={fileParseTitle}
			>
				Failed to construct the sourcemap URL from the stacktrace{' '}
				<Code>{error.stackTraceFileURL}</Code>
			</StackSectionError>
		)
	} else {
		return null
	}
}

const METADATA_LABELS: { [key in keyof SourceMappingError]: string } = {
	stackTraceFileURL: 'Stack Trace File URL',
	actualMinifiedFetchedPath: 'Minified Path',
	minifiedFetchStrategy: 'Minified Fetch Strategy',
	minifiedFileSize: 'Minified File Size',
	minifiedLineNumber: 'Minified Line Number',
	minifiedColumnNumber: 'Minified Column Number',
	sourceMapURL: 'Sourcemap URL',
	sourcemapFetchStrategy: 'Sourcemap Fetch Strategy',
	sourcemapFileSize: 'Sourcemap File Size',
	actualSourcemapFetchedPath: 'Sourcemap Fetched Path',
	mappedLineNumber: 'Mapped Line Number',
	mappedColumnNumber: 'Mapped Column Number',
}

const StackSectionError: React.FC<
	React.PropsWithChildren<{
		error: SourceMappingError
		keys: MetadataKey[]
		title: string
	}>
> = ({ children, error, keys, title }) => {
	const { projectId } = useProjectId()
	const [showMetadata, setShowMetadata] = React.useState(false)

	const metadata = keys.reduce((accumulator: any[], key) => {
		if (error[key]) {
			return [
				...accumulator,
				{
					label: METADATA_LABELS[key],
					value: error[key],
				},
			]
		}

		return accumulator
	}, [])

	return (
		<Box
			backgroundColor="white"
			borderRadius="6"
			border="secondary"
			cursor="default"
			hiddenScroll
			overflow="scroll"
			boxShadow="medium"
			paddingTop="8"
			style={{ maxWidth: '450px' }}
		>
			<Box p="8">
				<Stack gap="16">
					<Text size="small" weight="bold">
						{title}
					</Text>
					<Text size="small" weight="medium" color="default">
						{children}
					</Text>
				</Stack>

				{metadata.length > 0 && (
					<Box paddingTop="8">
						<Tag
							onClick={(e) => {
								e.stopPropagation()
								setShowMetadata(!showMetadata)
							}}
							kind="secondary"
							iconRight={<IconSolidCheveronDown />}
							shape="basic"
						>
							{showMetadata ? 'Hide' : 'Show'} metadata
						</Tag>

						{showMetadata && (
							<Box pt="12">
								<Box cssClass={styles.metadataTable}>
									<table style={{ width: '100%' }}>
										{metadata.map((m, index) => (
											<tr
												key={m.label}
												style={{
													verticalAlign: 'middle',
												}}
											>
												<th
													style={{
														borderRight: `1px solid ${vars.theme.static.divider.weak}`,
														borderTop:
															index === 0
																? undefined
																: `1px solid ${vars.theme.static.divider.weak}`,
														width: 150,
													}}
												>
													<Box p="8">
														<Text>{m.label}</Text>
													</Box>
												</th>
												<td
													style={{
														borderTop:
															index === 0
																? undefined
																: `1px solid ${vars.theme.static.divider.weak}`,
													}}
												>
													<Box p="4">
														<Code lines="4" block>
															{m.value}
														</Code>
													</Box>
												</td>
											</tr>
										))}
									</table>
								</Box>
							</Box>
						)}
					</Box>
				)}
			</Box>

			<Box
				borderTop="secondary"
				p="8"
				display="flex"
				justifyContent="flex-end"
				width="full"
			>
				<LinkButton
					to={`/${projectId}/settings/errors`}
					trackingId="sourcemap-settings-link-click-error-details"
				>
					Sourcemap settings
				</LinkButton>
			</Box>
		</Box>
	)
}

const Code: React.FC<{
	block?: boolean
	children?: Maybe<string | number>
	lines?: '1' | '4'
}> = ({ block = false, children, lines = '1' }) => {
	const title = String(children)
	const isBlock = block || title.length > 20

	const code = (
		<Box cssClass={styles.codeContainer}>
			{children && (
				<Text
					color="default"
					lines={lines}
					family="monospace"
					title={title}
					size="xSmall"
				>
					{children}
				</Text>
			)}
		</Box>
	)

	return isBlock ? (
		<Box
			my="4"
			display={children ? 'flex' : 'inline-flex'}
			gap="4"
			alignItems="center"
		>
			{code}
			{children && (
				<Box flexShrink={0} alignItems="center" display="flex">
					<ButtonIcon
						onClick={() =>
							copyToClipboard(title, {
								onCopyText: 'Copied to clipboard',
							})
						}
						emphasis="low"
						icon={<SvgCopyIcon />}
						size="minimal"
					/>
				</Box>
			)}
		</Box>
	) : (
		code
	)
}
