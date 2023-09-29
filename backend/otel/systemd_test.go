package otel

import (
	"github.com/stretchr/testify/assert"
	"testing"
)

func Test_extractSystemd(t *testing.T) {
	fields := newExtractedFields()
	m := map[string]any{
		"MESSAGE":               "msg king of flavor",
		"__CURSOR":              "abc123",
		"__MONOTONIC_TIMESTAMP": "2353958120941",
		"PRIORITY":              "6",
	}
	extractSystemd(fields, m)
	assert.Equal(t, "msg king of flavor", fields.logBody)
	assert.Equal(t, "Info", fields.logSeverity)
	assert.Equal(t, "abc123", fields.attrs["__CURSOR"])
	assert.Equal(t, "2353958120941", fields.attrs["__MONOTONIC_TIMESTAMP"])
}
