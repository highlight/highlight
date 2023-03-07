package clickhouse

import (
	"encoding/base64"

	"fmt"
	"strings"
	"time"

	e "github.com/pkg/errors"

	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

func getLogsConnection(edges []*modelInputs.LogEdge, pagination Pagination) *modelInputs.LogsConnection {
	var (
		endCursor       string
		startCursor     string
		hasNextPage     bool
		hasPreviousPage bool
	)

	if pagination.At != nil && len(*pagination.At) > 1 {
		if len(edges) == LogsLimit+3 { // has forward and backwards
			hasNextPage = true
			hasPreviousPage = true

			edges = edges[1:]            // remove first
			edges = edges[:len(edges)-1] // remove last
		} else if len(edges) == LogsLimit+2 { // has forward pagination (not backwards)
			hasNextPage = true
			edges = edges[:len(edges)-1] // remove last
		}

	} else if pagination.After != nil && len(*pagination.After) > 1 {
		if len(edges) == LogsLimit+1 {
			hasNextPage = len(edges) == LogsLimit+1
			edges = edges[:LogsLimit]
		}
	} else if pagination.Before != nil && len(*pagination.Before) > 1 {
		if len(edges) == LogsLimit+1 {
			hasPreviousPage = len(edges) == LogsLimit+1
			edges = edges[1 : LogsLimit-1]
		}
	} else {
		if len(edges) == LogsLimit+1 { // has forward page
			hasNextPage = len(edges) == LogsLimit+1
			edges = edges[:LogsLimit]
		}
	}

	if len(edges) > 0 {
		startCursor = edges[0].Cursor
		endCursor = edges[len(edges)-1].Cursor
	}

	return &modelInputs.LogsConnection{
		Edges: edges,
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
