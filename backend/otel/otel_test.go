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

func (m *MockKafkaProducer) Submit(_ context.Context, _ string, message *kafkaqueue.Message) error {
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

	messageCountsByType := map[kafkaqueue.PayloadType]int{}
	for _, message := range producer.messages {
		messageCountsByType[message.Type]++
	}

	expectedMessageCountsByType := fmt.Sprintf("%+v", map[kafkaqueue.PayloadType]int{
		kafkaqueue.PushBackendPayload: 1,
		kafkaqueue.PushLogs:           2,
		kafkaqueue.PushTraces:         512,
	})

	assert.Equal(t, expectedMessageCountsByType, fmt.Sprintf("%+v", messageCountsByType))

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
