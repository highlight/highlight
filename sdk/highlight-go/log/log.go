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

func Init() {
	logrus.SetReportCaller(true)
	logrus.SetOutput(io.Discard)
	logrus.AddHook(NewHook(WithLevels(
		logrus.PanicLevel,
		logrus.FatalLevel,
		logrus.ErrorLevel,
		logrus.WarnLevel,
		logrus.InfoLevel,
	)))
}
