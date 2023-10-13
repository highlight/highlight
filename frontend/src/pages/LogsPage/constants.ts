import { LogLevel } from '@graph/schemas'

export const COLOR_MAPPING: {
	[key in LogLevel | 'Ingested' | 'Dropped']: string
} = {
	// Custom colors from Figma.
	[LogLevel.Warn]: '#FFB224',
	[LogLevel.Debug]: '#6F6E77',
	[LogLevel.Info]: '#744ED4',
	[LogLevel.Error]: '#E5484D',
	[LogLevel.Fatal]: '#CD2B31',
	[LogLevel.Trace]: '#1a1523',
	Ingested: '#60a030',
	Dropped: '#5220ab',
}
