package clickhouse

import (
	"context"
	"fmt"
)

func SetupClickhouseTestDB() (*Client, error) {
	client, err := NewClient(PrimaryDatabase)
	if err != nil {
		return nil, err
	}

	err = client.conn.Exec(context.Background(), fmt.Sprintf("CREATE DATABASE IF NOT EXISTS %s", TestDatabase))
	if err != nil {
		return nil, err
	}

	RunMigrations(context.TODO(), TestDatabase)

	return NewClient(TestDatabase)
}
