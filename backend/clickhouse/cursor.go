package clickhouse

import (
	"encoding/base64"

	"fmt"
	"strings"
	"time"

	e "github.com/pkg/errors"

	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

func getLogsConnection(logs []*modelInputs.LogEdge, pagination Pagination) *modelInputs.LogsConnection {
	var (
		endCursor       string
		startCursor     string
		hasNextPage     bool
		hasPreviousPage bool
	)

	if pagination.At != nil && len(*pagination.At) > 1 {
		if len(logs) == Limit+3 { // has forward and backwards
			hasNextPage = true
			hasPreviousPage = true

			logs = logs[1:]           // remove first
			logs = logs[:len(logs)-1] // remove last
		} else if len(logs) == Limit+2 { // has forward pagination (not backwards)
			hasNextPage = true
			logs = logs[:len(logs)-1] // remove last
		}

	} else if pagination.After != nil && len(*pagination.After) > 1 {
		if len(logs) == Limit+1 {
			hasNextPage = len(logs) == Limit+1
			logs = logs[:Limit]
		}
	} else if pagination.Before != nil && len(*pagination.Before) > 1 {
		if len(logs) == Limit+1 {
			hasPreviousPage = len(logs) == Limit+1
			logs = logs[1 : Limit-1]
		}
	}

	startCursor = logs[0].Cursor
	endCursor = logs[len(logs)-1].Cursor

	return &modelInputs.LogsConnection{
		Edges: logs,
		PageInfo: &modelInputs.PageInfo{
			HasNextPage:     hasNextPage,
			HasPreviousPage: hasPreviousPage,
			EndCursor:       endCursor,
			StartCursor:     startCursor,
		},
	}
}

func encodeCursor(t time.Time, uuid string) string {
	key := fmt.Sprintf("%s,%s", t.Format(time.RFC3339Nano), uuid)
	return base64.StdEncoding.EncodeToString([]byte(key))
}
func decodeCursor(encodedCursor string) (timestamp time.Time, uuid string, err error) {
	byt, err := base64.StdEncoding.DecodeString(encodedCursor)
	if err != nil {
		return
	}

	arrStr := strings.Split(string(byt), ",")
	if len(arrStr) != 2 {
		err = e.New("cursor is invalid")
		return
	}

	timestamp, err = time.Parse(time.RFC3339Nano, arrStr[0])
	if err != nil {
		return
	}
	uuid = arrStr[1]
	return
}
