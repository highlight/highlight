package clickhouse

import (
	"context"
	"fmt"
)

func setupClickhouseTestDB() (*Client, error) {
	client, err := NewClient(PrimaryDatabase)
	if err != nil {
		return nil, err
	}

	err = client.Conn.Exec(context.Background(), fmt.Sprintf("CREATE DATABASE IF NOT EXISTS %s", TestDatabase))
	if err != nil {
		return nil, err
	}

	RunMigrations(TestDatabase)

	return NewClient(TestDatabase)
}
