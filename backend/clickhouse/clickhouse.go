package clickhouse

import (
	"context"
	"crypto/tls"
	"fmt"
	"os"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/highlight-run/highlight/backend/util"
)

type Client struct {
	conn driver.Conn
}

func getDatabase() string {
	if util.IsDevEnv() {
		return os.Getenv("DOPPLER_CONFIG")
	} else {
		return os.Getenv("CLICKHOUSE_DATABASE")
	}
}

var (
	ServerAddr = os.Getenv("CLICKHOUSE_ADDRESS")
	Username   = os.Getenv("CLICKHOUSE_USERNAME")
	Password   = os.Getenv("CLICKHOUSE_PASSWORD")
)

func NewClient() (*Client, error) {
	conn, err := clickhouse.Open(&clickhouse.Options{
		Addr: []string{ServerAddr},
		Auth: clickhouse.Auth{
			Database: getDatabase(),
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

func CreateDatabase() error {
	conn, err := clickhouse.Open(&clickhouse.Options{
		Addr: []string{ServerAddr},
		Auth: clickhouse.Auth{
			// we expect this database to exist in order to create a connection
			// Each "service", a container for databases, should always have this database name present.
			Database: "default",
			Username: Username,
			Password: Password,
		},
		TLS: &tls.Config{},
	})

	if err != nil {
		return err
	}

	return conn.Exec(context.Background(), fmt.Sprintf("CREATE DATABASE `%s`", getDatabase()))
}
