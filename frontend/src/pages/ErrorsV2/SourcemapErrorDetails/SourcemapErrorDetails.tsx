import { useAuthContext } from '@authentication/AuthContext'
import { Button } from '@components/Button'
import {
	Maybe,
	SourceMappingError,
	SourceMappingErrorCode,
} from '@graph/schemas'
import {
	Box,
	ButtonIcon,
	Heading,
	IconCaretDown,
	LinkButton,
	Stack,
	Tag,
	Text,
	usePopover,
	vars,
} from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import SvgCopyIcon from '@icons/CopyIcon'
import { copyToClipboard } from '@util/string'
import { showIntercom } from '@util/window'
import React, { useEffect } from 'react'

type Props = React.PropsWithChildren & { error: SourceMappingError }

type MetadataKey = keyof SourceMappingError

const originalFileError =
	'There was an issue accessing the original file for this error'
const originalFileTitle = 'Original File Access Error'

const sourcemapFileError =
	'There was an issue accessing the sourcemap file for this error'
const sourcemapFileTitle = 'Sourcemal File Error'

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
				<Text>
					{originalFileError}. We couldn't find the minified file in
					Highlight storage at path{' '}
					<Code>{error.actualMinifiedFetchedPath}</Code> or at URL{' '}
					<Code>{error.stackTraceFileURL}</Code>
				</Text>
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
				<Text>
					{originalFileError}. We couldn't find a filename associated
					with this stack frame
				</Text>
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
				<Text>
					{originalFileError}. We couldn't parse the stack trace file
					name at URL <Code>{error.stackTraceFileURL}</Code>
				</Text>
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
				<Text>
					{sourcemapFileError}. We couldn't find sourcemap file using
					the 'file://' syntax in cloud storage at path{' '}
					<Code>{error.sourceMapURL}</Code>
				</Text>
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
				<Text>
					{sourcemapFileError}. We couldn't find the sourcemap file in
					Highlight storage at path{' '}
					<Code>{error.actualSourcemapFetchedPath}</Code> or at URL{' '}
					<Code>{error.sourceMapURL}</Code>
				</Text>
			</StackSectionError>
		)
	} else if (error.errorCode == SourceMappingErrorCode.InvalidSourceMapUrl) {
		return (
			<StackSectionError
				error={error}
				keys={missingSourcemapMetadata}
				title={sourcemapFileTitle}
			>
				<Text>
					{sourcemapFileError}. We couldn't parse the sourcemap
					filename X <Code>{error.actualSourcemapFetchedPath}</Code>
				</Text>
			</StackSectionError>
		)
	} else if (error.errorCode == SourceMappingErrorCode.MinifiedFileLarger) {
		return (
			<StackSectionError
				error={error}
				keys={fileSizeLimitMetadata}
				title={fileSizeLimitTitle}
			>
				<Text>
					{fileSizeLimitError}. Minified file{' '}
					<Code>{error.actualMinifiedFetchedPath}</Code> larger than
					our max supported size 128MB
				</Text>
			</StackSectionError>
		)
	} else if (error.errorCode == SourceMappingErrorCode.SourceMapFileLarger) {
		return (
			<StackSectionError
				error={error}
				keys={fileSizeLimitMetadata}
				title={fileSizeLimitTitle}
			>
				<Text>
					{fileSizeLimitError}. Sourcemap file{' '}
					<Code>{error.actualSourcemapFetchedPath}</Code> larger than
					our max supported size 128MB
				</Text>
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
				<Text>
					There was an error parsing the source map file{' '}
					<Code>{error.sourceMapURL}</Code>{' '}
				</Text>
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
				<Text>
					Sourcemap library didn't find a valid mapping to the
					original source with line{' '}
					<Code>{error.mappedLineNumber}</Code> and col{' '}
					<Code>{error.mappedColumnNumber}</Code>
				</Text>
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
	const { mounted } = usePopover()
	const { admin } = useAuthContext()

	useEffect(() => {
		if (!mounted) {
			setShowMetadata(false)
		}
	}, [mounted])

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
		<Box borderRadius="6" border="secondary" cursor="default">
			<Box p="8">
				<Stack gap="12">
					<Heading level="h4">{title}</Heading>
					{children}
				</Stack>

				{metadata.length > 0 && (
					<Box>
						<Tag
							onClick={(e) => {
								e.stopPropagation()
								setShowMetadata(!showMetadata)
							}}
							kind="secondary"
							iconRight={<IconCaretDown />}
							shape="basic"
						>
							{showMetadata ? 'Hide' : 'Show'} metadata
						</Tag>

						{showMetadata && (
							<Box pt="12">
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
													borderRight: `1px solid ${vars.color.n2}`,
													borderTop:
														index === 0
															? undefined
															: `1px solid ${vars.color.n2}`,
													width: 150,
												}}
											>
												<Box p="4">
													<Text>{m.label}</Text>
												</Box>
											</th>
											<td
												style={{
													borderTop:
														index === 0
															? undefined
															: `1px solid ${vars.color.n2}`,
												}}
											>
												<Box p="4">
													<Code lines="4">
														{m.value}
													</Code>
												</Box>
											</td>
										</tr>
									))}
								</table>
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
				gap="8"
			>
				<Button
					kind="secondary"
					onClick={() => showIntercom({ admin })}
					trackingId="sourcemapErrorContact"
				>
					Contact
				</Button>

				<LinkButton to={`/${projectId}/settings/errors`}>
					Sourcemap settings
				</LinkButton>
			</Box>
		</Box>
	)
}

const Code: React.FC<{
	children?: Maybe<string | number>
	lines?: '1' | '4'
}> = ({ children, lines = '1' }) => {
	const title = String(children)

	return (
		<Box
			my="4"
			display={children ? 'flex' : 'inline-flex'}
			gap="4"
			alignItems="center"
		>
			<Box
				backgroundColor="n2"
				padding="3"
				borderRadius="3"
				border="secondary"
				display="inline-block"
			>
				{children && (
					<Text lines={lines} family="monospace" title={title}>
						{children}
					</Text>
				)}
			</Box>
			{children && (
				<Box flexShrink={0}>
					<ButtonIcon
						onClick={() => copyToClipboard(title)}
						emphasis="low"
						icon={<SvgCopyIcon />}
						size="minimal"
					/>
				</Box>
			)}
		</Box>
	)
}
