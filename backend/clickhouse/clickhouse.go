package clickhouse

import (
	"crypto/tls"
	"os"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
)

type Client struct {
	conn driver.Conn
}

var (
	ServerAddr = os.Getenv("CLICKHOUSE_ADDRESS")
	Database   = os.Getenv("CLICKHOUSE_DATABASE")
	Username   = os.Getenv("CLICKHOUSE_USERNAME")
	Password   = os.Getenv("CLICKHOUSE_PASSWORD")
)

func NewClient() (*Client, error) {
	conn, err := clickhouse.Open(&clickhouse.Options{
		Addr: []string{ServerAddr},
		Auth: clickhouse.Auth{
			Database: Database,
			Username: Username,
			Password: Password,
		},
		TLS:         &tls.Config{},
		DialTimeout: time.Duration(10) * time.Second,
	})

	return &Client{
		conn: conn,
	}, err
}
