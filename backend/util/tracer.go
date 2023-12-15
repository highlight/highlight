package util

import (
	"context"
	"fmt"
	log "github.com/sirupsen/logrus"

	"github.com/highlight/highlight/sdk/highlight-go"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
)

const KafkaBatchWorkerOp = "KafkaBatchWorker"

type MultiSpan struct {
	hSpan trace.Span
}

func (s *MultiSpan) Finish(err ...error) {
	if len(err) > 1 {
		log.WithContext(context.TODO()).Warnf("Multiple errors passed to MultiSpan.Finish: %+v", err)
	} else if len(err) > 0 && err[0] != nil {
		if s.hSpan != nil {
			highlight.RecordSpanError(s.hSpan, err[0])
		}
	}
	if s.hSpan != nil {
		highlight.EndTrace(s.hSpan)
	}
}

func (s *MultiSpan) SetAttribute(key string, value interface{}) {
	if s.hSpan != nil {
		s.hSpan.SetAttributes(attribute.String(key, fmt.Sprintf("%v", value)))
	}
}

func (s *MultiSpan) SetOperationName(name string) {
	if s.hSpan != nil {
		s.hSpan.SetName(name)
	}
}

type contextKey string

const (
	ContextKeyHighlightTracingDisabled contextKey = "HighlightTracingDisabled"
)

func StartSpanFromContext(ctx context.Context, operationName string, options ...SpanOption) (MultiSpan, context.Context) {
	var cfg SpanConfig
	for _, opt := range options {
		opt(&cfg)
	}

	hTracingDisabled, _ := ctx.Value(ContextKeyHighlightTracingDisabled).(bool)
	hTracingDisabled = hTracingDisabled || cfg.HighlightTracingDisabled
	ctx = context.WithValue(ctx, ContextKeyHighlightTracingDisabled, hTracingDisabled)

	var hSpan trace.Span
	if !hTracingDisabled {
		hSpan, _ = highlight.StartTrace(ctx, operationName, cfg.Tags...)
		ctx = trace.ContextWithSpan(ctx, hSpan)
	}

	return MultiSpan{
		hSpan: hSpan,
	}, ctx
}

func StartSpan(operationName string, options ...SpanOption) MultiSpan {
	var cfg SpanConfig
	for _, opt := range options {
		opt(&cfg)
	}

	var hSpan trace.Span
	if !cfg.HighlightTracingDisabled {
		hSpan, _ = highlight.StartTrace(context.Background(), operationName, cfg.Tags...)
	}

	return MultiSpan{
		hSpan: hSpan,
	}
}

type SpanConfig struct {
	Tags                     []attribute.KeyValue
	HighlightTracingDisabled bool
}

type SpanOption func(cfg *SpanConfig)

func Tag(key string, name interface{}) SpanOption {
	return func(cfg *SpanConfig) {
		if cfg.Tags == nil {
			cfg.Tags = []attribute.KeyValue{}
		}
		cfg.Tags = append(cfg.Tags, attribute.String(key, fmt.Sprintf("%v", name)))
	}
}

func ResourceName(name string) SpanOption {
	return Tag("resource_name", name)
}

func WithHighlightTracingDisabled(disabled bool) SpanOption {
	return func(cfg *SpanConfig) {
		cfg.HighlightTracingDisabled = disabled
	}
}
