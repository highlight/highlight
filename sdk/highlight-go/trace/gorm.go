package htrace

import (
	"go.opentelemetry.io/otel/attribute"
	"gorm.io/gorm"
	"gorm.io/plugin/opentelemetry/tracing"
)

// Deprecated: Use SetupGORMOtel instead.
func SetupGORMTracing(db *gorm.DB, attrs ...attribute.KeyValue) error {
	return db.Use(tracing.NewPlugin(tracing.WithAttributes(attrs...)))
}

func SetupGORMOTel(db *gorm.DB, attrs ...attribute.KeyValue) error {
	return db.Use(tracing.NewPlugin(tracing.WithAttributes(attrs...)))
}
