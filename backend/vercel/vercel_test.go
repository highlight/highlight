package vercel

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	http2 "github.com/highlight-run/highlight/backend/http"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	hlog "github.com/highlight/highlight/sdk/highlight-go/log"
	"github.com/openlyinc/pointy"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"go.opentelemetry.io/otel/attribute"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	"go.opentelemetry.io/otel/sdk/trace/tracetest"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
)

var spanRecorder = tracetest.NewSpanRecorder()

func TestMain(m *testing.M) {
	tracer = sdktrace.NewTracerProvider(
		sdktrace.WithSpanProcessor(spanRecorder),
	).Tracer("test")

	code := m.Run()
	os.Exit(code)
}

func TestCreateLogDrain(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/v2/integrations/log-drains" {
			var resp struct {
				Url            string
				Name           string
				Headers        map[string]string
				ProjectIds     []string
				DeliveryFormat string
				Secret         string
				Sources        []string
			}
			data, _ := io.ReadAll(r.Body)
			if err := json.Unmarshal(data, &resp); err != nil {
				t.Error(err)
			}

			assert.Equal(t, "https://pub.highlight.run/vercel/v1/logs", resp.Url)
			assert.Equal(t, "Highlight Log Drain", resp.Name)
			assert.Equal(t, "1", resp.Headers[http2.LogDrainProjectHeader])
			assert.Equal(t, "vercel-project-name", resp.Headers[http2.LogDrainServiceHeader])
			assert.Equal(t, []string{"prj_UYboDfJ3kTGcKmmqu4Ydryzy2KQC"}, resp.ProjectIds)
			assert.Equal(t, "ndjson", resp.DeliveryFormat)
			assert.Equal(t, "1", resp.Secret)
			assert.Equal(t, []string{"static", "lambda", "edge", "build", "external"}, resp.Sources)
		} else if r.URL.Path == "/v9/projects" {
			projectsResponse := struct {
				Projects   []*privateModel.VercelProject `json:"projects"`
				Pagination struct {
					Next int `json:"next"`
				} `json:"pagination"`
			}{
				Projects: []*privateModel.VercelProject{{
					ID:   "prj_UYboDfJ3kTGcKmmqu4Ydryzy2KQC",
					Name: "vercel-project-name",
					Env: []*privateModel.VercelEnv{{
						ID:              "abc",
						Key:             "def",
						ConfigurationID: "456",
					}},
				}},
				Pagination: struct {
					Next int `json:"next"`
				}(struct{ Next int }{
					Next: 0,
				}),
			}
			body, err := json.Marshal(&projectsResponse)
			assert.NoError(t, err)
			_, err = w.Write(body)
			assert.NoError(t, err)
		} else {
			err := fmt.Sprintf("Expected to request '/fixedvalue', got: %s", r.URL.Path)
			t.Error(err)
			http.Error(w, err, http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	ApiBaseUrl = server.URL
	if err := CreateLogDrain(context.TODO(), pointy.String("team_FRV1rjc2RxkhqoTsz8t76fGs"), []string{"prj_UYboDfJ3kTGcKmmqu4Ydryzy2KQC"}, "1", "Highlight Log Drain", "b81LedZpnZtAVrPy5kIdEgWi"); err != nil {
		t.Errorf("failed to create log drain")
	}
}

func TestHandleLog(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(HandleLog))
	defer server.Close()

	body, _ := json.Marshal(&hlog.VercelLog{
		Message:    "hello world",
		StatusCode: 200,
		Proxy: hlog.VercelProxy{
			Region:     "sjc",
			StatusCode: 302,
		},
	})

	req, _ := http.NewRequest("POST", server.URL, bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-highlight-project", "1")
	req.Header.Set("x-highlight-service", "svc")

	client := http.Client{}
	resp, err := client.Do(req)
	assert.NoError(t, err)
	assert.Equal(t, resp.StatusCode, 200)

	spans := spanRecorder.Ended()
	assert.Equal(t, 1, len(spans))
	span := spans[0]
	event := span.Events()[0]
	assert.Equal(t, "highlight.log", span.Name())
	assert.Equal(t, "log", event.Name)

	msg, found := lo.Find(event.Attributes, func(attr attribute.KeyValue) bool {
		return string(attr.Key) == "log.message"
	})
	assert.True(t, found)
	assert.Equal(t, "hello world", msg.Value.AsString())

	assert.Equal(t, 11, len(event.Attributes))

	msg, found = lo.Find(event.Attributes, func(attr attribute.KeyValue) bool {
		return string(attr.Key) == "vercel.statusCode"
	})
	assert.True(t, found)
	assert.Equal(t, "200", msg.Value.AsString())

	msg, found = lo.Find(event.Attributes, func(attr attribute.KeyValue) bool {
		return string(attr.Key) == "vercel.proxy.region"
	})
	assert.True(t, found)
	assert.Equal(t, "sjc", msg.Value.AsString())
}
