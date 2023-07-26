package clickhouse

import (
	"context"
	"fmt"

	e "github.com/pkg/errors"
)

const TracesTable = "traces"

func (client *Client) BatchWriteTraceRows(ctx context.Context, traceRows []*TraceRow) error {
	if len(traceRows) == 0 {
		return nil
	}

	batch, err := client.conn.PrepareBatch(ctx, fmt.Sprintf("INSERT INTO %s", TracesTable))
	if err != nil {
		return e.Wrap(err, "could not prepare traces batch")
	}

	for _, traceRow := range traceRows {
		// TODO: Figure out how we have nil values here
		if traceRow == nil {
			continue
		}

		err = batch.AppendStruct(traceRow)
		if err != nil {
			return err
		}
	}

	return batch.Send()
}
