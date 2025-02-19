package htrace

import (
	"github.com/highlight/highlight/sdk/highlight-go"
	"go.opentelemetry.io/otel/attribute"
	"gorm.io/gorm"
	"gorm.io/plugin/opentelemetry/tracing"
)

// Deprecated: Use SetupGORMOtel instead.
func SetupGORMTracing(db *gorm.DB, attrs ...attribute.KeyValue) error {
	return db.Use(tracing.NewPlugin(tracing.WithAttributes(attrs...)))
}

func SetupGORMOTel(db *gorm.DB, projectID string, attrs ...attribute.KeyValue) error {
	attrs = append(attrs, attribute.String(highlight.ProjectIDAttribute, projectID))
	return db.Use(tracing.NewPlugin(tracing.WithAttributes(attrs...)))
}
