package hlog

import (
	"context"
	"fmt"
	"github.com/highlight/highlight/sdk/highlight-go"
	"github.com/sirupsen/logrus"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"
	"strings"

	"go.opentelemetry.io/otel/attribute"
	semconv "go.opentelemetry.io/otel/semconv/v1.25.0"
)

// Option applies a configuration to the given config.
type Option func(h *Hook)

// WithLevels sets the logrus logging levels on which the hook is fired.
//
// The default is all levels between logrus.PanicLevel and logrus.WarnLevel inclusive.
func WithLevels(levels ...logrus.Level) Option {
	return func(h *Hook) {
		h.levels = levels
	}
}

// Hook is a logrus hook that adds logs to the active span as events.
type Hook struct {
	levels           []logrus.Level
	errorStatusLevel logrus.Level
}

var _ logrus.Hook = (*Hook)(nil)

// NewHook returns a logrus hook.
func NewHook(opts ...Option) *Hook {
	hook := &Hook{
		levels: []logrus.Level{
			logrus.PanicLevel,
			logrus.FatalLevel,
			logrus.ErrorLevel,
			logrus.WarnLevel,
		},
		errorStatusLevel: logrus.ErrorLevel,
	}

	for _, fn := range opts {
		fn(hook)
	}

	return hook
}

// Fire is a logrus hook that is fired on a new log entry.
func (hook *Hook) Fire(entry *logrus.Entry) error {
	ctx := entry.Context
	if ctx == nil {
		ctx = context.TODO()
	}

	span, _ := highlight.StartTraceWithTimestamp(ctx, highlight.LogrusSpanName, entry.Time, []trace.SpanStartOption{trace.WithSpanKind(trace.SpanKindClient)})
	defer highlight.EndTrace(span)

	msg := entry.Message
	if msg == "" {
		msg = fmt.Sprintf("%+v", entry.Data)
	}
	attrs := []attribute.KeyValue{
		LogSeverityKey.String(levelString(entry.Level)),
		LogMessageKey.String(msg),
	}
	if entry.Caller != nil {
		if entry.Caller.Function != "" {
			attrs = append(attrs, semconv.CodeFunctionKey.String(entry.Caller.Function))
		}
		if entry.Caller.File != "" {
			attrs = append(attrs, semconv.CodeFilepathKey.String(entry.Caller.File))
			attrs = append(attrs, semconv.CodeLineNumberKey.Int(entry.Caller.Line))
		}
	}

	for k, v := range entry.Data {
		attrs = append(attrs, attribute.String(k, fmt.Sprintf("%+v", v)))
	}

	span.AddEvent(highlight.LogEvent, trace.WithAttributes(attrs...))

	if entry.Level <= hook.errorStatusLevel {
		span.SetStatus(codes.Error, msg)
	}

	return nil
}

// Levels returns logrus levels on which this hook is fired.
func (hook *Hook) Levels() []logrus.Level {
	return hook.levels
}

func levelString(lvl logrus.Level) string {
	s := lvl.String()
	if s == "warning" {
		s = "warn"
	}
	return strings.ToUpper(s)
}
