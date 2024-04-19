package clickhouse

import (
	"fmt"
	"regexp"
	"slices"
	"strings"
)

type TimeUnit uint8

const (
	Seconds      TimeUnit = 0
	MilliSeconds TimeUnit = 3
	MicroSeconds TimeUnit = 6
	NanoSeconds  TimeUnit = 9
)

var keysPattern = regexp.MustCompile(`^INSERT INTO \w+ \(([^)]+)\) VALUES`)
var argPattern = regexp.MustCompile(`\?`)

// replaceTimestampInserts updates direct timestamp inserts to accept int64 unix values
func replaceTimestampInserts(sql string, args []interface{}, columnsToReplace map[int]bool, scale TimeUnit) (string, []interface{}) {
	keysMatch := keysPattern.FindStringSubmatch(sql)
	keys := strings.Split(keysMatch[1], ",")
	var replaced, found int
	sql = argPattern.ReplaceAllStringFunc(sql, func(s string) string {
		defer func() { found++ }()
		idx := found % len(keys)
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
