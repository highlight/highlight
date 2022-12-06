import {
	Maybe,
	SourceMappingError,
	SourceMappingErrorCode,
} from '@graph/schemas'
import { Box, Button } from '@highlight-run/ui'
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
			<GetFormatedStackSectionError
				error={error}
				keys={missingMinifiedFileMetadata}
			>
				{originalFileError}. <br />
				We couldn't find the minified file in Highlight storage at path{' '}
				<code>{error.actualMinifiedFetchedPath}</code> or at URL{' '}
				<code>{error.stackTraceFileURL}</code>
			</GetFormatedStackSectionError>
		)
	} else if (
		error.errorCode == SourceMappingErrorCode.FileNameMissingFromSourcePath
	) {
		return (
			<GetFormatedStackSectionError
				error={error}
				keys={missingMinifiedFileMetadata}
			>
				{originalFileError}. <br />
				We couldn't find a filename associated with this stack frame
			</GetFormatedStackSectionError>
		)
	} else if (
		error.errorCode == SourceMappingErrorCode.ErrorParsingStackTraceFileUrl
	) {
		return (
			<GetFormatedStackSectionError
				error={error}
				keys={missingMinifiedFileMetadata}
			>
				{originalFileError}. <br />
				We couldn't parse the stack trace file name{' '}
				<code>{error.stackTraceFileURL}</code>
			</GetFormatedStackSectionError>
		)
	} else if (
		error.errorCode == SourceMappingErrorCode.MissingSourceMapFileInS3
	) {
		return (
			<GetFormatedStackSectionError
				error={error}
				keys={missingSourcemapMetadata}
			>
				{sourcemapFileError}. <br />
				We couldn't find sourcemap file using the 'file://' syntax in
				cloud storage at path <code>{error.sourceMapURL}</code>
			</GetFormatedStackSectionError>
		)
	} else if (
		error.errorCode == SourceMappingErrorCode.SourcemapFileMissingInS3AndUrl
	) {
		return (
			<GetFormatedStackSectionError
				error={error}
				keys={missingSourcemapMetadata}
			>
				{sourcemapFileError}. <br />
				We couldn't find the sourcemap file in Highlight storage at path{' '}
				<code>{error.actualSourcemapFetchedPath}</code> or at URL{' '}
				<code>{error.sourceMapURL}</code>
			</GetFormatedStackSectionError>
		)
	} else if (error.errorCode == SourceMappingErrorCode.InvalidSourceMapUrl) {
		return (
			<GetFormatedStackSectionError
				error={error}
				keys={missingSourcemapMetadata}
			>
				{sourcemapFileError}. <br />
				We couldn't parse the sourcemap filename X{' '}
				<code>{error.actualSourcemapFetchedPath}</code>
			</GetFormatedStackSectionError>
		)
	} else if (error.errorCode == SourceMappingErrorCode.MinifiedFileLarger) {
		return (
			<GetFormatedStackSectionError
				error={error}
				keys={fileSizeLimitMetadata}
			>
				{fileSizeLimitError}. <br />
				Minified file <code>
					{error.actualMinifiedFetchedPath}
				</code>{' '}
				larger than our max supported size 128MB
			</GetFormatedStackSectionError>
		)
	} else if (error.errorCode == SourceMappingErrorCode.SourceMapFileLarger) {
		return (
			<GetFormatedStackSectionError
				error={error}
				keys={fileSizeLimitMetadata}
			>
				{fileSizeLimitError}. <br />
				Sourcemap file <code>
					{error.actualSourcemapFetchedPath}
				</code>{' '}
				larger than our max supported size 128MB
			</GetFormatedStackSectionError>
		)
	} else if (
		error.errorCode == SourceMappingErrorCode.SourcemapLibraryCouldntParse
	) {
		return (
			<GetFormatedStackSectionError
				error={error}
				keys={sourcemapParseErrorMetadata}
			>
				There was an error parsing the source map file{' '}
				<code>{error.sourceMapURL}</code>{' '}
			</GetFormatedStackSectionError>
		)
	} else if (
		error.errorCode ==
		SourceMappingErrorCode.SourcemapLibraryCouldntRetrieveSource
	) {
		return (
			<GetFormatedStackSectionError
				error={error}
				keys={sourcemapParseErrorMetadata}
			>
				Sourcemap library didn't find a valid mapping to the original
				source with line <code>{error.mappedLineNumber}</code> and col{' '}
				<code>{error.mappedColumnNumber}</code>
			</GetFormatedStackSectionError>
		)
	} else {
		return null
	}
}

const GetFormatedStackSectionError: React.FC<
	React.PropsWithChildren<{
		error: SourceMappingError
		keys: MetadataKey[]
	}>
> = ({ children, error, keys }) => {
	const [showMetadata, setShowMetadata] = React.useState(false)

	return (
		<Box borderRadius="6" p="12" border="neutral">
			{children}

			<Box>
				<Button onClick={() => setShowMetadata(!showMetadata)}>
					{showMetadata ? 'Hide' : 'Show'} metadata
				</Button>

				{showMetadata && (
					<Box pt="12">
						{keys.indexOf('stackTraceFileURL') > -1 && (
							<MetadataKey
								label="Stack Trace File URL"
								value={error.stackTraceFileURL}
							/>
						)}
						{keys.indexOf('actualMinifiedFetchedPath') > -1 && (
							<MetadataKey
								label="Minified Path"
								value={error.actualMinifiedFetchedPath}
							/>
						)}
						{keys.indexOf('minifiedFetchStrategy') > -1 && (
							<MetadataKey
								label="Minified Fetch Strategy"
								value={error.minifiedFetchStrategy}
							/>
						)}
						{keys.indexOf('minifiedFileSize') > -1 && (
							<MetadataKey
								label="Minified File Size"
								value={error.minifiedFileSize}
							/>
						)}
						{keys.indexOf('minifiedLineNumber') > -1 && (
							<MetadataKey
								label="Minified Line Number"
								value={error.minifiedLineNumber}
							/>
						)}
						{keys.indexOf('minifiedColumnNumber') > -1 && (
							<MetadataKey
								label="Minified Column Number"
								value={error.minifiedColumnNumber}
							/>
						)}
						{keys.indexOf('sourceMapURL') > -1 && (
							<MetadataKey
								label="Sourcemap URL"
								value={error.sourceMapURL}
							/>
						)}
						{keys.indexOf('sourcemapFetchStrategy') > -1 && (
							<MetadataKey
								label="Sourcemap Fetch Strategy"
								value={error.sourcemapFetchStrategy}
							/>
						)}
						{keys.indexOf('sourcemapFileSize') > -1 && (
							<MetadataKey
								label="Sourcemap File Size"
								value={error.sourcemapFileSize}
							/>
						)}
						{keys.indexOf('actualSourcemapFetchedPath') > -1 && (
							<MetadataKey
								label="Sourcemap Fetched Path"
								value={error.actualSourcemapFetchedPath}
							/>
						)}
						{keys.indexOf('mappedLineNumber') > -1 && (
							<MetadataKey
								label="Mapped Line Number"
								value={error.mappedLineNumber}
							/>
						)}
						{keys.indexOf('mappedColumnNumber') > -1 && (
							<MetadataKey
								label="Mapped Column Number"
								value={error.mappedColumnNumber}
							/>
						)}
					</Box>
				)}
			</Box>
		</Box>
	)
}
const MetadataKey: React.FC<{
	label: string
	value: Maybe<string | number | undefined>
}> = ({ label, value }) => {
	return (
		<Box>
			<b>{label}</b>: <code>{value}</code>
		</Box>
	)
}
