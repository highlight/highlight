import { TraceEdge } from '@graph/schemas'

const AccessKeyAccessor = function (accessKey: string) {
	return `node.${accessKey}`
}

const MetricNameAccessor = () => {
	return (row: TraceEdge) => row.node.events?.at(0)?.attributes['metric.name']
}

const MetricValueAccessor = () => {
	return (row: TraceEdge) =>
		row.node.events?.at(0)?.attributes['metric.value']
}

export const ColumnAccessors = {
	accessKey: AccessKeyAccessor,
	metric_name: MetricNameAccessor,
	metric_value: MetricValueAccessor,
} as const
