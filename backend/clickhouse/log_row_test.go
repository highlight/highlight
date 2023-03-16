package clickhouse

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewLogRowWithLogAttributes(t *testing.T) {
	resourceAttributes := map[string]any{"os.description": "Debian GNU/Linux 11 (bullseye)"}
	eventAttributes := map[string]any{"log.severity": "info"} // should be skipped since this is an internal attribute

	logRow := NewLogRow(LogRowPrimaryAttrs{}, WithLogAttributes(resourceAttributes, eventAttributes))

	assert.Equal(t, map[string]string{"os.description": "Debian GNU/Linux 11 (bullseye)"}, logRow.LogAttributes)
}
