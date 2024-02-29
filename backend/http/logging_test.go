package http

import (
	"bytes"
	"compress/gzip"
	"fmt"
	"github.com/stretchr/testify/assert"
	"go.opentelemetry.io/otel"
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

func TestMain(m *testing.M) {
	tracer = otel.GetTracerProvider().Tracer("test")

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
