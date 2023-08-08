package otel

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func Test_extractSyslog(t *testing.T) {
	fields := newExtractedFields()

	fields.logBody = "<1>1 2023-07-27T05:43:22.401882Z render render-log-endpoint-test 1 render-log-endpoint-test - Render test log"
	extractSyslog(fields)
	assert.Equal(t, "render", fields.attrs["hostname"])
	assert.Equal(t, "Render test log", fields.logBody)
}
