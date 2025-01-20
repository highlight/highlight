import { getSeriesKey } from '@/pages/Graphing/components/Graph'
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
	[
		getSeriesKey({
			aggregator: MetricAggregator.Count,
			column: '',
			groups: [],
		}),
		'#6F6E77',
	],
	[
		getSeriesKey({
			aggregator: MetricAggregator.P90,
			column: 'duration',
			groups: [],
		}),
		'#6346AF',
	],
	[
		getSeriesKey({
			aggregator: MetricAggregator.P50,
			column: 'duration',
			groups: [],
		}),
		'#AD5700',
	],
	[
		getSeriesKey({
			aggregator: MetricAggregator.Avg,
			column: 'duration',
			groups: [],
		}),
		'#3182BD',
	],
	[
		getSeriesKey({
			aggregator: MetricAggregator.Count,
			column: '',
			groups: [LogLevel.Trace],
		}),
		'#1a1523',
	],
	[
		getSeriesKey({
			aggregator: MetricAggregator.Count,
			column: '',
			groups: [LogLevel.Debug],
		}),
		'#6F6E77',
	],
	[
		getSeriesKey({
			aggregator: MetricAggregator.Count,
			column: '',
			groups: [LogLevel.Info],
		}),
		'#744ED4',
	],
	[
		getSeriesKey({
			aggregator: MetricAggregator.Count,
			column: '',
			groups: [LogLevel.Warn],
		}),
		'#FFB224',
	],
	[
		getSeriesKey({
			aggregator: MetricAggregator.Count,
			column: '',
			groups: [LogLevel.Error],
		}),
		'#E5484D',
	],
	[
		getSeriesKey({
			aggregator: MetricAggregator.Count,
			column: '',
			groups: [LogLevel.Fatal],
		}),
		'#CD2B31',
	],
	[
		getSeriesKey({
			aggregator: MetricAggregator.Count,
			column: '',
			groups: [LogLevel.Panic],
		}),
		'#CD2B31',
	],
	[
		getSeriesKey({
			aggregator: MetricAggregator.Count,
			column: '',
			groups: ['Ingested'],
		}),
		vars.theme.static.content.moderate,
	],
	[
		getSeriesKey({
			aggregator: MetricAggregator.Count,
			column: '',
			groups: ['Dropped'],
		}),
		vars.theme.static.divider.weak,
	],
])
