package otel

import (
	"github.com/stretchr/testify/assert"
	"testing"
)

func Test_extractSyslog(t *testing.T) {
	fields := extractedFields{
		logBody: "<1>1 2023-07-27T05:43:22.401882Z render render-log-endpoint-test 1 render-log-endpoint-test - Render test log",
	}
	attrs := map[string]any{}
	extractSyslog(&fields, attrs)
	assert.Equal(t, "render", attrs["hostname"])
	assert.Equal(t, "Render test log", fields.logBody)
}
