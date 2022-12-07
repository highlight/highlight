import { SourceMappingError, SourceMappingErrorCode } from '@graph/schemas'
import {
	Box,
	Button,
	IconCaretDown,
	LinkButton,
	Text,
	vars,
} from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import React from 'react'

type Props = React.PropsWithChildren & { error: SourceMappingError }

type MetadataKey = keyof SourceMappingError

const originalFileError =
	'There was an issue accessing the original file for this error'
const sourcemapFileError =
	'There was an issue accessing the sourcemap file for this error'
const fileSizeLimitError = "We couldn't fetch these files due to size limits"

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
			<StackSectionError error={error} keys={missingMinifiedFileMetadata}>
				<Text>
					{originalFileError}. We couldn't find the minified file in
					Highlight storage at path{' '}
					<code>{error.actualMinifiedFetchedPath}</code> or at URL{' '}
					<code>{error.stackTraceFileURL}</code>
				</Text>
			</StackSectionError>
		)
	} else if (
		error.errorCode == SourceMappingErrorCode.FileNameMissingFromSourcePath
	) {
		return (
			<StackSectionError error={error} keys={missingMinifiedFileMetadata}>
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
			<StackSectionError error={error} keys={missingMinifiedFileMetadata}>
				<Text>
					{originalFileError}. We couldn't parse the stack trace file
					name <code>{error.stackTraceFileURL}</code>
				</Text>
			</StackSectionError>
		)
	} else if (
		error.errorCode == SourceMappingErrorCode.MissingSourceMapFileInS3
	) {
		return (
			<StackSectionError error={error} keys={missingSourcemapMetadata}>
				<Text>
					{sourcemapFileError}. We couldn't find sourcemap file using
					the 'file://' syntax in cloud storage at path{' '}
					<code>{error.sourceMapURL}</code>
				</Text>
			</StackSectionError>
		)
	} else if (
		error.errorCode == SourceMappingErrorCode.SourcemapFileMissingInS3AndUrl
	) {
		return (
			<StackSectionError error={error} keys={missingSourcemapMetadata}>
				<Text>
					{sourcemapFileError}. We couldn't find the sourcemap file in
					Highlight storage at path{' '}
					<code>{error.actualSourcemapFetchedPath}</code> or at URL{' '}
					<code>{error.sourceMapURL}</code>
				</Text>
			</StackSectionError>
		)
	} else if (error.errorCode == SourceMappingErrorCode.InvalidSourceMapUrl) {
		return (
			<StackSectionError error={error} keys={missingSourcemapMetadata}>
				<Text>
					{sourcemapFileError}. We couldn't parse the sourcemap
					filename X <code>{error.actualSourcemapFetchedPath}</code>
				</Text>
			</StackSectionError>
		)
	} else if (error.errorCode == SourceMappingErrorCode.MinifiedFileLarger) {
		return (
			<StackSectionError error={error} keys={fileSizeLimitMetadata}>
				<Text>
					{fileSizeLimitError}. Minified file{' '}
					<code>{error.actualMinifiedFetchedPath}</code> larger than
					our max supported size 128MB
				</Text>
			</StackSectionError>
		)
	} else if (error.errorCode == SourceMappingErrorCode.SourceMapFileLarger) {
		return (
			<StackSectionError error={error} keys={fileSizeLimitMetadata}>
				<Text>
					{fileSizeLimitError}. Sourcemap file{' '}
					<code>{error.actualSourcemapFetchedPath}</code> larger than
					our max supported size 128MB
				</Text>
			</StackSectionError>
		)
	} else if (
		error.errorCode == SourceMappingErrorCode.SourcemapLibraryCouldntParse
	) {
		return (
			<StackSectionError error={error} keys={sourcemapParseErrorMetadata}>
				<Text>
					There was an error parsing the source map file{' '}
					<code>{error.sourceMapURL}</code>{' '}
				</Text>
			</StackSectionError>
		)
	} else if (
		error.errorCode ==
		SourceMappingErrorCode.SourcemapLibraryCouldntRetrieveSource
	) {
		return (
			<StackSectionError error={error} keys={sourcemapParseErrorMetadata}>
				<Text>
					Sourcemap library didn't find a valid mapping to the
					original source with line{' '}
					<code>{error.mappedLineNumber}</code> and col{' '}
					<code>{error.mappedColumnNumber}</code>
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
	}>
> = ({ children, error, keys }) => {
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
		<Box borderRadius="6" border="neutral">
			<Box p="12">
				{children}

				{metadata.length > 0 && (
					<Box>
						<Button
							onClick={() => setShowMetadata(!showMetadata)}
							kind="secondary"
							emphasis="low"
							iconRight={<IconCaretDown />}
							size="xSmall"
						>
							{showMetadata ? 'Hide' : 'Show'} metadata
						</Button>

						{showMetadata && (
							<Box pt="12">
								<table style={{ width: '100%' }}>
									{metadata.map((m, index) => (
										<tr
											key={m.label}
											style={{ verticalAlign: 'middle' }}
										>
											<th
												style={{
													borderRight: `1px solid ${vars.color.neutral100}`,
													borderTop:
														index === 0
															? undefined
															: `1px solid ${vars.color.neutral100}`,
												}}
											>
												<Box p="4">
													<Text weight="bold">
														{m.label}
													</Text>
												</Box>
											</th>
											<td
												style={{
													borderTop:
														index === 0
															? undefined
															: `1px solid ${vars.color.neutral100}`,
												}}
											>
												<Box p="4">
													<Box
														background="neutral50"
														borderRadius="3"
														border="neutral"
														p="4"
														display="inline-block"
													>
														<Text family="monospace">
															{m.value}
														</Text>
													</Box>
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
				borderTop="neutral"
				p="4"
				display="flex"
				justifyContent="flex-end"
				width="full"
			>
				<LinkButton to={`/${projectId}/settings/errors`}>
					Sourcemap settings
				</LinkButton>
			</Box>
		</Box>
	)
}
