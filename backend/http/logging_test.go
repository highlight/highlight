package http

import (
	"fmt"
	"github.com/stretchr/testify/assert"
	"net/http"
	"strings"
	"testing"
)

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

func TestHandleRawLog(t *testing.T) {
	w := &MockResponseWriter{}
	r, _ := http.NewRequest("POST", fmt.Sprintf("/v1/logs/raw?%s=1jdkoe52&%s=test", LogDrainProjectQueryParam, LogDrainServiceQueryParam), strings.NewReader("yo there, this is the message"))
	HandleRawLog(w, r)
	assert.Equal(t, 200, w.statusCode)
}
