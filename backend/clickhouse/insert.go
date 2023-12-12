package clickhouse

import (
	"fmt"
	"regexp"
	"slices"
)

type TimeUnit uint8

const (
	Seconds      TimeUnit = 0
	MilliSeconds TimeUnit = 3
	MicroSeconds TimeUnit = 6
	NanoSeconds  TimeUnit = 9
)

var pattern = regexp.MustCompile(`\?`)

// replaceTimestampInserts updates direct timestamp inserts to accept int64 unix values
func replaceTimestampInserts(sql string, args []interface{}, numColumns int, columnsToReplace map[int]bool, scale TimeUnit) (string, []interface{}) {
	var replaced, found int
	sql = pattern.ReplaceAllStringFunc(sql, func(s string) string {
		defer func() { found++ }()
		idx := found % numColumns
		if !columnsToReplace[idx] {
			return "?"
		}

		value := args[found-replaced]
		args = slices.Delete(args, found-replaced, found-replaced+1)
		replaced += 1

		return fmt.Sprintf("toDateTime64('%d', %d)", value, scale)
	})
	return sql, args
}
