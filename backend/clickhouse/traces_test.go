package clickhouse

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/highlight-run/highlight/backend/parser"

	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"

	"github.com/stretchr/testify/assert"
)

func TestBatchWriteTraceRows(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()

	rows := []*ClickhouseTraceRow{
		NewTraceRow(now, 1).WithServiceName("gqlgen").AsClickhouseTraceRow(),
	}

	assert.NoError(t, client.BatchWriteTraceRows(ctx, rows))
}

func Test_TraceMatchesQuery(t *testing.T) {
	trace := TraceRow{}
	filters := parser.Parse("os.type:linux resource_name:worker.* service_name:all", TracesTableNoDefaultConfig)
	matches := TraceMatchesQuery(&trace, filters)
	assert.False(t, matches)

	trace = TraceRow{
		ServiceName: "all",
		TraceAttributes: map[string]string{
			"os.type":       "linux",
			"resource_name": "worker.kafka.process",
		},
	}
	filters = parser.Parse("os.type:linux resource_name:worker.* service_name:all", TracesTableNoDefaultConfig)
	matches = TraceMatchesQuery(&trace, filters)
	assert.True(t, matches)
}

func Test_TraceMatchesQuery_v2(t *testing.T) {
	trace := TraceRow{}
	filters := parser.Parse("span_name=fs* OR highlight.type=highlight.internal OR span_name=highlight-metric", TracesTableNoDefaultConfig)
	matches := TraceMatchesQuery(&trace, filters)
	assert.False(t, matches)
	filters = parser.Parse("", TracesTableNoDefaultConfig)
	matches = TraceMatchesQuery(&trace, filters)
	assert.True(t, matches)

	trace = TraceRow{
		UUID:            "ac6e7d25-c70c-4ed0-9c7d-b9653f1b3f07",
		TraceId:         "2660bbaa10e9844e5a78969b8bff841b",
		SpanId:          "f9f2d4ebb43431dd",
		ProjectId:       33452,
		SpanName:        "IsIngestedBy",
		SpanKind:        "Server",
		Duration:        172148,
		ServiceName:     "public-worker-main",
		ServiceVersion:  "721c213bdc1246f7326e779bb161cb7d0098a401",
		TraceAttributes: map[string]string{"host.name": "b00872087f9c", "os.type": "linux", "os.description": "Alpine Linux 3.19.0 (Linux b00872087f9c 6.1.61-85.141.amzn2023.aarch64 #1 SMP Wed Nov  8 00:38:50 UTC 2023 aarch64)", "process.owner": "root", "product": "Sessions", "process.executable.name": "backend", "process.executable.path": "/bin/backend", "process.runtime.description": "go version go1.21.6 linux/arm64", "highlight.key": "524533657", "process.pid": "20", "highlight.type": "highlight.internal", "resource_name": "sampling", "ingested": "true", "process.runtime.version": "go1.21.6", "process.runtime.name": "go"},
		Environment:     "prod",
		StatusCode:      "Unset",
	}
	filters = parser.Parse("span_name=fs* OR highlight.type=highlight.internal OR span_name=highlight-metric", TracesTableNoDefaultConfig)
	matches = TraceMatchesQuery(&trace, filters)
	assert.True(t, matches)
	filters = parser.Parse("span_name=*bean-fs* OR highlight.type=oof OR span_name=swag", TracesTableNoDefaultConfig)
	matches = TraceMatchesQuery(&trace, filters)
	assert.False(t, matches)
	filters = parser.Parse("span_name=*fs* AND highlight.type=highlight.internal AND span_name=highlight-metric", TracesTableNoDefaultConfig)
	matches = TraceMatchesQuery(&trace, filters)
	assert.False(t, matches)

	trace = TraceRow{
		UUID:            "3f25ebd5-a0db-457e-8230-e098eb57725b",
		TraceId:         "37f80926-36d0-4ba0-b1a6-b5ca258e44e7",
		SpanId:          "c58a9be5-2d81-4d44-b0fe-3d68d93424a6",
		SecureSessionId: "eny2Cdx3iMAwMKLfC7a4JVAvSHod",
		ProjectId:       33452,
		SpanName:        "highlight-metric",
		SpanKind:        "Server",
		Duration:        0,
		ServiceVersion:  "0.1",
		TraceAttributes: map[string]string{"group": "body.started", "category": "WebVital"},
		Environment:     "production",
		Events: []*Event{
			{
				Timestamp:  time.Now(),
				Name:       "metric",
				Attributes: map[string]string{"metric.value": "-4.830000000000018", "metric.name": "Jank"},
			},
		},
	}
	filters = parser.Parse("span_name=fs* OR highlight.type=highlight.internal OR highlight-metric", TracesTableNoDefaultConfig)
	matches = TraceMatchesQuery(&trace, filters)
	assert.True(t, matches)
	filters = parser.Parse("span_name=fs* AND highlight.type=highlight.internal AND span_name=highlight-metric", TracesTableNoDefaultConfig)
	matches = TraceMatchesQuery(&trace, filters)
	assert.False(t, matches)

	trace = TraceRow{
		UUID:            "069e75d3-047a-4b6a-9047-a397d0cfc71a",
		TraceId:         "901392a3232bad26e00c94a6f2effe63",
		SpanId:          "0f1590bfa35889dc",
		ParentSpanId:    "51592a8743c7c5c0",
		ProjectId:       33452,
		SpanName:        "fs statSync",
		SpanKind:        "Internal",
		Duration:        54890,
		ServiceName:     "xxx",
		ServiceVersion:  "0.1",
		TraceAttributes: map[string]string{"process.executable.path": "/var/lang/bin/node", "process.runtime.version": "18.18.2", "telemetry.sdk.language": "nodejs", "process.runtime.description": "Node.js", "process.runtime.name": "nodejs", "telemetry.sdk.version": "1.17.1", "process.command": "/var/runtime/index.mjs", "process.executable.name": "/var/lang/bin/node", "process.owner": "sbx_user1051", "telemetry.sdk.name": "opentelemetry", "process.pid": "8"},
		Environment:     "production",
		StatusCode:      "Unset",
	}
	filters = parser.Parse("span_name=fs* OR highlight.type=highlight.internal OR span_name=highlight-metric", TracesTableNoDefaultConfig)
	matches = TraceMatchesQuery(&trace, filters)
	assert.True(t, matches)
	filters = parser.Parse("fs statSync", TracesTableNoDefaultConfig)
	matches = TraceMatchesQuery(&trace, filters)
	assert.True(t, matches)

	trace = TraceRow{
		UUID:            "8a56048f-a3d4-43d3-a7d4-6baed7152efd",
		TraceId:         "3365d26c9e8c0e6ffa63ab98943056b0",
		SpanId:          "08703aa1c0b7dc9e",
		ParentSpanId:    "",
		ProjectId:       37774,
		SpanName:        "GraphqlController#execute",
		SpanKind:        "Server",
		Duration:        413770,
		ServiceName:     "data-whop-com",
		ServiceVersion:  "",
		TraceAttributes: map[string]string{"net.transport": "ip_tcp", "net.peer.port": "6432", "db.statement": ";", "process.runtime.version": "3.2.2", "net.peer.ip": "10.0.3.188", "process.pid": "1", "telemetry.sdk.name": "opentelemetry", "net.peer.name": "10.0.3.188", "db.user": "u4mcrnapd7u8bb", "telemetry.sdk.language": "ruby", "process.runtime.name": "ruby", "db.system": "postgresql", "process.command": "bin/rails", "telemetry.sdk.version": "1.4.1", "process.runtime.description": "ruby 3.2.2 (2023-03-30 revision e51014f9c0) +YJIT [x86_64-linux]", "db.name": "d6a6mot36t737s"},
		Environment:     "production",
		StatusCode:      "Unset",
	}
	filters = parser.Parse(`service_name=data-whop-com parent_span_id=""`, TracesTableNoDefaultConfig)
	matches = TraceMatchesQuery(&trace, filters)
	assert.True(t, matches)

	filters = parser.Parse(`(service_name=data-whop-com AND parent_span_id!="")`, TracesTableNoDefaultConfig)
	matches = TraceMatchesQuery(&trace, filters)
	assert.False(t, matches)

	trace.ParentSpanId = "08703aa1c0b7dc9e"
	matches = TraceMatchesQuery(&trace, filters)
	assert.True(t, matches)
}

func TestReadTracesWithEnvironmentFilter(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()
	rows := []*ClickhouseTraceRow{
		NewTraceRow(now, 1).AsClickhouseTraceRow(),
		NewTraceRow(now, 1).WithEnvironment("production").AsClickhouseTraceRow(),
		NewTraceRow(now, 1).WithEnvironment("development").AsClickhouseTraceRow(),
	}

	assert.NoError(t, client.BatchWriteTraceRows(ctx, rows))

	payload, err := client.ReadTraces(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "environment:production",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, "production", payload.Edges[0].Node.Environment)

	payload, err = client.ReadTraces(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "environment:*dev*",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 1)
	assert.Equal(t, "development", payload.Edges[0].Node.Environment)

	payload, err = client.ReadTraces(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "environment:(production OR development)",
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 2)
}

func TestReadTracesWithSorting(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupTest(t)
	defer teardown(t)

	now := time.Now()
	rows := []*ClickhouseTraceRow{
		NewTraceRow(now, 1).WithSpanName("Span A").WithDuration(now, now.Add(100*time.Nanosecond)).WithTraceAttributes(map[string]string{"host.name": "b"}).AsClickhouseTraceRow(),
		NewTraceRow(now, 1).WithSpanName("Span B").WithDuration(now, now.Add(300*time.Nanosecond)).WithTraceAttributes(map[string]string{"host.name": "c"}).AsClickhouseTraceRow(),
		NewTraceRow(now, 1).WithSpanName("Span C").WithDuration(now, now.Add(200*time.Nanosecond)).WithTraceAttributes(map[string]string{"host.name": "a"}).AsClickhouseTraceRow(),
	}

	assert.NoError(t, client.BatchWriteTraceRows(ctx, rows))

	payload, err := client.ReadTraces(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "",
		Sort: &modelInputs.SortInput{
			Column:    "duration",
			Direction: "DESC",
		},
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 3)

	assert.Equal(t, "Span B", payload.Edges[0].Node.SpanName)
	assert.Equal(t, "Span C", payload.Edges[1].Node.SpanName)
	assert.Equal(t, "Span A", payload.Edges[2].Node.SpanName)

	payload, err = client.ReadTraces(ctx, 1, modelInputs.QueryInput{
		DateRange: makeDateWithinRange(now),
		Query:     "",
		Sort: &modelInputs.SortInput{
			Column:    "host.name",
			Direction: "DESC",
		},
	}, Pagination{})
	assert.NoError(t, err)
	assert.Len(t, payload.Edges, 3)

	for i, edge := range payload.Edges {
		fmt.Printf("Edge %d: %v\n", i, edge.Node)
	}
	assert.Equal(t, "Span B", payload.Edges[0].Node.SpanName)
	assert.Equal(t, "Span A", payload.Edges[1].Node.SpanName)
	assert.Equal(t, "Span C", payload.Edges[2].Node.SpanName)
}
