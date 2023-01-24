package clickhouse

import (
	"context"
	"crypto/tls"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
)

type Client struct {
	conn driver.Conn
}

func NewClient() (*Client, error) {
	conn, err := clickhouse.Open(&clickhouse.Options{
		Addr: []string{"dxeqfquwoc.us-west-2.aws.clickhouse.cloud:9440"},
		Auth: clickhouse.Auth{
			Database: "default",
			Username: "default",
			Password: "ohpVhTOTVFkC",
		},
		TLS: &tls.Config{},
	})

	return &Client{
		conn: conn,
	}, err
}

func (client *Client) CreateLogsTable(ctx context.Context) error {

	client.conn.Exec(ctx, "DROP TABLE IF EXISTS logs") //nolint:errcheck

	return client.conn.Exec(ctx, `
	CREATE TABLE IF NOT EXISTS logs (
		Timestamp       DateTime64(9) CODEC (Delta, ZSTD(1)),
		SeverityText    LowCardinality(String) CODEC (ZSTD(1)),
		Body            String CODEC (ZSTD(1)),
		ProjectId       String CODEC (ZSTD(1)),
		SecureSessionID Nullable(String) CODEC (ZSTD(1))
	)
	ENGINE = MergeTree()
		PARTITION BY toDate(Timestamp)
		ORDER BY (ProjectId, toUnixTimestamp(Timestamp))
		TTL toDateTime(Timestamp) + toIntervalDay(30)
		SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1;
	`)
}

func (client *Client) BatchWriteLogs(ctx context.Context) error {
	batch, err := client.conn.PrepareBatch(ctx, "INSERT INTO logs")

	if err != nil {
		return err
	}

	for i := 0; i < 1000; i++ {
		err := batch.Append(
			time.Now(),   // Timestamp
			"info",       // SeverityText
			"Body",       // Body
			"project_id", // ProjectId
			"session_id", // SessionID
		)
		if err != nil {
			return err
		}
	}
	return batch.Send()
}
