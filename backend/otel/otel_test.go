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

	"github.com/highlight-run/highlight/backend/clickhouse"
	"github.com/highlight-run/highlight/backend/integrations"
	kafka_queue "github.com/highlight-run/highlight/backend/kafka-queue"
	model2 "github.com/highlight-run/highlight/backend/public-graph/graph/model"
	"github.com/highlight-run/highlight/backend/redis"
	"github.com/highlight-run/highlight/backend/storage"
	"github.com/highlight-run/highlight/backend/store"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/openlyinc/pointy"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"

	kafkaqueue "github.com/highlight-run/highlight/backend/kafka-queue"
	"github.com/highlight-run/highlight/backend/model"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	public "github.com/highlight-run/highlight/backend/public-graph/graph"
	"github.com/stretchr/testify/assert"
	"go.opentelemetry.io/collector/pdata/ptrace/ptraceotlp"
)

type MockKafkaProducer struct {
	messages []kafkaqueue.RetryableMessage
}

func (m *MockKafkaProducer) Stop(_ context.Context) {}

func (m *MockKafkaProducer) Receive(_ context.Context) kafkaqueue.RetryableMessage { return nil }

func (m *MockKafkaProducer) Submit(_ context.Context, _ string, messages ...kafkaqueue.RetryableMessage) error {
	m.messages = append(m.messages, messages...)
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

func TestMain(m *testing.M) {
	//tracer = otel.GetTracerProvider().Tracer("test")

	code := m.Run()
	os.Exit(code)
}

func TestHandler_HandleLog(t *testing.T) {
	w := &MockResponseWriter{}
	r, _ := http.NewRequest("POST", "", strings.NewReader(""))
	h := Handler{}
	h.HandleLog(w, r)
}

func TestHandler_HandleTrace(t *testing.T) {
	dbName := "highlight_testing_db"
	testLogger := log.WithContext(context.TODO()).WithFields(log.Fields{"DB_HOST": os.Getenv("PSQL_HOST"), "DB_NAME": dbName})
	var err error
	db, err := util.CreateAndMigrateTestDB(dbName)
	if err != nil {
		testLogger.Error(e.Wrap(err, "error creating testdb"))
	}
	w := model.Workspace{Model: model.Model{ID: 1}}
	if err := db.Create(&w).Error; err != nil {
		t.Fatal(e.Wrap(err, "error inserting workspace"))
	}

	p := model.Project{Model: model.Model{ID: 1}, WorkspaceID: w.ID}
	if err := db.Create(&p).Error; err != nil {
		t.Fatal(e.Wrap(err, "error inserting project"))
	}

	chClient, err := clickhouse.NewClient(clickhouse.TestDatabase)
	if err != nil {
		testLogger.Error(e.Wrap(err, "error creating clickhouse client"))
	}

	red := redis.NewClient()
	for file, tc := range map[string]struct {
		expectedMessageCounts map[kafkaqueue.PayloadType]int
		expectedLogCounts     map[privateModel.LogSource]int
		expectedErrors        *int
		expectedErrorEvent    *string
		external              bool
	}{
		"./samples/traces.json": {
			expectedMessageCounts: map[kafkaqueue.PayloadType]int{
				kafkaqueue.PushBackendPayload:  4,   // 4 exceptions, pushed as individual messages
				kafkaqueue.PushLogsFlattened:   15,  // 4 exceptions, 11 logs
				kafkaqueue.PushTracesFlattened: 501, // 512 spans - 11 logs
			},
			expectedLogCounts: map[privateModel.LogSource]int{
				privateModel.LogSourceFrontend: 1,
				privateModel.LogSourceBackend:  14,
			},
		},
		"./samples/external.json": {
			expectedMessageCounts: map[kafkaqueue.PayloadType]int{
				// no errors expected
				kafkaqueue.PushLogsFlattened:   11,  // 11 logs
				kafkaqueue.PushTracesFlattened: 501, // 512 spans - 11 logs
			},
			external: true,
		},
		"./samples/nextjs.json": {
			expectedErrorEvent: pointy.String("Error: /api/app-directory-test"),
		},
		"./samples/fs.json": {
			expectedErrors: pointy.Int(0),
		},
	} {
		if tc.external {
			util.DopplerConfig = "prod_aws"
		} else {
			util.DopplerConfig = ""
		}

		inputBytes, err := os.ReadFile(file)
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

		w := &MockResponseWriter{}
		r, _ := http.NewRequest("POST", "", bytes.NewReader(b.Bytes()))

		producer := MockKafkaProducer{}
		resolver := &public.Resolver{
			Redis:         red,
			Store:         store.NewStore(db, red, integrations.NewIntegrationsClient(db), &storage.FilesystemClient{}, &producer, nil),
			ProducerQueue: &producer,
			BatchedQueue:  &producer,
			TracesQueue:   &producer,
			DB:            db,
			Clickhouse:    chClient,
		}
		h := Handler{
			resolver: resolver,
		}
		h.HandleTrace(w, r)

		var appDirError *model2.BackendErrorObjectInput
		numErrors := 0
		logCountsBySource := map[privateModel.LogSource]int{}
		messageCountsByType := map[kafkaqueue.PayloadType]int{}
		for _, message := range producer.messages {
			messageCountsByType[message.GetType()]++
			if message.GetType() == kafkaqueue.PushLogsFlattened {
				logRowMessage := message.(*kafka_queue.LogRowMessage)
				logCountsBySource[logRowMessage.Source]++
			} else if message.GetType() == kafkaqueue.PushBackendPayload {
				pushPayloadMessage := message.(*kafka_queue.Message)
				appDirError = pushPayloadMessage.PushBackendPayload.Errors[0]
				numErrors += len(pushPayloadMessage.PushBackendPayload.Errors)
			}
		}

		if tc.expectedMessageCounts != nil {
			assert.Equal(t, fmt.Sprintf("%+v", tc.expectedMessageCounts), fmt.Sprintf("%+v", messageCountsByType))
		}

		if tc.expectedErrors != nil {
			assert.Equal(t, *tc.expectedErrors, numErrors)
		}

		if tc.expectedErrorEvent != nil {
			assert.Equal(t, appDirError.Event, *tc.expectedErrorEvent)
			assert.Greater(t, len(appDirError.StackTrace), 100)
		}

		if tc.expectedLogCounts != nil {
			assert.Equal(t, fmt.Sprintf("%+v", tc.expectedLogCounts), fmt.Sprintf("%+v", logCountsBySource))
		}
	}

}
