import { LogLevel, MetricAggregator } from '@graph/schemas'
import { vars } from '@highlight-run/ui/vars'

export const COLOR_MAPPING: {
	[key in LogLevel | 'Ingested' | 'Dropped']: string
} = {
	// Custom colors from Figma.
	[LogLevel.Trace]: '#1a1523',
	[LogLevel.Debug]: '#6F6E77',
	[LogLevel.Info]: '#744ED4',
	[LogLevel.Warn]: '#FFB224',
	[LogLevel.Error]: '#E5484D',
	[LogLevel.Fatal]: '#CD2B31',
	[LogLevel.Panic]: '#CD2B31',
	Ingested: vars.theme.static.content.moderate,
	Dropped: vars.theme.static.divider.weak,
}

export const LEVEL_COLOR_MAPPING: Map<string, string> = new Map([
	[MetricAggregator.Count, '#6F6E77'],
	[MetricAggregator.P90, '#6346AF'],
	[MetricAggregator.P50, '#AD5700'],
	[MetricAggregator.Avg, '#3182BD'],
	[LogLevel.Trace, '#1a1523'],
	[LogLevel.Debug, '#6F6E77'],
	[LogLevel.Info, '#744ED4'],
	[LogLevel.Warn, '#FFB224'],
	[LogLevel.Error, '#E5484D'],
	[LogLevel.Fatal, '#CD2B31'],
	[LogLevel.Panic, '#CD2B31'],
	['Ingested', vars.theme.static.content.moderate],
	['Dropped', vars.theme.static.divider.weak],
])
