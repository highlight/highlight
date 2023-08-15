import { LogLevel } from '@graph/schemas'

export const LOG_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss.000000000Z'

export const COLOR_MAPPING: {
	[key in LogLevel]: string
} = {
	// Custom colors from Figma.
	[LogLevel.Warn]: '#FFB224',
	[LogLevel.Debug]: '#6F6E77',
	[LogLevel.Info]: '#744ED4',
	[LogLevel.Error]: '#E5484D',
	[LogLevel.Fatal]: '#CD2B31',
	[LogLevel.Trace]: '#1a1523',
}

export type TIME_MODE = 'fixed-range' | 'permalink'
