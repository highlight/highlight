package clickhouse

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestNewLogRowWithLogAttributes(t *testing.T) {
	resourceAttributes := map[string]any{"os.description": "Debian GNU/Linux 11 (bullseye)"}
	eventAttributes := map[string]any{"log.severity": "info"} // should be skipped since this is an internal attribute

	logRow := NewLogRow(time.Now(), 1, WithLogAttributes(resourceAttributes, eventAttributes))

	assert.Equal(t, map[string]string{"os.description": "Debian GNU/Linux 11 (bullseye)"}, logRow.LogAttributes)
}

func TestNewLogRowWithSeverityText(t *testing.T) {
	assert.Equal(t, "warn", NewLogRow(time.Now(), 1, WithSeverityText("WARN")).SeverityText, "it downcases")
	assert.Equal(t, "info", NewLogRow(time.Now(), 1, WithSeverityText("dir")).SeverityText, "it defaults to info when unknown")
	assert.Equal(t, int32(4), NewLogRow(time.Now(), 1, WithSeverityText("dir")).SeverityNumber, "it handles figuring out the severity number")
}
