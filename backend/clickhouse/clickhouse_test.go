package clickhouse

import (
	"context"
	"testing"

	"github.com/sirupsen/logrus"
)

func TestGetConnection(t *testing.T) {
	client, err := NewClient()
	if err != nil {
		logrus.Info("Failed to open connection")
		return
	}

	ctx := context.Background()

	err = client.CreateLogsTable(ctx)

	if err != nil {
		logrus.Info("Failed to create logs table")
	}

	err = client.BatchWriteLogs(ctx)
	if err != nil {
		logrus.Info("Failed to write logs table")
	}

}
