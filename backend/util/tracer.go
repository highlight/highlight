package util

import (
	"context"

	"github.com/highlight/highlight/sdk/highlight-go"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
)

type MultiSpan struct {
	ddSpan tracer.Span
	hSpan  trace.Span
}

func (s *MultiSpan) Finish(err ...error) {
	// TODO: Clean this up
	if len(err) > 0 && err[0] != nil {
		s.ddSpan.Finish(tracer.WithError(err[0]))
		highlight.RecordSpanError(s.hSpan, err[0])
	} else {
		s.ddSpan.Finish()
	}

	highlight.EndTrace(s.hSpan)
}

func (s *MultiSpan) SetAttribute(key string, value interface{}) {
	s.ddSpan.SetTag(key, value)
	s.hSpan.SetAttributes(attribute.String(key, value.(string)))
}

func (s *MultiSpan) SetOperationName(name string) {
	s.ddSpan.SetOperationName(name)
	s.hSpan.SetName(name)
}

func StartSpanFromContext(ctx context.Context, operationName string, tags ...attribute.KeyValue) (MultiSpan, context.Context) {
	ddOptions := []tracer.StartSpanOption{}
	for _, tag := range tags {
		ddOptions = append(ddOptions, tracer.Tag(string(tag.Key), tag.Value))
	}

	ddSpan, ddCtx := tracer.StartSpanFromContext(ctx, operationName, ddOptions...)
	hSpan, _ := highlight.StartTrace(ctx, operationName, tags...)

	mergedCtx := trace.ContextWithSpan(ddCtx, hSpan)

	return MultiSpan{
		ddSpan: ddSpan,
		hSpan:  hSpan,
	}, mergedCtx
}

func StartSpan(operationName string, tags ...attribute.KeyValue) MultiSpan {
	ddOptions := []tracer.StartSpanOption{}
	for _, tag := range tags {
		ddOptions = append(ddOptions, tracer.Tag(string(tag.Key), tag.Value))
	}

	ddSpan := tracer.StartSpan(operationName, ddOptions...)
	hSpan, _ := highlight.StartTrace(context.Background(), operationName, tags...)

	return MultiSpan{
		ddSpan: ddSpan,
		hSpan:  hSpan,
	}
}

func Tag(key string, name interface{}) attribute.KeyValue {
	return attribute.String(key, name.(string))
}

func ResourceName(name string) attribute.KeyValue {
	return attribute.String("resource_name", name)
}
