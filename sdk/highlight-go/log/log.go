package hlog

import (
	"github.com/highlight/highlight/sdk/highlight-go"
	"github.com/sirupsen/logrus"
	"go.opentelemetry.io/otel/attribute"
	"io"
)

var (
	LogSeverityKey = attribute.Key(highlight.LogSeverityAttribute)
	LogMessageKey  = attribute.Key(highlight.LogMessageAttribute)
)

// Init configures logrus to ship logs to highlight.io
func Init() {
	logrus.SetReportCaller(true)
	logrus.AddHook(NewHook(WithLevels(logrus.AllLevels...)))
}

// DisableOutput turns off stdout / stderr output from logrus, in case another logger is already used.
func DisableOutput() {
	logrus.SetOutput(io.Discard)
}
