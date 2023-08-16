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

func Test_extractSyslogWithStructuredData(t *testing.T) {
	fields := newExtractedFields()

	fields.logBody = "<165>1 2003-10-11T22:14:15.003Z mymachine.example.com evntslog - ID47 [exampleSDID@32473 iut=\"3\" eventSource=\"Application\" eventID=\"1011\"] BOMAn application event log entry"
	extractSyslog(fields)
	assert.Equal(t, "mymachine.example.com", fields.attrs["hostname"])
	assert.Equal(t, "BOMAn application event log entry", fields.logBody)
	assert.Equal(t, "3", fields.attrs["exampleSDID@32473.iut"])
	assert.Equal(t, "Application", fields.attrs["exampleSDID@32473.eventSource"])
	assert.Equal(t, "1011", fields.attrs["exampleSDID@32473.eventID"])
}
