package http

import (
	"bytes"
	"compress/gzip"
	"fmt"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"go.opentelemetry.io/otel/attribute"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	"go.opentelemetry.io/otel/sdk/trace/tracetest"
	"net/http"
	"os"
	"strings"
	"testing"
)

const PinoBatchJson = `{"logs":[{"level":30,"time":1691719960798,"pid":47069,"hostname":"Vadims-MacBook-Pro.local","msg":"generating sitemap"},{"level":30,"time":1691719961378,"pid":47069,"hostname":"Vadims-MacBook-Pro.local","msg":"got remote data"},{"level":30,"time":1691719961379,"pid":47069,"hostname":"Vadims-MacBook-Pro.local","numPages":91,"msg":"build pages"},{"level":30,"time":1691719965738,"pid":47069,"hostname":"Vadims-MacBook-Pro.local","msg":"generating sitemap"},{"level":30,"time":1691719966256,"pid":47069,"hostname":"Vadims-MacBook-Pro.local","msg":"got remote data"},{"level":30,"time":1691719966256,"pid":47069,"hostname":"Vadims-MacBook-Pro.local","numPages":91,"msg":"build pages"},{"level":30,"time":1691719967152,"pid":47069,"hostname":"Vadims-MacBook-Pro.local","msg":"generating sitemap"},{"level":30,"time":1691719967401,"pid":47069,"hostname":"Vadims-MacBook-Pro.local","msg":"got remote data"},{"level":30,"time":1691719967402,"pid":47069,"hostname":"Vadims-MacBook-Pro.local","numPages":91,"msg":"build pages"},{"level":30,"time":1691719967927,"pid":47069,"hostname":"Vadims-MacBook-Pro.local","msg":"generating sitemap"}]}`

const FlyNDJson = `{"event":{"provider":"app"},"fly":{"app":{"instance":"4d891d77b05118","name":"restless-moon-8905"},"region":"lax"},"host":"f442","log":{"level":"info"},"message":"2023-06-27T01:19:11.788889Z ERROR sink{component_kind=\"sink\" component_id=highlight component_type=http component_name=highlight}:request{request_id=118}: vector::sinks::util::retries: Internal log [Not retriable; dropping the request.] is being rate limited.","timestamp":"2023-06-27T01:19:11.789045558Z"}
{"event":{"provider":"app"},"fly":{"app":{"instance":"4d891d77b05118","name":"restless-moon-8905"},"region":"lax"},"host":"f442","log":{"level":"info"},"message":"2023-06-27T01:19:11.788972Z ERROR sink{component_kind=\"sink\" component_id=highlight component_type=http component_name=highlight}:request{request_id=118}: vector::sinks::util::sink: Response failed. response=Response { status: 400, version: HTTP/1.1, headers: {\"content-length\": \"44\", \"content-type\": \"text/plain; charset=utf-8\", \"date\": \"Tue, 27 Jun 2023 01:19:11 GMT\", \"ngrok-trace-id\": \"6a294abe34d80ed9bd1a4817e091c551\", \"vary\": \"Origin\", \"x-content-type-options\": \"nosniff\"}, body: b\"invalid character '{' after top-level value\\n\" }","timestamp":"2023-06-27T01:19:11.789058388Z"}
{"event":{"provider":"app"},"fly":{"app":{"instance":"4d891d77b05118","name":"restless-moon-8905"},"region":"lax"},"host":"f442","log":{"level":"info"},"message":"2023-06-27T01:19:11.789025Z ERROR sink{component_kind=\"sink\" component_id=highlight component_type=http component_name=highlight}:request{request_id=118}: vector_common::internal_event::service: Internal log [Service call failed. No retries or retries exhausted.] is being rate limited.","timestamp":"2023-06-27T01:19:11.789115699Z"}
{"event":{"provider":"app"},"fly":{"app":{"instance":"4d891d77b05118","name":"restless-moon-8905"},"region":"lax"},"host":"f442","log":{"level":"info"},"message":"2023-06-27T01:19:11.789065Z ERROR sink{component_kind=\"sink\" component_id=highlight component_type=http component_name=highlight}:request{request_id=118}: vector_common::internal_event::component_events_dropped: Internal log [Events dropped] is being rate limited.","timestamp":"2023-06-27T01:19:11.789131359Z"}
{"event":{"provider":"app"},"fly":{"app":{"instance":"4d891d77b05118","name":"restless-moon-8905"},"region":"lax"},"host":"f442","log":{"level":"info"},"message":"2023-06-27T01:19:12.433035Z ERROR sink{component_kind=\"sink\" component_id=highlight component_type=http component_name=highlight}:request{request_id=119}: vector::sinks::util::sink: Response failed. response=Response { status: 400, version: HTTP/1.1, headers: {\"content-length\": \"44\", \"content-type\": \"text/plain; charset=utf-8\", \"date\": \"Tue, 27 Jun 2023 01:19:12 GMT\", \"ngrok-trace-id\": \"40c1f0d311b45ab57e16e9d367628dc3\", \"vary\": \"Origin\", \"x-content-type-options\": \"nosniff\"}, body: b\"invalid character '{' after top-level value\\n\" }","timestamp":"2023-06-27T01:19:12.433213947Z"}
{"event":{"provider":"app"},"fly":{"app":{"instance":"6e82d4e6a37548","name":"fly-builder-autumn-violet-9735"},"region":"lax"},"host":"971e","log":{"level":"info"},"message":"time=\"2023-06-27T01:19:12.541516209Z\" level=debug msg=\"checking docker activity\"","timestamp":"2023-06-27T01:19:12.541906845Z"}
{"event":{"provider":"app"},"fly":{"app":{"instance":"6e82d4e6a37548","name":"fly-builder-autumn-violet-9735"},"region":"lax"},"host":"971e","log":{"level":"info"},"message":"time=\"2023-06-27T01:19:12.541802849Z\" level=debug msg=\"Calling GET /v1.41/containers/json?filters=%7B%22status%22%3A%7B%22running%22%3Atrue%7D%7D&limit=0\"","timestamp":"2023-06-27T01:19:12.542083756Z"}`

const GCPJson = `{"insertId":"o9knqgrvve37m18j","jsonPayload":{"job":"work.email.recurring_queue_new_review_notifications","job-id":"ff0bfe05-d764-4885-adbf-be5c3fd6fa57","job-queue":"qa:kvasir","level":"info","max-retry":5,"msg":"processing task","retry":0,"worker":"asynq"},"labels":{"compute.googleapis.com/resource_name":"gke-staging-spot-pool-4741f477-ts57","k8s-pod/app":"worker","k8s-pod/app_kubernetes_io/managed-by":"shelob","k8s-pod/pod-template-hash":"6cc89b447c","k8s-pod/security_istio_io/tlsMode":"istio","k8s-pod/service_istio_io/canonical-name":"worker","k8s-pod/service_istio_io/canonical-revision":"latest"},"logName":"projects/precisely-staging/logs/stdout","receiveTimestamp":"2024-04-18T11:15:04.985600039Z","resource":{"labels":{"cluster_name":"staging","container_name":"worker","location":"europe-west3-a","namespace_name":"qa","pod_name":"worker-deployment-6cc89b447c-wbksh","project_id":"precisely-staging"},"type":"k8s_container"},"severity":"INFO","timestamp":"2024-04-18T11:15:00Z"}`

type MockResponseWriter struct {
	statusCode int
}

func (m *MockResponseWriter) Header() http.Header {
	return http.Header{}
}

func (m *MockResponseWriter) Write(bytes []byte) (int, error) {
	return 0, nil
}

func (m *MockResponseWriter) WriteHeader(statusCode int) {
	m.statusCode = statusCode
}

var spanRecorder = tracetest.NewSpanRecorder()

func TestMain(m *testing.M) {
	tracer = sdktrace.NewTracerProvider(
		sdktrace.WithSpanProcessor(spanRecorder),
	).Tracer("test")

	code := m.Run()
	os.Exit(code)
}

func TestHandleRawLog(t *testing.T) {
	r, _ := http.NewRequest("POST", fmt.Sprintf("/v1/logs/raw?%s=1jdkoe52&%s=test", LogDrainProjectQueryParam, LogDrainServiceQueryParam), strings.NewReader("yo there, this is the message"))
	w := &MockResponseWriter{}
	HandleRawLog(w, r)
	assert.Equal(t, 200, w.statusCode)
}

func TestHandleFlyJSONLog(t *testing.T) {
	r, _ := http.NewRequest("POST", "/v1/logs/json", strings.NewReader(FlyNDJson))
	r.Header.Set("Content-Type", "application/x-ndjson")
	r.Header.Set(LogDrainProjectHeader, "1")
	w := &MockResponseWriter{}
	HandleJSONLog(w, r)
	assert.Equal(t, 200, w.statusCode)
}

func TestHandlePinoBatchJson(t *testing.T) {
	r, _ := http.NewRequest("POST", "/v1/logs/json?project=1", strings.NewReader(PinoBatchJson))
	r.Header.Set("Content-Type", "application/json")
	w := &MockResponseWriter{}
	HandleJSONLog(w, r)
	assert.Equal(t, 200, w.statusCode)
}

func TestHandleFlyJSONGZIPLog(t *testing.T) {
	b := bytes.Buffer{}
	gz := gzip.NewWriter(&b)
	if _, err := gz.Write([]byte(FlyNDJson)); err != nil {
		t.Fatal(err)
	}
	if err := gz.Close(); err != nil {
		t.Fatal(err)
	}
	r, _ := http.NewRequest("POST", "/v1/logs/json", &b)
	r.Header.Set("Content-Type", "application/x-ndjson")
	r.Header.Set("Content-Encoding", "gzip")
	r.Header.Set(LogDrainProjectHeader, "1")
	r.Header.Set(LogDrainServiceHeader, "foo")
	w := &MockResponseWriter{}
	HandleJSONLog(w, r)
	assert.Equal(t, 200, w.statusCode)
}

func TestHandleGCPJson(t *testing.T) {
	r, _ := http.NewRequest("POST", "/v1/logs/json?project=1jdkoe52&service=backend-service", strings.NewReader(GCPJson))
	r.Header.Set("Content-Type", "application/json")
	w := &MockResponseWriter{}
	HandleJSONLog(w, r)
	assert.Equal(t, 200, w.statusCode)

	spans := spanRecorder.Ended()
	span := spans[len(spans)-1]
	event := span.Events()[0]
	assert.Equal(t, "highlight.log", span.Name())
	assert.Equal(t, "log", event.Name)

	proj, _ := lo.Find(span.Attributes(), func(item attribute.KeyValue) bool {
		return item.Key == "highlight.project_id"
	})
	assert.Equal(t, "1", proj.Value.AsString())

	serv, _ := lo.Find(event.Attributes, func(item attribute.KeyValue) bool {
		return item.Key == "service.name"
	})
	assert.Equal(t, "backend-service", serv.Value.AsString())

	sev, _ := lo.Find(event.Attributes, func(item attribute.KeyValue) bool {
		return item.Key == "severity"
	})
	assert.Equal(t, "INFO", sev.Value.AsString())

	msg, _ := lo.Find(event.Attributes, func(item attribute.KeyValue) bool {
		return item.Key == "jsonPayload.msg"
	})
	assert.Equal(t, "processing task", msg.Value.AsString())
}
