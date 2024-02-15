package hlog

import (
	"testing"

	e "github.com/pkg/errors"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestParseConsoleMessages(t *testing.T) {
	_, err := ParseConsoleMessages("message")

	assert.Error(t, e.New("error decoding message data"), err)

	_, err = ParseConsoleMessages("{\"messages\":[]}")
	require.NoError(t, err)

	rows, err := ParseConsoleMessages("{\"messages\":[{\"type\":\"log\",\"trace\":[{\"columnNumber\":23,\"lineNumber\":18070,\"fileName\":\"http://localhost:8080/dist/index.js\",\"functionName\":\"Logger.log\",\"source\":\"    at Logger.log (http://localhost:8080/dist/index.js:18070:23)\"},{\"columnNumber\":23,\"lineNumber\":18981,\"fileName\":\"http://localhost:8080/dist/index.js\",\"functionName\":\"Highlight.<anonymous>\",\"source\":\"    at Highlight.<anonymous> (http://localhost:8080/dist/index.js:18981:23)\"},{\"columnNumber\":65,\"lineNumber\":18232,\"fileName\":\"http://localhost:8080/dist/index.js\",\"source\":\"    at http://localhost:8080/dist/index.js:18232:65\"},{\"columnNumber\":14,\"lineNumber\":18216,\"fileName\":\"http://localhost:8080/dist/index.js\",\"functionName\":\"__async\",\"source\":\"    at __async (http://localhost:8080/dist/index.js:18216:14)\"},{\"columnNumber\":16,\"lineNumber\":18964,\"fileName\":\"http://localhost:8080/dist/index.js\",\"functionName\":\"Highlight._sendPayload\",\"source\":\"    at Highlight._sendPayload (http://localhost:8080/dist/index.js:18964:16)\"},{\"columnNumber\":24,\"lineNumber\":18924,\"fileName\":\"http://localhost:8080/dist/index.js\",\"functionName\":\"Highlight.<anonymous>\",\"source\":\"    at Highlight.<anonymous> (http://localhost:8080/dist/index.js:18924:24)\"}],\"value\":[\"\\\"[1675706468447]\\\"\",\"\\\"Sending: 55 events, 648 messages, 0 network resources, 4 errors \\\\nTo: http://localhost:8082/public\\\\nOrg: 1\\\\nSessionSecureID: 01wEPww0Ks2yuU0KCaZamFExcnXN\\\"\"],\"time\":1675706468447}]}")
	require.NoError(t, err)

	msg := *rows[0]
	msg.Trace = nil
	message := Message{
		Type: "log",
		Value: []string{
			"[1675706468447]",
			"Sending: 55 events, 648 messages, 0 network resources, 4 errors \nTo: http://localhost:8082/public\nOrg: 1\nSessionSecureID: 01wEPww0Ks2yuU0KCaZamFExcnXN",
		},
		Time: 1675706468447,
	}
	assert.Equal(t, message, msg)

	tr := rows[0].Trace[0]
	trace := MessageTrace{
		ColumnNumber: "23",
		LineNumber:   "18070",
		FileName:     "http://localhost:8080/dist/index.js",
		FunctionName: "Logger.log",
		Source:       "    at Logger.log (http://localhost:8080/dist/index.js:18070:23)",
	}
	assert.Equal(t, trace, tr)
}
