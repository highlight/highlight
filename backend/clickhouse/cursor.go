package clickhouse

import (
	"encoding/base64"

	"fmt"
	"strings"
	"time"

	e "github.com/pkg/errors"

	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

type Edge[T interface{}] struct {
	Cursor string
	Node   *T
}

type Connection[T interface{}] struct {
	Edges    []*Edge[T]
	PageInfo *modelInputs.PageInfo
}

func getConnection[T interface{}](edges []*Edge[T], pagination Pagination) *Connection[T] {
	limit := LogsLimit
	if pagination.Limit != nil {
		limit = *pagination.Limit
	}

	var (
		endCursor       string
		startCursor     string
		hasNextPage     bool
		hasPreviousPage bool
	)

	if pagination.At != nil && len(*pagination.At) > 1 {
		idx := getCursorIdx(edges, *pagination.At)

		beforeCount := idx
		afterCount := len(edges) - idx - 1

		if beforeCount == limit/2+1 { // has backwards pagination
			hasPreviousPage = true
			edges = edges[1:] // remove first
		}

		if afterCount == limit/2+1 { // has forward pagination
			hasNextPage = true
			edges = edges[:len(edges)-1] // remove last
		}
	} else if pagination.After != nil && len(*pagination.After) > 1 {
		hasPreviousPage = true // implicitly true because the passed in cursor should match
		if len(edges) >= limit+1 {
			hasNextPage = true
			edges = edges[:len(edges)-1]
		}
	} else if pagination.Before != nil && len(*pagination.Before) > 1 {
		hasNextPage = true // implicitly true because the passed in cursor should match
		if len(edges) >= limit+1 {
			hasPreviousPage = true
			edges = edges[1 : len(edges)-1]
		}
	} else {
		if len(edges) >= limit+1 { // has forward page
			hasNextPage = len(edges) == limit+1
			edges = edges[:limit]
		}
	}

	if len(edges) > 0 {
		startCursor = edges[0].Cursor
		endCursor = edges[len(edges)-1].Cursor
	}

	return &Connection[T]{
		Edges: edges,
		PageInfo: &modelInputs.PageInfo{
			HasNextPage:     hasNextPage,
			HasPreviousPage: hasPreviousPage,
			EndCursor:       endCursor,
			StartCursor:     startCursor,
		},
	}
}

func getCursorIdx[T interface{}](edges []*Edge[T], cursor string) int {
	for idx, edge := range edges {
		if edge.Cursor == cursor {
			return idx
		}
	}
	return -1
}

func encodeCursor(t time.Time, uuid string) string {
	key := fmt.Sprintf("%s,%s", t.Format(time.RFC3339), uuid)
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

	timestamp, err = time.Parse(time.RFC3339, arrStr[0])
	if err != nil {
		return
	}
	uuid = arrStr[1]
	return
}
