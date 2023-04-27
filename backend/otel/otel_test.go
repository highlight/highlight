package otel

import (
	"bytes"
	"compress/gzip"
	"context"
	kafkaqueue "github.com/highlight-run/highlight/backend/kafka-queue"
	"github.com/highlight-run/highlight/backend/private-graph/graph/model"
	public "github.com/highlight-run/highlight/backend/public-graph/graph"
	"github.com/stretchr/testify/assert"
	"go.opentelemetry.io/collector/pdata/ptrace/ptraceotlp"
	"net/http"
	"os"
	"strings"
	"testing"
)

type MockKafkaProducer struct {
	messages []*kafkaqueue.Message
}

func (m *MockKafkaProducer) Stop(_ context.Context) {}

func (m *MockKafkaProducer) Receive(_ context.Context) *kafkaqueue.Message { return nil }

func (m *MockKafkaProducer) Submit(_ context.Context, message *kafkaqueue.Message, _ string) error {
	m.messages = append(m.messages, message)
	return nil
}

func (m *MockKafkaProducer) LogStats() {}

type MockResponseWriter struct{}

func (m *MockResponseWriter) Header() http.Header {
	return http.Header{}
}

func (m *MockResponseWriter) Write(bytes []byte) (int, error) {
	return 0, nil
}

func (m *MockResponseWriter) WriteHeader(statusCode int) {}

func TestHandler_HandleLog(t *testing.T) {
	w := &MockResponseWriter{}
	r, _ := http.NewRequest("POST", "", strings.NewReader(""))
	h := Handler{}
	h.HandleLog(w, r)
}
func TestHandler_HandleTrace(t *testing.T) {
	inputBytes, err := os.ReadFile("./samples/traces.json")
	if err != nil {
		t.Fatalf("error reading: %v", err)
	}

	req := ptraceotlp.NewExportRequest()
	if err := req.UnmarshalJSON(inputBytes); err != nil {
		t.Fatal(err)
	}

	body, err := req.MarshalProto()
	if err != nil {
		t.Fatal(err)
	}

	b := bytes.Buffer{}
	gz := gzip.NewWriter(&b)
	if _, err := gz.Write(body); err != nil {
		t.Fatal(err)
	}
	if err := gz.Close(); err != nil {
		t.Fatal(err)
	}

	producer := MockKafkaProducer{}
	w := &MockResponseWriter{}
	r, _ := http.NewRequest("POST", "", bytes.NewReader(b.Bytes()))
	h := Handler{
		resolver: &public.Resolver{
			ProducerQueue: &producer,
			BatchedQueue:  &producer,
		},
	}
	h.HandleTrace(w, r)

	assert.Equal(t, 4, len(producer.messages))
	assert.Equal(t, kafkaqueue.PushBackendPayload, producer.messages[0].Type)
	assert.Equal(t, kafkaqueue.MarkBackendSetup, producer.messages[1].Type)
	if assert.Equal(t, kafkaqueue.PushLogs, producer.messages[2].Type) {
		assert.Equal(t, 14, len(producer.messages[2].PushLogs.LogRows))
		for _, log := range producer.messages[2].PushLogs.LogRows {
			assert.Equal(t, model.LogSourceBackend, log.Source)
		}
	}
	if assert.Equal(t, kafkaqueue.PushLogs, producer.messages[3].Type) {
		assert.Equal(t, 1, len(producer.messages[3].PushLogs.LogRows))
		for _, log := range producer.messages[3].PushLogs.LogRows {
			assert.Equal(t, model.LogSourceFrontend, log.Source)
		}
	}
}
