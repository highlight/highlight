package hmetric

import (
	"context"
	"github.com/highlight/highlight/sdk/highlight-go"
	"go.opentelemetry.io/otel/attribute"
	"time"
)

// Histogram tracks the statistical distribution of a set of values on each host.
func Histogram(ctx context.Context, name string, value float64, tags []attribute.KeyValue, rate float64) {
	highlight.RecordMetric(ctx, name, value, tags...)
}

// Timing sends timing information, it is an alias for TimeInMilliseconds
// It is flushed by statsd with percentiles, mean and other info (https://github.com/etsy/statsd/blob/master/docs/metric_types.md#timing)
func Timing(ctx context.Context, name string, value time.Duration, tags []attribute.KeyValue, rate float64) {
	highlight.RecordMetric(ctx, name, value.Seconds(), tags...)
}

// Incr is just Count of 1
// Count tracks how many times something happened per second.
func Incr(ctx context.Context, name string, tags []attribute.KeyValue, rate float64) {
	highlight.RecordMetric(ctx, name, 1, tags...)
}

// Gauge measures the value of a metric at a particular time.
func Gauge(ctx context.Context, name string, value float64, tags []attribute.KeyValue, rate float64) {
	highlight.RecordMetric(ctx, name, value, tags...)
}
