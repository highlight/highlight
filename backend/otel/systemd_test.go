package otel

import (
	"github.com/stretchr/testify/assert"
	"testing"
)

func Test_extractSystemd(t *testing.T) {
	fields := newExtractedFields()
	m := map[string]any{
		"foo":                   "msg king of flavor",
		"__CURSOR":              "abc123",
		"__MONOTONIC_TIMESTAMP": "2353958120941",
		"bar":                   "6",
	}
	extractSystemd(fields, m)
	assert.Equal(t, "", fields.logBody)
	assert.Equal(t, "", fields.logSeverity)
	assert.Equal(t, "abc123", fields.attrs["__CURSOR"])
	assert.Equal(t, "2353958120941", fields.attrs["__MONOTONIC_TIMESTAMP"])

	m["PRIORITY"] = "6"
	extractSystemd(fields, m)
	assert.Equal(t, "", fields.logBody)
	assert.Equal(t, "Info", fields.logSeverity)
	assert.Equal(t, "abc123", fields.attrs["__CURSOR"])
	assert.Equal(t, "2353958120941", fields.attrs["__MONOTONIC_TIMESTAMP"])

	m["MESSAGE"] = "msg king of flavor"
	extractSystemd(fields, m)
	assert.Equal(t, "msg king of flavor", fields.logBody)
	assert.Equal(t, "Info", fields.logSeverity)
	assert.Equal(t, "abc123", fields.attrs["__CURSOR"])
	assert.Equal(t, "2353958120941", fields.attrs["__MONOTONIC_TIMESTAMP"])
}
