package clickhouse

import (
	"github.com/stretchr/testify/assert"
	"testing"
	"time"
)

func Benchmark_replaceTimestampInserts(b *testing.B) {
	ts := time.Now().UnixNano()
	for i := 0; i < b.N; i++ {
		replaceTimestampInserts("INSERT INTO error_groups (ProjectID, CreatedAt, UpdatedAt, ID, Event, Status, Type, ErrorTagID, ErrorTagTitle, ErrorTagDescription) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", []interface{}{
			1, ts, ts + 1, 2, "event", "status", "type", 3, "title", "description",
		}, map[int]bool{0: true, 1: true, 2: true, 7: true, 9: true}, NanoSeconds)
	}
	assert.Less(b, b.Elapsed()/time.Duration(b.N), time.Millisecond)
}
