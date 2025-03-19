package htrace

import (
	"github.com/highlight/highlight/sdk/highlight-go"
	"go.opentelemetry.io/otel/attribute"
	"gorm.io/gorm"
	"gorm.io/plugin/opentelemetry/tracing"
)

// GORMOTelOption represents configuration options for GORM OpenTelemetry tracing
type GORMOTelOption struct {
	// Attributes are additional attributes to add to spans
	Attributes []attribute.KeyValue

	// ExcludeQueryVars if set to true will exclude query variables from spans
	ExcludeQueryVars bool

	// ExcludeMetrics if set to true will exclude metrics from being emitted
	ExcludeMetrics bool

	// QueryFormatter is a function that formats the query before it is traced.
	QueryFormatter func(query string) string
}

// Deprecated: Use SetupGORMOtel instead.
func SetupGORMTracing(db *gorm.DB, attrs ...attribute.KeyValue) error {
	return db.Use(tracing.NewPlugin(tracing.WithAttributes(attrs...)))
}

func SetupGORMOTel(db *gorm.DB, projectID string, opts ...*GORMOTelOption) error {
	tracingOpts := []tracing.Option{
		tracing.WithAttributes(attribute.String(highlight.ProjectIDAttribute, projectID)),
	}

	for _, opt := range opts {
		if opt.Attributes != nil {
			tracingOpts = append(tracingOpts, tracing.WithAttributes(opt.Attributes...))
		}
		if opt.ExcludeQueryVars {
			tracingOpts = append(tracingOpts, tracing.WithoutQueryVariables())
		}
		if opt.ExcludeMetrics {
			tracingOpts = append(tracingOpts, tracing.WithoutMetrics())
		}
		if opt.QueryFormatter != nil {
			tracingOpts = append(tracingOpts, tracing.WithQueryFormatter(opt.QueryFormatter))
		}
	}

	return db.Use(tracing.NewPlugin(tracingOpts...))
}
