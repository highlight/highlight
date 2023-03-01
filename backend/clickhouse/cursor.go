package clickhouse

import (
	"encoding/base64"

	"fmt"
	"strings"
	"time"

	e "github.com/pkg/errors"

	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

func getLogsPayload(logs []*modelInputs.LogEdge, limit uint64) *modelInputs.LogsPayload {
	hasNextPage := uint64(len(logs)) == limit+1

	var endCursor string
	if hasNextPage {
		logs = logs[:limit]
		endCursor = logs[len(logs)-1].Cursor
	}

	return &modelInputs.LogsPayload{
		Edges: logs,
		PageInfo: &modelInputs.PageInfo{
			HasNextPage: hasNextPage,
			EndCursor:   endCursor,
		},
	}
}

func EncodeCursor(t time.Time, uuid string) string {
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
