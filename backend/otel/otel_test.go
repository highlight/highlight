package otel

import (
	"bytes"
	"compress/gzip"
	"context"
	"fmt"
	"net/http"
	"os"
	"strings"
	"testing"

	kafkaqueue "github.com/highlight-run/highlight/backend/kafka-queue"
	"github.com/highlight-run/highlight/backend/private-graph/graph/model"
	public "github.com/highlight-run/highlight/backend/public-graph/graph"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"go.opentelemetry.io/collector/pdata/ptrace/ptraceotlp"
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
			TracesQueue:   &producer,
		},
	}
	h.HandleTrace(w, r)

	assert.Equal(t, 4, len(producer.messages), fmt.Sprintf("%+v", producer.messages))

	_, ok := lo.Find(producer.messages, func(message *kafkaqueue.Message) bool {
		return message.Type == kafkaqueue.PushBackendPayload
	})
	assert.Truef(t, ok, "did not find a PushBackendPayload message")

	_, ok = lo.Find(producer.messages, func(message *kafkaqueue.Message) bool {
		return message.Type == kafkaqueue.PushLogs
	})
	assert.Truef(t, ok, "did not find a PushLogs message")

	_, ok = lo.Find(producer.messages, func(message *kafkaqueue.Message) bool {
		return message.Type == kafkaqueue.PushTraces
	})
	assert.Truef(t, ok, "did not find a PushTraces message")

	allPushLogs := lo.Filter(producer.messages, func(message *kafkaqueue.Message, _ int) bool {
		return message.Type == kafkaqueue.PushLogs
	})

	for _, pushLogs := range allPushLogs {
		if len(pushLogs.PushLogs.LogRows) == 14 {
			for _, log := range pushLogs.PushLogs.LogRows {
				assert.Equal(t, model.LogSourceBackend, log.Source)
			}
		} else if len(pushLogs.PushLogs.LogRows) == 1 {
			for _, log := range pushLogs.PushLogs.LogRows {
				assert.Equal(t, model.LogSourceFrontend, log.Source)
			}
		} else {
			assert.Fail(t, "found a push logs with no log rows")
		}
	}
}
