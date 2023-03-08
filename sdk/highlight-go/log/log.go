package hlog

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/highlight/highlight/sdk/highlight-go"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	semconv "go.opentelemetry.io/otel/semconv/v1.17.0"
	"go.opentelemetry.io/otel/trace"
	"runtime"
)

var (
	LogSeverityKey = attribute.Key(highlight.LogSeverityAttribute)
	LogMessageKey  = attribute.Key(highlight.LogMessageAttribute)
)

type Level = uint32

const (
	ErrorLevel Level = iota
	WarnLevel  Level = iota
	InfoLevel  Level = iota
	DebugLevel Level = iota
)

func levelToString(l Level) string {
	switch l {
	case ErrorLevel:
		return "error"
	case WarnLevel:
		return "warn"
	case InfoLevel:
		return "info"
	case DebugLevel:
		return "debug"
	}
	return ""
}

var printOut = true
var printLevel = DebugLevel

func SetOutput(output bool) {
	printOut = output
}

func SetOutputLevel(print Level) {
	printLevel = print
}

type Printer struct {
	Context context.Context
	Tags    []attribute.KeyValue
}

func (p *Printer) log(level Level, message string) {
	span, _ := highlight.StartTrace(p.Context, "highlight-go/log")
	defer highlight.EndTrace(span)

	attrs := []attribute.KeyValue{
		attribute.String(highlight.ProjectIDAttribute, highlight.GetProjectID()),
		LogSeverityKey.String(levelToString(level)),
		LogMessageKey.String(message),
	}
	if _, file, line, ok := runtime.Caller(1); ok {
		attrs = append(attrs, semconv.CodeFilepathKey.String(file))
		attrs = append(attrs, semconv.CodeLineNumberKey.Int(line))
	}
	attrs = append(attrs, p.Tags...)

	span.AddEvent(highlight.LogEvent, trace.WithAttributes(attrs...))
	if level <= ErrorLevel {
		span.SetStatus(codes.Error, message)
	}

	if printOut {
		if level <= printLevel {
			var tagsStr string
			if len(p.Tags) > 0 {
				s, _ := json.Marshal(p.Tags)
				tagsStr = fmt.Sprintf(" %s", s)
			}
			fmt.Printf("[%s] %s%s\n", levelToString(level), message, tagsStr)
		}
	}
}

func (p *Printer) WithContext(ctx context.Context) *Printer {
	p.Context = ctx
	return p
}

func (p *Printer) WithSession(sessionID string) *Printer {
	p.Tags = append(p.Tags, attribute.String(highlight.SessionIDAttribute, sessionID))
	return p
}

func (p *Printer) WithRequest(requestID string) *Printer {
	p.Tags = append(p.Tags, attribute.String(highlight.RequestIDAttribute, requestID))
	return p
}

func (p *Printer) Debug(message string) {
	p.log(DebugLevel, message)
}

func (p *Printer) Info(message string) {
	p.log(InfoLevel, message)
}

func (p *Printer) Warn(message string) {
	p.log(WarnLevel, message)
}

func (p *Printer) Error(message string) {
	p.log(ErrorLevel, message)
}

func WithContext(ctx context.Context) *Printer {
	p := &Printer{}
	return p.WithContext(ctx)
}

func WithSession(sessionID string) *Printer {
	p := &Printer{}
	return p.WithRequest(sessionID)
}

func WithRequest(requestID string) *Printer {
	p := &Printer{}
	return p.WithRequest(requestID)
}

func Debug(message string) {
	WithContext(context.TODO()).Debug(message)
}

func Info(message string) {
	WithContext(context.TODO()).Info(message)
}

func Warn(message string) {
	WithContext(context.TODO()).Warn(message)
}

func Error(message string) {
	WithContext(context.TODO()).Error(message)
}
