package clickhouse

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestMakeLogRow(t *testing.T) {
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
		t.Error(err)
	}

	assert.Equal(t, uint32(projectID), logRow.ProjectId)
	assert.Equal(t, secureSessionID, logRow.SecureSessionID)
	assert.Equal(t, "info", logRow.SeverityText)
	assert.Equal(t, time.Time(time.Date(2023, time.January, 25, 14, 24, 24, 244000000, time.Local)), logRow.Timestamp)
	assert.Equal(t,
		"Sending: 120 events, 2 messages, 0 network resources, 0 errors \nTo: https://localhost:8082/public\nOrg: 1\nSessionSecureID: 0L4pKSh2LaG51f1Nq3jYb17OCiaM",
		logRow.Body,
	)
}
