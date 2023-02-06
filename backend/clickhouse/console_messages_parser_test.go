package clickhouse

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestMakeLogRow(t *testing.T) {
	projectID := 1
	secureSessionID := "session_id"

	message := Message{
		Type: "info",
		Value: []string{
			"Log message",
		},
		Time: 1674681864244,
	}

	logRow, err := makeLogRow(projectID, secureSessionID, message)

	if err != nil {
		t.Error(err)
	}

	assert.Equal(t, uint32(projectID), logRow.ProjectId)
	assert.Equal(t, secureSessionID, logRow.SecureSessionId)
	assert.Equal(t, "info", logRow.SeverityText)
	assert.Equal(t, int64(1674681864244), logRow.Timestamp.UnixMilli())
	assert.Equal(t, "Log message", logRow.Body)
	assert.NotNil(t, logRow.TraceId)
}

func TestMakeLogRowWithMultipleValues(t *testing.T) {
	projectID := 1
	secureSessionID := "session_id"

	message := Message{
		Type: "info",
		Value: []string{
			"timestamp",
			"\"Sending: 120 events, 2 messages, 0 network resources, 0 errors \\nTo: https://localhost:8082/public\\nOrg: 1\\nSessionSecureID: 0L4pKSh2LaG51f1Nq3jYb17OCiaM\"",
		},
		Time: 1674681864244,
	}

	logRow, err := makeLogRow(projectID, secureSessionID, message)

	if err != nil {
		t.Log(err)
		t.Fail()
	}

	assert.Equal(t,
		"timestamp Sending: 120 events, 2 messages, 0 network resources, 0 errors \nTo: https://localhost:8082/public\nOrg: 1\nSessionSecureID: 0L4pKSh2LaG51f1Nq3jYb17OCiaM",
		logRow.Body,
	)
}

func TestParseConsoleMessages(t *testing.T) {
	_, err := ParseConsoleMessages(1, "session_id", "message")

	assert.Error(t, errors.New("error decoding message data"), err)

	_, err = ParseConsoleMessages(1, "session_id", "{\"messages\":[]}")
	require.NoError(t, err)

	_, err = ParseConsoleMessages(1, "session_id", "{\"messages\":[{\"type\":\"log\",\"trace\":[{\"columnNumber\":23,\"lineNumber\":18070,\"fileName\":\"http://localhost:8080/dist/index.js\",\"functionName\":\"Logger.log\",\"source\":\"    at Logger.log (http://localhost:8080/dist/index.js:18070:23)\"},{\"columnNumber\":23,\"lineNumber\":18981,\"fileName\":\"http://localhost:8080/dist/index.js\",\"functionName\":\"Highlight.<anonymous>\",\"source\":\"    at Highlight.<anonymous> (http://localhost:8080/dist/index.js:18981:23)\"},{\"columnNumber\":65,\"lineNumber\":18232,\"fileName\":\"http://localhost:8080/dist/index.js\",\"source\":\"    at http://localhost:8080/dist/index.js:18232:65\"},{\"columnNumber\":14,\"lineNumber\":18216,\"fileName\":\"http://localhost:8080/dist/index.js\",\"functionName\":\"__async\",\"source\":\"    at __async (http://localhost:8080/dist/index.js:18216:14)\"},{\"columnNumber\":16,\"lineNumber\":18964,\"fileName\":\"http://localhost:8080/dist/index.js\",\"functionName\":\"Highlight._sendPayload\",\"source\":\"    at Highlight._sendPayload (http://localhost:8080/dist/index.js:18964:16)\"},{\"columnNumber\":24,\"lineNumber\":18924,\"fileName\":\"http://localhost:8080/dist/index.js\",\"functionName\":\"Highlight.<anonymous>\",\"source\":\"    at Highlight.<anonymous> (http://localhost:8080/dist/index.js:18924:24)\"}],\"value\":[\"\\\"[1675706468447]\\\"\",\"\\\"Sending: 55 events, 648 messages, 0 network resources, 4 errors \\\\nTo: https://localhost:8082/public\\\\nOrg: 1\\\\nSessionSecureID: 01wEPww0Ks2yuU0KCaZamFExcnXN\\\"\"],\"time\":1675706468447}]}")
	require.NoError(t, err)
}
