package hmetric

import (
	"context"
	"github.com/highlight/highlight/sdk/highlight-go"
	"go.opentelemetry.io/otel/attribute"
	"math/rand"
)

// Histogram tracks the statistical distribution of a set of values on each host.
func Histogram(ctx context.Context, name string, value float64, tags []attribute.KeyValue, rate float64) {
	if rand.Float64() > rate {
		return
	}
	highlight.RecordHistogram(ctx, name, value, tags...)
}

// Incr is just Count of 1
// Count tracks how many times something happened per second.
func Incr(ctx context.Context, name string, tags []attribute.KeyValue, rate float64) {
	if rand.Float64() > rate {
		return
	}
	highlight.RecordCount(ctx, name, 1, tags...)
}

// Gauge measures the value of a metric at a particular time.
func Gauge(ctx context.Context, name string, value float64, tags []attribute.KeyValue, rate float64) {
	if rand.Float64() > rate {
		return
	}
	highlight.RecordMetric(ctx, name, value, tags...)
}
