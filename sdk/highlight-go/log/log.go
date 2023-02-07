package hlog

import (
	"go.opentelemetry.io/otel/attribute"
)

var (
	LogName        = "log"
	LogSeverityKey = attribute.Key("log.severity")
	LogMessageKey  = attribute.Key("log.message")
)
