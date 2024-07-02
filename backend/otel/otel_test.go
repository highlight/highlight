package otel

import (
	"bytes"
	"compress/gzip"
	"context"
	"fmt"
	"github.com/highlight-run/highlight/backend/env"
	"github.com/highlight/highlight/sdk/highlight-go"
	"go.opentelemetry.io/collector/pdata/plog"
	"go.opentelemetry.io/collector/pdata/plog/plogotlp"
	"gorm.io/gorm"
	"net/http"
	"os"
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

var db *gorm.DB
var chClient *clickhouse.Client
var red *redis.Client

func TestMain(m *testing.M) {
	dbName := "highlight_testing_db"
	testLogger := log.WithContext(context.TODO())
	var err error
	db, err = util.CreateAndMigrateTestDB(dbName)
	if err != nil {
		testLogger.Error(e.Wrap(err, "error creating testdb"))
	}
	w := model.Workspace{Model: model.Model{ID: 1}}
	if err := db.Create(&w).Error; err != nil {
		panic(e.Wrap(err, "error inserting workspace"))
	}

	p := model.Project{Model: model.Model{ID: 1}, WorkspaceID: w.ID}
	if err := db.Create(&p).Error; err != nil {
		panic(e.Wrap(err, "error inserting project"))
	}

	chClient, err = clickhouse.NewClient(clickhouse.TestDatabase)
	if err != nil {
		testLogger.Error(e.Wrap(err, "error creating clickhouse client"))
	}

	red = redis.NewClient()

	code := m.Run()
	os.Exit(code)
}

func TestHandler_HandleLog(t *testing.T) {
	inputBytes, err := os.ReadFile("./samples/log.json")
	if err != nil {
		t.Fatalf("error reading: %v", err)
	}

	req := plogotlp.NewExportRequest()
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
	r.Header.Set(highlight.ProjectIDHeader, "123")

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
	h.HandleLog(w, r)

	for _, message := range producer.messages {
		if message.GetType() == kafkaqueue.PushLogsFlattened {
			logRowMessage := message.(*kafka_queue.LogRowMessage)
			assert.Equal(t, kafkaqueue.PushLogsFlattened, message.GetType())
			assert.Equal(t, privateModel.LogSourceBackend, logRowMessage.Source)
			assert.Equal(t, uint32(123), logRowMessage.ProjectId)
		}
	}
}

func TestHandler_HandleTrace(t *testing.T) {
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
				kafkaqueue.PushTracesFlattened: 512, // 512 spans, of which 11 are logs that also save a span
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
				kafkaqueue.PushTracesFlattened: 512, // 512 spans, of which 11 are logs that also save a span
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
			env.Config.Doppler = "prod_aws"
		} else {
			env.Config.Doppler = ""
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

func TestExtractFields_Syslog(t *testing.T) {
	resolver := &public.Resolver{
		Redis:      red,
		Store:      store.NewStore(db, red, integrations.NewIntegrationsClient(db), &storage.FilesystemClient{}, nil, nil),
		DB:         db,
		Clickhouse: chClient,
	}
	h := Handler{
		resolver: resolver,
	}

	projectMapping := &model.IntegrationProjectMapping{
		IntegrationType: privateModel.IntegrationTypeHeroku,
		ExternalID:      "d.xxxxxxxx-yyyy-abcd-1234-deadbeef1234",
		ProjectID:       123,
	}
	if err := db.Model(&projectMapping).Create(&projectMapping).Error; err != nil {
		t.Fatal(err)
	}

	lr := plog.NewLogRecord()
	params := extractFieldsParams{
		logRecord:              &lr,
		herokuProjectExtractor: h.matchHerokuDrain,
	}
	lr.Body().SetStr("56gl9g91 <3>1 2023-07-27T05:43:22.401882Z render render-log-endpoint-test 1 render-log-endpoint-test - Render test log")
	fields, err := extractFields(context.Background(), params)
	assert.NoError(t, err)
	assert.Equal(t, fields.projectIDInt, 2)
	assert.Equal(t, fields.attrs, map[string]string{
		"app_name": "render-log-endpoint-test",
		"facility": "0",
		"hostname": "render",
		"msg_id":   "render-log-endpoint-test",
		"priority": "3",
		"proc_id":  "1",
	})

	lr.Body().SetStr("119 <40>1 2012-11-30T06:45:26+00:00 d.xxxxxxxx-yyyy-abcd-1234-deadbeef1234 heroku 1 web.3 - Starting process with command `bundle exec rackup config.ru -p 24405`")
	fields, err = extractFields(context.Background(), params)
	assert.NoError(t, err)
	assert.Equal(t, "123", fields.projectID)
	assert.Equal(t, 123, fields.projectIDInt)
	assert.Equal(t, map[string]string{
		"app_name": "heroku",
		"facility": "5",
		"hostname": "d.xxxxxxxx-yyyy-abcd-1234-deadbeef1234",
		"msg_id":   "web.3",
		"priority": "40",
		"proc_id":  "1",
	}, fields.attrs)
}
